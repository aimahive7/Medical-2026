/* ============================================
   SHOBHA MEDICAL STORES — Inward Bill Entry
   CSV Parser, Validation, Stock Integration
   ============================================ */

const Inward = {
  COLLECTION: 'inward_bills',

  /* ---------- CRUD ---------- */

  getAll() {
    return App.getAll(this.COLLECTION);
  },

  getById(id) {
    return App.getById(this.COLLECTION, id);
  },

  save(bill) {
    App.add(this.COLLECTION, bill);
    return bill;
  },

  update(id, updates) {
    return App.update(this.COLLECTION, id, updates);
  },

  deleteBill(id) {
    return App.delete(this.COLLECTION, id);
  },

  /* ---------- SEQUENTIAL NUMBERING ---------- */

  generateInwardNumber() {
    const bills = this.getAll();
    if (bills.length === 0) return 'SM0001';

    // Extract numbers from "SMxxxx" format
    const numbers = bills
      .map(b => {
        const match = b.inward_number ? b.inward_number.match(/SM(\d+)/) : null;
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    const next = max + 1;
    return `SM${String(next).padStart(4, '0')}`;
  },

  /* ---------- BILL CREATION & UPDATE ---------- */

  /**
   * Create or Update an inward bill
   * @param {Object} header - { agency_id, agency_name, bill_no, bill_date, payment_mode, bill_discount_type, bill_discount_value }
   * @param {Array} items  - [{ product_name, batch, expiry, qty, free, mrp, rate, discount_type, discount_value, gst }]
   * @param {String} existingId - Optional, for updating
   * @returns {Object} result
   */
  processBill(header, items, existingId = null) {
    // Validate header
    const errors = this.validateHeader(header);
    if (errors.length > 0) return { success: false, errors };

    // Validate items
    const itemErrors = [];
    items.forEach((item, idx) => {
      const errs = this.validateItem(item, idx);
      itemErrors.push(...errs);
    });

    if (itemErrors.length > 0) return { success: false, errors: itemErrors };

    // Calculate amounts per row
    const processedItems = items.map(item => {
      const qty = parseInt(item.qty) || 0;
      const free = parseInt(item.free) || 0;
      const rate = parseFloat(item.rate) || 0;
      const mrp = parseFloat(item.mrp) || 0;
      const gst = parseFloat(item.gst) || 0;
      const discType = item.discount_type || 'amt';
      const discVal = parseFloat(item.discount_value) || 0;

      const subtotal = qty * rate;
      let discountAmount = 0;
      if (discType === 'perc') {
        discountAmount = (subtotal * discVal) / 100;
      } else {
        discountAmount = discVal;
      }

      const taxable = subtotal - discountAmount;
      const gstAmount = (taxable * gst) / 100;
      const total = taxable + gstAmount;

      return {
        product_name: (item.product_name || '').trim(),
        batch: (item.batch || '').trim(),
        expiry: item.expiry,
        qty,
        free,
        mrp,
        rate,
        discount_type: discType,
        discount_value: discVal,
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        gst,
        taxable_amount: parseFloat(taxable.toFixed(2)),
        gst_amount: parseFloat(gstAmount.toFixed(2)),
        amount: parseFloat(total.toFixed(2))
      };
    });

    // Sum up items
    const totalSubtotal = processedItems.reduce((sum, i) => sum + (i.qty * i.rate), 0);
    const rowDiscounts = processedItems.reduce((sum, i) => sum + i.discount_amount, 0);
    const totalGST = processedItems.reduce((sum, i) => sum + i.gst_amount, 0);
    
    // Global Bill Discount
    const billDiscType = header.bill_discount_type || 'amt';
    const billDiscVal = parseFloat(header.bill_discount_value) || 0;
    
    // Apply global discount on the taxable subtotal (Subtotal - Row Discounts)
    const subtotalAfterRowDisc = totalSubtotal - rowDiscounts;
    let billDiscountAmount = 0;
    if (billDiscType === 'perc') {
      billDiscountAmount = (subtotalAfterRowDisc * billDiscVal) / 100;
    } else {
      billDiscountAmount = billDiscVal;
    }

    const finalCalculatedTotal = (subtotalAfterRowDisc - billDiscountAmount) + totalGST;
    const grandTotal = Math.round(finalCalculatedTotal);
    const roundOff = parseFloat((grandTotal - finalCalculatedTotal).toFixed(2));

    const bill = {
      agency_id: header.agency_id || '',
      agency_name: header.agency_name.trim(),
      bill_no: header.bill_no.trim(),
      bill_date: header.bill_date,
      payment_mode: header.payment_mode,
      bill_discount_type: billDiscType,
      bill_discount_value: billDiscVal,
      bill_discount_amount: parseFloat(billDiscountAmount.toFixed(2)),
      items: processedItems,
      total_subtotal: parseFloat(totalSubtotal.toFixed(2)),
      total_row_discount: parseFloat(rowDiscounts.toFixed(2)),
      total_gst: parseFloat(totalGST.toFixed(2)),
      round_off: roundOff,
      grand_total: grandTotal,
      item_count: processedItems.length,
      total_qty: processedItems.reduce((s, i) => s + i.qty + i.free, 0),
      updated_at: new Date().toISOString()
    };

    let resultBill;
    if (existingId) {
      resultBill = this.update(existingId, bill);
    } else {
      bill.id = Utils.generateId();
      bill.inward_number = this.generateInwardNumber();
      bill.created_at = new Date().toISOString();
      bill.status = 'completed';
      resultBill = this.save(bill);
    }

    // Update stock
    const stockResults = this.processStockUpdate(processedItems);

    return {
      success: true,
      bill: resultBill,
      stockResults
    };
  },

  createBill(header, items) {
    return this.processBill(header, items);
  },

  /* ---------- STOCK INTEGRATION ---------- */

  processStockUpdate(items) {
    const results = [];
    const products = App.getAll('products');

    items.forEach(item => {
      const match = products.find(p =>
        p.name.toLowerCase().trim() === item.product_name.toLowerCase().trim()
      );

      if (match) {
        const existingBatches = App.getProductBatches(match.id);
        const existingBatch = existingBatches.find(
          b => b.batch_number.toLowerCase() === item.batch.toLowerCase()
        );

        if (existingBatch) {
          const newQty = existingBatch.quantity + item.qty;
          const newFree = (existingBatch.free_quantity || 0) + item.free;
          App.update('product_batches', existingBatch.id, {
            quantity: newQty,
            free_quantity: newFree,
            mrp: item.mrp || existingBatch.mrp,
            ptr_rate: item.rate || existingBatch.ptr_rate,
            gst_rate: item.gst || existingBatch.gst_rate
          });
          App.syncProductStock(match.id);

          results.push({
            product_name: item.product_name,
            batch: item.batch,
            status: 'updated',
            message: `Batch exists — updated qty ${existingBatch.quantity} → ${newQty}`
          });
        } else {
          App.addBatch({
            product_id: match.id,
            batch_number: item.batch,
            expiry_date: item.expiry,
            quantity: item.qty,
            free_quantity: item.free,
            ptr_rate: item.rate,
            mrp: item.mrp,
            gst_rate: item.gst
          });

          results.push({
            product_name: item.product_name,
            batch: item.batch,
            status: 'added',
            message: `New batch added with ${item.qty} units`
          });
        }
      } else {
        results.push({
          product_name: item.product_name,
          batch: item.batch,
          status: 'not_found',
          message: 'Product not found in catalog — stock NOT updated'
        });
      }
    });

    return results;
  },

  /* ---------- CSV PARSER ---------- */

  parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return { success: false, error: 'CSV must have a header row.' };

    const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const items = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (!values[0]) continue;
      const row = {};
      headers.forEach((h, idx) => row[h] = (values[idx] || '').trim());
      
      items.push({
        product_name: row.product_name || '',
        batch: row.batch || '',
        expiry: this.normalizeDate(row.expiry),
        qty: parseInt(row.qty) || 0,
        free: parseInt(row.free) || 0,
        mrp: parseFloat(row.mrp) || 0,
        rate: parseFloat(row.rate) || 0,
        discount_type: row.discount_type || 'amt',
        discount_value: parseFloat(row.discount_value) || 0,
        gst: parseFloat(row.gst) || 0
      });
    }
    return { success: true, items };
  },

  parseCSVLine(line) {
    const result = [];
    let current = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
      else current += ch;
    }
    result.push(current);
    return result;
  },

  normalizeDate(dateStr) {
    if (!dateStr) return '';
    // Handle YYYY-MM (standard month input)
    if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`;
    // Handle YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Handle DD/MM/YYYY or DD-MM-YYYY
    const dmy = (dateStr || '').match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
    return dateStr;
  },

  validateHeader(header) {
    const errors = [];
    if (!header.agency_name) errors.push('Agency is required');
    if (!header.bill_no) errors.push('Bill Number is required');
    if (!header.bill_date) errors.push('Bill Date is required');
    return errors;
  },

  validateItem(item, idx) {
    const errors = [];
    const row = `Row ${idx + 1}`;
    if (!item.product_name) errors.push(`${row}: Product name is required`);
    if (!item.batch) errors.push(`${row}: Batch is required`);
    if (!item.expiry) errors.push(`${row}: Expiry is required`);
    if (isNaN(item.qty) || item.qty < 0) errors.push(`${row}: Qty must be >= 0`);
    return errors;
  },

  checkDuplicateBatches(items) {
    return [];
  },

  getStats() {
    const bills = this.getAll();
    return {
      totalBills: bills.length,
      totalValue: bills.reduce((s, b) => s + (b.grand_total || 0), 0),
      monthlyBills: bills.filter(b => new Date(b.created_at).getMonth() === new Date().getMonth()).length,
      uniqueAgencies: [...new Set(bills.map(b => b.agency_name))].length
    };
  },

  getSampleCSV() {
    return "product_name,batch,expiry,qty,free,mrp,rate,discount_type,discount_value,gst\nDolo 650mg,BAT001,2027-12-31,100,0,30,22,perc,5,5";
  }
};

window.Inward = Inward;
