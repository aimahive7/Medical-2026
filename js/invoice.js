/* ============================================
   SHOBHA MEDICAL STORES — Invoice Generator
   Exact replica of physical bill format
   ============================================ */

const Invoice = {

  /**
   * Get shop header info from settings
   */
  getShopInfo() {
    const s = App.getSettings();
    // Clean jurisdiction in case it was stored with full phrase
    let jurisdiction = s.jurisdiction || 'NANDED';
    jurisdiction = jurisdiction.replace(/^Subject\s+to\s+/i, '').replace(/\s+Jurisdiction$/i, '').trim();
    return {
      name: s.shop_name || 'SHOBHA MEDICAL STORES',
      address: s.address || 'ND-41, SAMBHAJI CHOWK, CIDCO NANDED-431603.',
      phone: s.phone || '9970670610',
      dl_no: s.dl_no || '20-324111  21-324112',
      fdl_no: s.fdl_no || '21519324000092',
      gst_number: s.gst_number || '27AABCS1234A1ZV',
      jurisdiction: jurisdiction
    };
  },

  /**
   * Generate invoice HTML in the exact Shobha Medical format
   * @param {Object} order - The order object
   * @param {string} billType - 'C/C' (Cash/Credit) or 'O/C' (Original Copy)
   * @returns {string} HTML for one copy of the invoice
   */
  generateBillHTML(order, billType = 'C/C') {
    const shop = this.getShopInfo();
    const invoiceNum = order.invoice_number || order.order_number;
    const billDate = Utils.formatDate(order.created_at);
    const settings = App.getSettings();
    const gstRate = settings.gst_rate || 18;

    // Calculate breakdowns
    const medicineSubtotal = order.subtotal || order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const gstAmount = order.tax || Utils.calculateTax(medicineSubtotal, gstRate);
    const deliveryCharge = order.delivery_charge !== undefined ? order.delivery_charge : 0;
    const grandTotal = order.total || (medicineSubtotal + gstAmount + deliveryCharge);

    let itemsHTML = '';
    order.items.forEach((item, idx) => {
      const product = App.getById('products', item.product_id);
      itemsHTML += `
        <tr>
          <td>${idx + 1}</td>
          <td class="item-name">${Utils.sanitize(item.name).toUpperCase()}</td>
          <td>${product ? (product.strength || '-') : '-'}</td>
          <td>${product ? this.getMfgName(product) : '-'}</td>
          <td>${product ? (product.batch_no || 'DOB' + Math.floor(Math.random()*9000+1000)) : '-'}</td>
          <td>${product && product.expiry_date ? this.formatExpiry(product.expiry_date) : '-'}</td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    });

    // Fill empty rows to maintain consistent height (minimum 6 rows)
    const emptyRows = Math.max(0, 6 - order.items.length);
    for (let i = 0; i < emptyRows; i++) {
      itemsHTML += `<tr class="empty-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }

    return `
      <div class="bill-copy">
        <!-- Shop Header -->
        <div class="bill-header">
          <h2 class="shop-title">${shop.name}</h2>
          <p class="shop-address">${shop.address}</p>
        </div>

        <!-- License & Contact Row -->
        <div class="bill-info-row">
          <div class="info-left">
            <span>D.L.NO - <strong>${shop.dl_no}</strong></span>
          </div>
          <div class="info-right">
            <span>FDL NO : <strong>${shop.fdl_no}</strong></span>
          </div>
        </div>

        <div class="bill-info-row center-row">
          <span>MOBILE NO. <strong>${shop.phone}</strong></span>
        </div>

        <!-- Dashed Separator -->
        <div class="dashed-line"></div>

        <!-- Customer & Bill Info -->
        <div class="bill-info-block">
          <div class="info-grid">
            <div class="info-left-block">
              <p>Patient : <strong>${Utils.sanitize(order.customer_name || 'WALK-IN CUSTOMER').toUpperCase()}</strong></p>
              <p class="indent">${order.address ? Utils.sanitize(order.address.city || '').toUpperCase() + ' ' + Utils.sanitize(order.address.state || '').toUpperCase() : ''}</p>
              <p>Doctor  : <strong>${Utils.sanitize(order.doctor_name || 'SELF').toUpperCase()}</strong></p>
            </div>
            <div class="info-right-block">
              <p>Sale Bill &nbsp;&nbsp;&nbsp; (${billType})</p>
              <p>Cash Memo No. <strong>${invoiceNum}</strong></p>
              <p>Cash Memo dt. <strong>${billDate}</strong></p>
            </div>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="dashed-line"></div>

        <!-- Items Table -->
        <table class="bill-table">
          <thead>
            <tr>
              <th class="col-sno">S.No</th>
              <th class="col-name">Name of Product</th>
              <th class="col-pkg">Pkg</th>
              <th class="col-mfg">Mfg.</th>
              <th class="col-batch">Batch</th>
              <th class="col-expiry">Expiry</th>
              <th class="col-qty">Qty</th>
              <th class="col-amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Dashed Separator -->
        <div class="dashed-line"></div>

        <!-- Detailed Breakdown -->
        <div class="bill-breakdown">
          <div class="breakdown-row">
            <span>Medicine Bill :</span>
            <strong>${medicineSubtotal.toFixed(2)}</strong>
          </div>
          <div class="breakdown-row">
            <span>GST (${gstRate}%) :</span>
            <strong>${gstAmount.toFixed(2)}</strong>
          </div>
          <div class="breakdown-row">
            <span>Delivery Charge :</span>
            <strong>${deliveryCharge === 0 ? 'FREE' : deliveryCharge.toFixed(2)}</strong>
          </div>
        </div>

        <div class="dashed-line"></div>

        <!-- Totals Row -->
        <div class="bill-totals">
          <div class="total-left">
            <span>Gross: <strong>${grandTotal.toFixed(2)}</strong></span>
          </div>
          <div class="total-right">
            <span>Net: <strong>${medicineSubtotal.toFixed(2)}</strong></span>
          </div>
        </div>

        <!-- Dashed Separator -->
        <div class="dashed-line"></div>

        <!-- Footer -->
        <div class="bill-footer">
          <div class="footer-left">
            <p class="footer-note">GOODS ONCE SOLD WILL NOT BE TAKEN BACK OR EXCHANGE</p>
            <p class="footer-jurisdiction">Subject to ${shop.jurisdiction} Jurisdiction</p>
          </div>
          <div class="footer-right">
            <p class="pharmacist-label">PHARMACIST</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Generate full invoice page HTML (2 copies: C/C and O/C)
   */
  generateFullInvoiceHTML(order) {
    const ccCopy = this.generateBillHTML(order, 'C/C');
    const ocCopy = this.generateBillHTML(order, 'O/C');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${order.order_number} — SHOBHA MEDICAL STORES</title>
  <style>
    ${this.getInvoiceCSS()}
  </style>
</head>
<body>
  <div class="invoice-page">
    ${ccCopy}
    <div class="bill-separator"></div>
    ${ocCopy}
  </div>

  <div class="no-print action-bar">
    <button onclick="window.print()" class="btn-action btn-print">
      <i class="fas fa-print"></i> Print Invoice
    </button>
    <button onclick="window.close()" class="btn-action btn-close-win">
      <i class="fas fa-times"></i> Close
    </button>
  </div>

  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
</body>
</html>
    `;
  },

  /**
   * CSS for the invoice — matches the physical bill format exactly
   */
  getInvoiceCSS() {
    return `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Courier Prime', 'Courier New', Courier, monospace;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
        background: #f0f0f0;
      }

      .invoice-page {
        width: 210mm;
        margin: 10mm auto;
        background: #fff;
        padding: 8mm 12mm;
        box-shadow: 0 2px 20px rgba(0,0,0,0.15);
      }

      /* ---- Bill Copy ---- */
      .bill-copy {
        padding: 4mm 0;
      }

      .bill-header {
        text-align: center;
        margin-bottom: 3mm;
      }

      .shop-title {
        font-size: 18px;
        font-weight: 700;
        text-decoration: underline;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }

      .shop-address {
        font-size: 11px;
        font-weight: 400;
      }

      /* Info Rows */
      .bill-info-row {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        padding: 1px 0;
      }

      .bill-info-row.center-row {
        justify-content: center;
        margin-bottom: 2mm;
      }

      /* Dashed Line Separator */
      .dashed-line {
        border-top: 1px dashed #000;
        margin: 2mm 0;
      }

      /* Customer/Bill Info */
      .bill-info-block {
        font-size: 11px;
        margin: 1mm 0;
      }

      .info-grid {
        display: flex;
        justify-content: space-between;
      }

      .info-left-block {
        flex: 1;
      }

      .info-right-block {
        text-align: right;
        min-width: 200px;
      }

      .info-left-block p,
      .info-right-block p {
        margin: 1px 0;
      }

      .indent {
        padding-left: 60px;
      }

      /* Items Table */
      .bill-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        margin-top: 1mm;
      }

      .bill-table thead tr {
        border-bottom: 1px dashed #000;
        border-top: 1px dashed #000;
      }

      .bill-table th {
        text-align: left;
        padding: 2px 4px;
        font-weight: 700;
        font-size: 10px;
      }

      .bill-table td {
        padding: 2px 4px;
        vertical-align: top;
      }

      .bill-table .text-right {
        text-align: right;
      }

      .bill-table .text-center {
        text-align: center;
      }

      .bill-table .item-name {
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .bill-table .empty-row td {
        height: 16px;
      }

      /* Column widths */
      .col-sno    { width: 6%; }
      .col-name   { width: 26%; }
      .col-pkg    { width: 10%; }
      .col-mfg    { width: 11%; }
      .col-batch  { width: 14%; }
      .col-expiry { width: 10%; }
      .col-qty    { width: 8%; text-align: center; }
      .col-amount { width: 15%; text-align: right; }

      /* Breakdown Section */
      .bill-breakdown {
        padding: 2mm 0;
        font-size: 11px;
      }

      .breakdown-row {
        display: flex;
        justify-content: space-between;
        padding: 1px 0;
      }

      .breakdown-row span {
        min-width: 140px;
      }

      /* Totals */
      .bill-totals {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 2mm 0;
      }

      /* Footer */
      .bill-footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 10px;
        margin-top: 3mm;
        padding-bottom: 2mm;
      }

      .footer-note {
        font-weight: 700;
        font-size: 9px;
        margin-bottom: 2px;
      }

      .footer-jurisdiction {
        font-size: 9px;
      }

      .pharmacist-label {
        font-weight: 700;
        font-size: 11px;
        text-align: right;
      }

      /* Separator between copies */
      .bill-separator {
        border-top: 1px solid #000;
        margin: 6mm 0;
        position: relative;
      }

      .bill-separator::after {
        content: '✂';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 0 8px;
        font-size: 14px;
      }

      /* Action Bar (no print) */
      .action-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 12px;
        padding: 16px;
        background: #1a1a2e;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        z-index: 999;
      }

      .btn-action {
        padding: 12px 28px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
        font-family: -apple-system, 'Segoe UI', sans-serif;
      }

      .btn-print {
        background: #00c897;
        color: #fff;
      }

      .btn-print:hover {
        background: #00a87a;
        transform: translateY(-1px);
      }

      .btn-close-win {
        background: #374151;
        color: #fff;
      }

      .btn-close-win:hover {
        background: #4b5563;
      }

      /* ---- Print Styles ---- */
      @media print {
        body {
          background: #fff;
        }

        .invoice-page {
          width: 100%;
          margin: 0;
          padding: 0 5mm;
          box-shadow: none;
        }

        .no-print {
          display: none !important;
        }

        .bill-copy {
          page-break-inside: avoid;
        }

        /* Two copies fit on one A4 page */
        .bill-separator {
          margin: 3mm 0;
        }

        @page {
          size: A4;
          margin: 8mm 5mm;
        }
      }

      /* ---- Responsive for screen ---- */
      @media screen and (max-width: 768px) {
        .invoice-page {
          width: 100%;
          margin: 0;
          padding: 4mm;
          box-shadow: none;
        }

        body {
          font-size: 10px;
          padding-bottom: 80px;
        }

        .shop-title {
          font-size: 14px;
        }

        .bill-table th,
        .bill-table td {
          font-size: 9px;
          padding: 1px 2px;
        }
      }
    `;
  },

  /**
   * Open invoice in a new window for print preview
   */
  openPrintPreview(orderId) {
    const order = App.getById('orders', orderId);
    if (!order) {
      Utils.showToast('Order not found', 'error');
      return;
    }

    // Generate invoice number if not exists
    if (!order.invoice_number) {
      order.invoice_number = Utils.generateNumber('SL');
      App.update('orders', orderId, { invoice_number: order.invoice_number });
    }

    const html = this.generateFullInvoiceHTML(order);
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    printWindow.document.write(html);
    printWindow.document.close();
  },

  /**
   * Generate PDF using jsPDF (exact Shobha Medical bill format)
   */
  generatePDF(orderId) {
    const order = App.getById('orders', orderId);
    if (!order) {
      Utils.showToast('Order not found', 'error');
      return;
    }

    const shop = this.getShopInfo();

    // Generate invoice number if not exists
    if (!order.invoice_number) {
      order.invoice_number = Utils.generateNumber('SL');
      App.update('orders', orderId, { invoice_number: order.invoice_number });
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Draw two copies on one page
    this.drawBillCopy(doc, order, shop, 10, 'C/C');
    
    // Scissor line separator
    const midY = 148;
    doc.setDrawColor(0);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(10, midY, 200, midY);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(10);
    doc.text('✂', 100, midY + 1, { align: 'center' });

    this.drawBillCopy(doc, order, shop, midY + 5, 'O/C');

    // Save
    const filename = `Invoice_${order.invoice_number}_${Utils.formatDate(order.created_at).replace(/-/g, '')}.pdf`;
    doc.save(filename);

    // Record
    App.add('invoices', {
      id: Utils.generateId(),
      order_id: orderId,
      invoice_number: order.invoice_number,
      created_at: new Date().toISOString()
    });

    Utils.showToast('Invoice PDF downloaded!', 'success');
  },

  /**
   * Draw one bill copy onto the jsPDF document
   */
  drawBillCopy(doc, order, shop, startY, billType) {
    const leftX = 12;
    const rightX = 198;
    let y = startY;
    const settings = App.getSettings();
    const gstRate = settings.gst_rate || 18;

    // Calculate breakdowns
    const medicineSubtotal = order.subtotal || order.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const gstAmount = order.tax || Utils.calculateTax(medicineSubtotal, gstRate);
    const deliveryCharge = order.delivery_charge !== undefined ? order.delivery_charge : 0;
    const grandTotal = order.total || (medicineSubtotal + gstAmount + deliveryCharge);

    // Use Courier-like font
    doc.setFont('courier', 'normal');

    // ---- HEADER ----
    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.text(shop.name, 105, y, { align: 'center' });
    y += 5;

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text(shop.address, 105, y, { align: 'center' });
    y += 5;

    // ---- LICENSE ROW ----
    doc.setFontSize(9);
    doc.text(`D.L.NO -  ${shop.dl_no}`, leftX, y);
    doc.text(`FDL NO : ${shop.fdl_no}`, rightX, y, { align: 'right' });
    y += 4;

    // MOBILE
    doc.text(`MOBILE NO. ${shop.phone}`, 105, y, { align: 'center' });
    y += 4;

    // ---- DASHED LINE ----
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 4;

    // ---- CUSTOMER INFO ----
    doc.setFontSize(9);
    const customerName = (order.customer_name || 'WALK-IN CUSTOMER').toUpperCase();
    const doctorName = (order.doctor_name || 'SELF').toUpperCase();
    const cityState = order.address 
      ? `${(order.address.city || '').toUpperCase()} ${(order.address.state || '').toUpperCase()}`
      : '';

    doc.text(`Patient : ${customerName}`, leftX, y);
    doc.text(`Sale Bill     (${billType})`, rightX, y, { align: 'right' });
    y += 4;

    doc.text(`         ${cityState}`, leftX, y);
    doc.text(`Cash Memo No. ${order.invoice_number || order.order_number}`, rightX, y, { align: 'right' });
    y += 4;

    doc.text(`Doctor  : ${doctorName}`, leftX, y);
    doc.text(`Cash Memo dt. ${Utils.formatDate(order.created_at)}`, rightX, y, { align: 'right' });
    y += 4;

    // ---- DASHED LINE ----
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 3;

    // ---- TABLE HEADER ----
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    const cols = [
      { label: 'S.No', x: leftX, w: 10 },
      { label: 'Name of Product', x: leftX + 10, w: 52 },
      { label: 'Pkg', x: leftX + 62, w: 18 },
      { label: 'Mfg.', x: leftX + 80, w: 22 },
      { label: 'Batch', x: leftX + 102, w: 24 },
      { label: 'Expiry', x: leftX + 126, w: 18 },
      { label: 'Qty', x: leftX + 144, w: 12 },
      { label: 'Amount', x: leftX + 156, w: 30 }
    ];

    cols.forEach(c => doc.text(c.label, c.x, y));
    y += 2;
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 3;

    // ---- TABLE BODY ----
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);

    order.items.forEach((item, idx) => {
      const product = App.getById('products', item.product_id);
      const pkg = product ? (product.strength || '-') : '-';
      const mfg = product ? this.getMfgName(product) : '-';
      const batch = product ? (product.batch_no || 'DOB' + Math.floor(Math.random()*9000+1000)) : '-';
      const expiry = product && product.expiry_date ? this.formatExpiry(product.expiry_date) : '-';
      const amount = (item.price * item.quantity).toFixed(2);

      doc.text(String(idx + 1), cols[0].x, y);
      doc.text(this.truncPDF(item.name.toUpperCase(), 22), cols[1].x, y);
      doc.text(this.truncPDF(pkg, 8), cols[2].x, y);
      doc.text(this.truncPDF(mfg, 9), cols[3].x, y);
      doc.text(this.truncPDF(batch, 10), cols[4].x, y);
      doc.text(expiry, cols[5].x, y);
      doc.text(String(item.quantity), cols[6].x + 4, y);
      doc.text(amount, rightX, y, { align: 'right' });
      y += 4;
    });

    // ---- DASHED LINE ---- (before breakdown)
    y = startY + 90;
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 4;

    // ---- CHARGE BREAKDOWN ----
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text('Medicine Bill :', leftX, y);
    doc.text(medicineSubtotal.toFixed(2), rightX, y, { align: 'right' });
    y += 4;

    doc.text(`GST (${gstRate}%) :`, leftX, y);
    doc.text(gstAmount.toFixed(2), rightX, y, { align: 'right' });
    y += 4;

    doc.text('Delivery Charge :', leftX, y);
    doc.text(deliveryCharge === 0 ? 'FREE' : deliveryCharge.toFixed(2), rightX, y, { align: 'right' });
    y += 4;

    // ---- DASHED LINE ----
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 4;

    // ---- TOTALS ----
    doc.setFontSize(10);
    doc.setFont('courier', 'bold');
    doc.text(`Gross: ${grandTotal.toFixed(2)}`, leftX, y);
    doc.text(`Net: ${medicineSubtotal.toFixed(2)}`, rightX, y, { align: 'right' });
    y += 4;

    // ---- DASHED LINE ----
    this.drawDashedLine(doc, leftX, y, rightX);
    y += 4;

    // ---- FOOTER ----
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.text('GOODS ONCE SOLD WILL NOT BE TAKEN BACK OR EXCHANGE', leftX, y);
    y += 3;
    doc.setFont('courier', 'normal');
    doc.text(`Subject to ${shop.jurisdiction} Jurisdiction`, leftX, y);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text('PHARMACIST', rightX, y, { align: 'right' });
  },

  /**
   * Draw a dashed line
   */
  drawDashedLine(doc, x1, y, x2) {
    doc.setDrawColor(0);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(x1, y, x2, y);
    doc.setLineDashPattern([], 0);
  },

  /**
   * Get manufacturer short name from product
   */
  getMfgName(product) {
    const name = product.name || '';
    // Try to extract a reasonable MFG code
    const map = {
      'Dolo': 'MICRO',
      'Crocin': 'GSK',
      'Azithromycin': 'CIPLA',
      'Pan-D': 'ALKEM',
      'Cetirizine': 'ZEE',
      'Amoxicillin': 'CIPLA',
      'Metformin': 'USV',
      'Amlodipine': 'MICRO',
      'Omeprazole': 'DRL',
      'Ibuprofen': 'ABBOTT',
      'Montelukast': 'SUN',
      'Vitamin D3': 'ABBOTT',
      'Ranitidine': 'GNP',
      'Levofloxacin': 'CIPLA',
      'Combiflam': 'SANOFI',
      'HealthKart': 'HK',
      'Shelcal': 'TORRENT',
      'Becosules': 'PFIZER',
      'Omega': 'HK',
      'Iron': 'GLAXO',
      'Zinc': 'HK',
      'Protein': 'HK',
      'Biotin': 'HK',
      'Vitamin C': 'LIMCEE',
      'Probiotics': 'DABAR',
      'Digital': 'OMRON',
      'Blood Pressure': 'OMRON',
      'Pulse': 'FINGRTIP',
      'Glucometer': 'ACCU',
      'Nebulizer': 'PHLPS',
      'Weighing': 'OMRON',
      'Stethoscope': 'LITTMN',
      'Heating': 'ELCTR',
      'N95': '3M',
      'Hand Sanitizer': 'DETTOL',
      'Surgical': 'MEDIQ',
      'Betadine': 'WIN',
      'Dettol': 'RECKTT',
      'Cotton': 'SOFTNR',
      'Adhesive': 'JSNS',
      'Vicks': 'P&G',
      'Gripe': 'WOODWD',
      'Diaper': 'PAMPR',
      'Massage Oil': 'JHNSN',
      'Nasal': 'NASOCL',
      'Baby Soap': 'JHNSN',
      'Pediatric': 'ABBOTT',
      'Chyawan': 'DABAR',
      'Ashwagandha': 'HMLYA',
      'Tulsi': 'ORGIND',
      'Triphala': 'PATNJL',
      'Brahmi': 'HMLYA',
      'Giloy': 'PATNJL',
      'Aloe': 'PATNJL',
      'Neem': 'HMLYA'
    };

    for (const key in map) {
      if (name.includes(key)) return map[key];
    }
    return 'GENRC';
  },

  /**
   * Format expiry date as Mon-YY
   */
  formatExpiry(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
  },

  /**
   * Truncate text for PDF
   */
  truncPDF(str, maxLen) {
    if (!str || str.length <= maxLen) return str || '-';
    return str.substring(0, maxLen);
  }
};

// Make globally available
window.Invoice = Invoice;
