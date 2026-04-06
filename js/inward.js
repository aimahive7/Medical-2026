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

  /* ---------- BILL CREATION ---------- */

  /**
   * Create an inward bill from form data
   * @param {Object} header - { agency_name, bill_no, bill_date, payment_mode }
   * @param {Array} items  - [{ product_name, batch, expiry, qty, free, mrp, rate, gst }]
   * @returns {Object} saved bill
   */
  createBill(header, items) {
    // Validate header
    const errors = this.validateHeader(header);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Validate items
    const itemErrors = [];
    items.forEach((item, idx) => {
      const errs = this.validateItem(item, idx);
      itemErrors.push(...errs);
    });

    if (itemErrors.length > 0) {
      return { success: false, errors: itemErrors };
    }

    // Calculate amounts
    const processedItems = items.map(item => {
      const qty = parseInt(item.qty) || 0;
      const free = parseInt(item.free) || 0;
      const rate = parseFloat(item.rate) || 0;
      const mrp = parseFloat(item.mrp) || 0;
      const gst = parseFloat(item.gst) || 0;
      const amount = qty * rate;
      const gstAmount = (amount * gst) / 100;

      return {
        product_name: item.product_name.trim(),
        batch: item.batch.trim(),
        expiry: item.expiry,
        qty,
        free,
        mrp,
        rate,
        gst,
        amount: parseFloat(amount.toFixed(2)),
        gst_amount: parseFloat(gstAmount.toFixed(2)),
        total: parseFloat((amount + gstAmount).toFixed(2))
      };
    });

    const subtotal = processedItems.reduce((sum, i) => sum + i.amount, 0);
    const totalGST = processedItems.reduce((sum, i) => sum + i.gst_amount, 0);
    const grandTotal = subtotal + totalGST;

    const bill = {
      id: Utils.generateId(),
      inward_number: Utils.generateNumber('INW'),
      agency_name: header.agency_name.trim(),
      bill_no: header.bill_no.trim(),
      bill_date: header.bill_date,
      payment_mode: header.payment_mode,
      items: processedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      total_gst: parseFloat(totalGST.toFixed(2)),
      grand_total: parseFloat(grandTotal.toFixed(2)),
      item_count: processedItems.length,
      total_qty: processedItems.reduce((s, i) => s + i.qty + i.free, 0),
      status: 'completed',
      created_at: new Date().toISOString()
    };

    this.save(bill);

    // Update stock for matched products
    const stockResults = this.processStockUpdate(processedItems);

    return {
      success: true,
      bill,
      stockResults
    };
  },

  /* ---------- STOCK INTEGRATION ---------- */

  /**
   * Process stock update: match products by name, add batches
   */
  processStockUpdate(items) {
    const results = [];
    const products = App.getAll('products');

    items.forEach(item => {
      // Try to find matching product (case-insensitive)
      const match = products.find(p =>
        p.name.toLowerCase().trim() === item.product_name.toLowerCase().trim()
      );

      if (match) {
        // Check for duplicate batch
        const existingBatches = App.getProductBatches(match.id);
        const isDuplicate = existingBatches.some(
          b => b.batch_number.toLowerCase() === item.batch.toLowerCase()
        );

        if (isDuplicate) {
          // Update existing batch quantity
          const existingBatch = existingBatches.find(
            b => b.batch_number.toLowerCase() === item.batch.toLowerCase()
          );
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

          // Log stock history
          App.add('stock_history', {
            id: Utils.generateId(),
            product_id: match.id,
            batch_id: existingBatch.id,
            batch_number: item.batch,
            product_name: match.name,
            qty_before: existingBatch.quantity,
            qty_after: newQty,
            action: 'inward_update',
            timestamp: new Date().toISOString()
          });

          results.push({
            product_name: item.product_name,
            batch: item.batch,
            status: 'updated',
            message: `Batch exists — updated qty ${existingBatch.quantity} → ${newQty}`
          });
        } else {
          // Add new batch
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

  /**
   * Parse CSV text into array of row objects
   * Expected columns: product_name, batch, expiry, qty, free, mrp, rate, gst
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { success: false, error: 'CSV must have a header row and at least one data row.' };
    }

    // Parse header
    const headerLine = lines[0];
    const headers = this.parseCSVLine(headerLine).map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

    // Required columns
    const requiredCols = ['product_name', 'batch', 'expiry', 'qty', 'mrp', 'rate', 'gst'];
    const missingCols = requiredCols.filter(col => !headers.includes(col));

    if (missingCols.length > 0) {
      return {
        success: false,
        error: `Missing columns: ${missingCols.join(', ')}. Required: ${requiredCols.join(', ')}`
      };
    }

    // Parse data rows
    const items = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      const row = {};

      headers.forEach((h, idx) => {
        row[h] = (values[idx] || '').trim();
      });

      // Convert types
      try {
        items.push({
          product_name: row.product_name || '',
          batch: row.batch || '',
          expiry: this.normalizeDate(row.expiry),
          qty: parseInt(row.qty) || 0,
          free: parseInt(row.free) || 0,
          mrp: parseFloat(row.mrp) || 0,
          rate: parseFloat(row.rate) || 0,
          gst: parseFloat(row.gst) || 0,
          _row: i + 1
        });
      } catch (e) {
        parseErrors.push(`Row ${i + 1}: ${e.message}`);
      }
    }

    if (parseErrors.length > 0) {
      return { success: false, error: parseErrors.join('\n') };
    }

    return { success: true, items, headers };
  },

  /**
   * Parse a single CSV line respecting quoted fields
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  },

  /**
   * Normalize various date formats into YYYY-MM-DD
   * Supports: dd-mm-yyyy, dd/mm/yyyy, yyyy-mm-dd, mm/yyyy
   */
  normalizeDate(dateStr) {
    if (!dateStr) return '';
    dateStr = dateStr.trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    // DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // MM/YYYY or MM-YYYY (last day of month)
    const myMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{4})$/);
    if (myMatch) {
      const [, m, y] = myMatch;
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
      return `${y}-${m.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    return dateStr; // fallback
  },

  /* ---------- VALIDATION ---------- */

  validateHeader(header) {
    const errors = [];
    if (!header.agency_name || !header.agency_name.trim()) {
      errors.push('Agency Name is required');
    }
    if (!header.bill_no || !header.bill_no.trim()) {
      errors.push('Bill Number is required');
    }
    if (!header.bill_date) {
      errors.push('Bill Date is required');
    }
    return errors;
  },

  validateItem(item, idx) {
    const errors = [];
    const rowLabel = `Row ${idx + 1}`;

    if (!item.product_name || !item.product_name.trim()) {
      errors.push(`${rowLabel}: Product Name is required`);
    }
    if (!item.batch || !item.batch.trim()) {
      errors.push(`${rowLabel}: Batch is required`);
    }
    if (!item.expiry) {
      errors.push(`${rowLabel}: Expiry date is required`);
    } else if (Utils.isExpired(item.expiry)) {
      errors.push(`${rowLabel}: Product "${item.product_name}" with batch "${item.batch}" has expired (${Utils.formatDate(item.expiry)})`);
    }

    const qty = parseInt(item.qty);
    if (isNaN(qty) || qty <= 0) {
      errors.push(`${rowLabel}: Quantity must be a positive number`);
    }

    const mrp = parseFloat(item.mrp);
    if (isNaN(mrp) || mrp <= 0) {
      errors.push(`${rowLabel}: MRP must be a positive number`);
    }

    const rate = parseFloat(item.rate);
    if (isNaN(rate) || rate <= 0) {
      errors.push(`${rowLabel}: Rate must be a positive number`);
    }

    const gst = parseFloat(item.gst);
    if (isNaN(gst) || gst < 0) {
      errors.push(`${rowLabel}: GST must be a non-negative number`);
    }

    return errors;
  },

  /**
   * Check for duplicate batch warnings across all products
   */
  checkDuplicateBatches(items) {
    const warnings = [];
    const products = App.getAll('products');
    const allBatches = App.getAll('product_batches');

    items.forEach((item, idx) => {
      // Check within CSV itself
      const duplicatesInCSV = items.filter(
        (other, otherIdx) => otherIdx !== idx &&
          other.batch.toLowerCase() === item.batch.toLowerCase() &&
          other.product_name.toLowerCase() === item.product_name.toLowerCase()
      );
      if (duplicatesInCSV.length > 0) {
        warnings.push(`Row ${idx + 1}: Duplicate batch "${item.batch}" for "${item.product_name}" found within the CSV`);
      }

      // Check existing batches in system
      const matchProduct = products.find(
        p => p.name.toLowerCase().trim() === item.product_name.toLowerCase().trim()
      );
      if (matchProduct) {
        const existingBatch = allBatches.find(
          b => b.product_id === matchProduct.id &&
            b.batch_number.toLowerCase() === item.batch.toLowerCase()
        );
        if (existingBatch) {
          warnings.push(`Row ${idx + 1}: Batch "${item.batch}" already exists for "${item.product_name}" (current stock: ${existingBatch.quantity}). Quantity will be ADDED.`);
        }
      }
    });

    return warnings;
  },

  /* ---------- STATS ---------- */

  getStats() {
    const bills = this.getAll();
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyBills = bills.filter(b => new Date(b.created_at) >= thisMonth);

    return {
      totalBills: bills.length,
      totalValue: bills.reduce((s, b) => s + (b.grand_total || 0), 0),
      monthlyBills: monthlyBills.length,
      monthlyValue: monthlyBills.reduce((s, b) => s + (b.grand_total || 0), 0),
      totalProducts: bills.reduce((s, b) => s + (b.total_qty || 0), 0),
      uniqueAgencies: [...new Set(bills.map(b => b.agency_name))].length
    };
  },

  /**
   * Generate sample CSV for download
   */
  getSampleCSV() {
    return `product_name,batch,expiry,qty,free,mrp,rate,gst
Dolo 650mg,DOL25A01,15-06-2027,100,10,32,22,5
Crocin Advance 500mg,CRO25A01,20-08-2027,50,5,28,18,5
Pan-D Capsule,PAN25A01,01-12-2027,30,0,145,95,5
Blood Pressure Monitor,BPM25A01,,10,0,1850,1200,18
N95 Face Masks (Pack of 10),N9525A01,31-12-2028,200,20,250,160,18`;
  }
};

// Make globally available
window.Inward = Inward;
