/* ============================================
   SHOBHA MEDICAL STORES — Core Application
   Data Store, Routing, Event System
   ============================================ */

const App = {
  /**
   * Initialize the application
   */
  async init() {
    // Seed data on first visit
    await SeedData.init();
    
    // Initialize auth state
    Auth.init();
    
    // Update cart badge
    this.updateCartBadge();
    
    // Setup navbar scroll effect
    this.setupNavbar();
    
    // Setup page loader
    this.hideLoader();
    
    // Log readiness
    console.log('🏥 Shobha Medical Stores — App initialized (v2)');
  },

  /* ---------- DATA STORE (localStorage CRUD) ---------- */

  /**
   * Get all records from a collection
   */
  getAll(collection) {
    return JSON.parse(localStorage.getItem(`sms_${collection}`) || '[]');
  },

  /**
   * Get single record by id
   */
  getById(collection, id) {
    const items = this.getAll(collection);
    return items.find(item => item.id === id) || null;
  },

  /**
   * Add a record to a collection
   */
  add(collection, record) {
    const items = this.getAll(collection);
    items.push(record);
    localStorage.setItem(`sms_${collection}`, JSON.stringify(items));
    return record;
  },

  /**
   * Update a record in a collection
   */
  update(collection, id, updates) {
    const items = this.getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(`sms_${collection}`, JSON.stringify(items));
    return items[index];
  },

  /**
   * Delete a record from a collection
   */
  delete(collection, id) {
    let items = this.getAll(collection);
    items = items.filter(item => item.id !== id);
    localStorage.setItem(`sms_${collection}`, JSON.stringify(items));
    return true;
  },

  /**
   * Get settings object
   */
  getSettings() {
    return JSON.parse(localStorage.getItem('sms_settings') || '{}');
  },

  /**
   * Update settings
   */
  updateSettings(updates) {
    const settings = this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem('sms_settings', JSON.stringify(updated));
    return updated;
  },

  /* ---------- PRODUCT HELPERS ---------- */

  /**
   * Get products with filters
   */
  getProducts(filters = {}) {
    let products = this.getAll('products');

    // Hide hidden products for customers
    if (filters.customerView) {
      products = products.filter(p => !p.is_hidden && p.status === 'active');
      if (filters.hideOutOfStock) {
        products = products.filter(p => this.getTotalStock(p.id) > 0);
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      products = products.filter(p => p.category === filters.category);
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.composition || '').toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q) ||
        (p.hsn_code || '').toLowerCase().includes(q)
      );
    }

    // Price filter (uses mrp)
    if (filters.minPrice !== undefined) {
      products = products.filter(p => (p.mrp || p.price) >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(p => (p.mrp || p.price) <= filters.maxPrice);
    }

    // Stock filter
    if (filters.stockStatus === 'in-stock') {
      products = products.filter(p => (p.stock_qty || this.getTotalStock(p.id)) > 10);
    } else if (filters.stockStatus === 'low-stock') {
      const threshold = this.getSettings().low_stock_threshold || 10;
      products = products.filter(p => {
        const qty = p.stock_qty || this.getTotalStock(p.id);
        return qty > 0 && qty <= threshold;
      });
    } else if (filters.stockStatus === 'out-of-stock') {
      products = products.filter(p => (p.stock_qty || this.getTotalStock(p.id)) <= 0);
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          products.sort((a, b) => (a.mrp || a.price) - (b.mrp || b.price));
          break;
        case 'price-desc':
          products.sort((a, b) => (b.mrp || b.price) - (a.mrp || a.price));
          break;
        case 'name-asc':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        default:
          break;
      }
    }

    return products;
  },

  /**
   * Get unique categories
   */
  getCategories() {
    const products = this.getAll('products');
    return [...new Set(products.map(p => p.category))].sort();
  },

  /* ---------- BATCH MANAGEMENT ---------- */

  /**
   * Get all batches for a product
   */
  getProductBatches(productId) {
    const batches = this.getAll('product_batches');
    return batches.filter(b => b.product_id === productId);
  },

  /**
   * Get available (non-expired, in-stock) batches for a product, sorted FEFO
   */
  getAvailableBatches(productId) {
    const batches = this.getProductBatches(productId);
    return batches
      .filter(b => b.quantity > 0 && !Utils.isExpired(b.expiry_date))
      .sort((a, b) => {
        // First Expiry First Out (FEFO)
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date) - new Date(b.expiry_date);
      });
  },

  /**
   * Get total available stock for a product (sum of non-expired batches)
   */
  getTotalStock(productId) {
    const batches = this.getAvailableBatches(productId);
    return batches.reduce((sum, b) => sum + b.quantity, 0);
  },

  /**
   * Allocate stock from batches using FEFO method
   * Returns array of { batch_id, batch_number, expiry_date, quantity, mrp, gst_rate }
   */
  allocateBatches(productId, requestedQty) {
    const batches = this.getAvailableBatches(productId);
    const allocations = [];
    let remaining = requestedQty;

    for (const batch of batches) {
      if (remaining <= 0) break;
      const allocated = Math.min(remaining, batch.quantity);
      allocations.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        expiry_date: batch.expiry_date,
        quantity: allocated,
        mrp: batch.mrp,
        ptr_rate: batch.ptr_rate,
        gst_rate: batch.gst_rate
      });
      remaining -= allocated;
    }

    return { allocations, fulfilled: remaining <= 0, shortfall: Math.max(0, remaining) };
  },

  /**
   * Add a new batch for a product
   */
  addBatch(batchData) {
    const batch = {
      id: Utils.generateId(),
      product_id: batchData.product_id,
      batch_number: batchData.batch_number,
      expiry_date: batchData.expiry_date,
      quantity: parseInt(batchData.quantity) || 0,
      free_quantity: parseInt(batchData.free_quantity) || 0,
      ptr_rate: parseFloat(batchData.ptr_rate) || 0,
      mrp: parseFloat(batchData.mrp) || 0,
      gst_rate: parseFloat(batchData.gst_rate) || 5,
      created_at: new Date().toISOString()
    };

    this.add('product_batches', batch);

    // Update product stock_qty (total from all batches)
    this.syncProductStock(batchData.product_id);

    // Log stock history
    this.add('stock_history', {
      id: Utils.generateId(),
      product_id: batchData.product_id,
      batch_id: batch.id,
      batch_number: batch.batch_number,
      qty_before: 0,
      qty_after: batch.quantity,
      action: 'batch_added',
      timestamp: new Date().toISOString()
    });

    return batch;
  },

  /**
   * Sync product stock_qty with total batch quantities
   */
  syncProductStock(productId) {
    const totalStock = this.getTotalStock(productId);
    this.update('products', productId, { stock_qty: totalStock });
  },

  /* ---------- CART HELPERS ---------- */

  /**
   * Get current cart
   */
  getCart() {
    return JSON.parse(localStorage.getItem('sms_cart') || '{"items":[]}');
  },

  /**
   * Save cart
   */
  saveCart(cart) {
    cart.updated_at = new Date().toISOString();
    localStorage.setItem('sms_cart', JSON.stringify(cart));
    this.updateCartBadge();
  },

  /**
   * Add item to cart
   */
  addToCart(productId, quantity = 1) {
    const product = this.getById('products', productId);
    if (!product) return false;
    
    const availableStock = this.getTotalStock(productId) || product.stock_qty;
    if (availableStock <= 0) {
      Utils.showToast('Product is out of stock', 'error');
      return false;
    }

    const cart = this.getCart();
    const existing = cart.items.find(item => item.product_id === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > availableStock) {
        Utils.showToast(`Only ${availableStock} available`, 'warning');
        return false;
      }
      existing.quantity = newQty;
    } else {
      cart.items.push({
        product_id: productId,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    Utils.showToast(`${product.name} added to cart`, 'success');
    return true;
  },

  /**
   * Remove item from cart
   */
  removeFromCart(productId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.product_id !== productId);
    this.saveCart(cart);
    Utils.showToast('Item removed from cart', 'success');
  },

  /**
   * Update cart item quantity
   */
  updateCartQuantity(productId, quantity) {
    const product = this.getById('products', productId);
    if (!product) return false;

    const availableStock = this.getTotalStock(productId) || product.stock_qty;
    if (quantity > availableStock) {
      Utils.showToast(`Only ${availableStock} available`, 'warning');
      return false;
    }

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return true;
    }

    const cart = this.getCart();
    const item = cart.items.find(i => i.product_id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart(cart);
    }
    return true;
  },

  /**
   * Get cart with product details (per-product GST)
   */
  getCartDetails() {
    const cart = this.getCart();
    const settings = this.getSettings();
    
    const items = cart.items.map(item => {
      const product = this.getById('products', item.product_id);
      if (!product) return null;
      
      const mrp = product.mrp || product.price;
      const gstRate = product.gst_rate || Utils.getDefaultGSTRate(product.category);
      const basePrice = Utils.calculateBasePrice(mrp, gstRate);
      const gstAmount = Utils.calculateGSTFromMRP(mrp, gstRate);
      
      return {
        ...item,
        product: product,
        mrp: mrp,
        gst_rate: gstRate,
        base_price: basePrice,
        gst_per_unit: gstAmount,
        subtotal: mrp * item.quantity,
        base_total: basePrice * item.quantity,
        gst_total: gstAmount * item.quantity
      };
    }).filter(Boolean);

    // Group GST by rate
    const gstBreakdown = {};
    items.forEach(item => {
      const rate = item.gst_rate;
      if (!gstBreakdown[rate]) {
        gstBreakdown[rate] = { rate, taxable: 0, gst: 0 };
      }
      gstBreakdown[rate].taxable += item.base_total;
      gstBreakdown[rate].gst += item.gst_total;
    });

    const subtotal = items.reduce((sum, item) => sum + item.base_total, 0);
    const totalGST = items.reduce((sum, item) => sum + item.gst_total, 0);
    const grandTotal = subtotal + totalGST;
    const deliveryCharge = grandTotal >= (settings.free_delivery_above || 500) ? 0 : (settings.delivery_charge || 40);

    return {
      items,
      subtotal,         // Total base price (excl GST)
      tax: totalGST,    // Keep 'tax' for backward compat
      totalGST,
      gstBreakdown: Object.values(gstBreakdown),
      deliveryCharge,
      freeDeliveryAbove: settings.free_delivery_above || 500,
      grandTotal,       // subtotal + GST (excl delivery)
      total: grandTotal + deliveryCharge,  // Grand total with delivery
      taxRate: 'Per Product', // Indicate per-product GST
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  /**
   * Clear entire cart
   */
  clearCart() {
    localStorage.setItem('sms_cart', JSON.stringify({ items: [] }));
    this.updateCartBadge();
  },

  /**
   * Update cart badge in navbar
   */
  updateCartBadge() {
    const cart = this.getCart();
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  /* ---------- BILL / ORDER HELPERS ---------- */

  /**
   * Create a bill (Pending Approval — new workflow)
   * Stock is NOT deducted until approved
   */
  createBill(orderData) {
    const cart = this.getCartDetails();
    if (cart.items.length === 0) return null;

    const user = Auth.getCurrentUser();

    // Build bill items with batch allocation
    const billItems = [];
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      const mrp = cartItem.mrp;
      const gstRate = cartItem.gst_rate;
      
      // Try to allocate from batches
      const allocation = this.allocateBatches(product.id, cartItem.quantity);
      
      if (allocation.allocations.length > 0) {
        // Add each allocated batch as a line item
        for (const alloc of allocation.allocations) {
          const useMRP = alloc.mrp || mrp;
          const useGST = alloc.gst_rate || gstRate;
          const baseUnit = Utils.calculateBasePrice(useMRP, useGST);
          const gstUnit = Utils.calculateGSTFromMRP(useMRP, useGST);
          
          billItems.push({
            product_id: product.id,
            batch_id: alloc.batch_id,
            name: product.name,
            batch_number: alloc.batch_number,
            expiry_date: alloc.expiry_date,
            quantity: alloc.quantity,
            mrp: useMRP,
            gst_rate: useGST,
            base_price: baseUnit * alloc.quantity,
            gst_amount: gstUnit * alloc.quantity,
            total: useMRP * alloc.quantity
          });
        }
      } else {
        // No batches available — use product-level data
        const baseUnit = Utils.calculateBasePrice(mrp, gstRate);
        const gstUnit = Utils.calculateGSTFromMRP(mrp, gstRate);
        
        billItems.push({
          product_id: product.id,
          batch_id: null,
          name: product.name,
          batch_number: 'N/A',
          expiry_date: '',
          quantity: cartItem.quantity,
          mrp: mrp,
          gst_rate: gstRate,
          base_price: baseUnit * cartItem.quantity,
          gst_amount: gstUnit * cartItem.quantity,
          total: mrp * cartItem.quantity
        });
      }
    }

    const billSubtotal = billItems.reduce((sum, i) => sum + i.base_price, 0);
    const billGST = billItems.reduce((sum, i) => sum + i.gst_amount, 0);
    const billGrandTotal = billItems.reduce((sum, i) => sum + i.total, 0);
    const deliveryCharge = billGrandTotal >= (this.getSettings().free_delivery_above || 500) ? 0 : (this.getSettings().delivery_charge || 40);

    const bill = {
      id: Utils.generateId(),
      bill_number: Utils.generateNumber('BILL'),
      user_id: user ? user.id : 'guest',
      customer_name: orderData.name,
      customer_email: orderData.email,
      customer_phone: orderData.phone,
      items: billItems,
      subtotal: billSubtotal,
      total_gst: billGST,
      grand_total: billGrandTotal,
      delivery_charge: deliveryCharge,
      status: 'pending_approval',
      payment_method: orderData.payment_method || 'COD',
      address: {
        line1: orderData.address_line1,
        line2: orderData.address_line2 || '',
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode
      },
      notes: orderData.notes || '',
      created_at: new Date().toISOString(),
      approved_at: null,
      approved_by: null,
      rejection_reason: null
    };

    this.add('bills', bill);
    this.clearCart();
    
    return bill;
  },

  /**
   * Approve a bill (Admin action)
   * Deducts stock from batches
   */
  approveBill(billId, adminId) {
    const bill = this.getById('bills', billId);
    if (!bill || bill.status !== 'pending_approval') {
      return { success: false, message: 'Bill not found or not pending approval.' };
    }

    // Validate and deduct stock
    for (const item of bill.items) {
      if (item.batch_id) {
        const batch = this.getById('product_batches', item.batch_id);
        if (!batch) {
          return { success: false, message: `Batch ${item.batch_number} not found for ${item.name}.` };
        }
        if (batch.quantity < item.quantity) {
          return { success: false, message: `Insufficient stock in batch ${item.batch_number} for ${item.name}. Available: ${batch.quantity}, Required: ${item.quantity}` };
        }
        if (Utils.isExpired(batch.expiry_date)) {
          return { success: false, message: `Batch ${item.batch_number} for ${item.name} has expired.` };
        }
      }
    }

    // All validations passed — deduct stock
    for (const item of bill.items) {
      if (item.batch_id) {
        const batch = this.getById('product_batches', item.batch_id);
        const newQty = batch.quantity - item.quantity;

        // Log stock change
        this.add('stock_history', {
          id: Utils.generateId(),
          product_id: item.product_id,
          batch_id: item.batch_id,
          batch_number: item.batch_number,
          product_name: item.name,
          qty_before: batch.quantity,
          qty_after: newQty,
          action: 'sale',
          bill_id: billId,
          timestamp: new Date().toISOString()
        });

        // Update batch quantity
        this.update('product_batches', item.batch_id, { quantity: newQty });
      }

      // Sync product total stock
      this.syncProductStock(item.product_id);
    }

    // Update bill status
    const admin = this.getById('users', adminId);
    this.update('bills', billId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminId
    });

    // Log approval
    this.add('approvals', {
      id: Utils.generateId(),
      bill_id: billId,
      action: 'approved',
      admin_id: adminId,
      admin_name: admin ? admin.name : 'Admin',
      changes: {},
      reason: '',
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'Bill approved successfully. Stock deducted.' };
  },

  /**
   * Reject a bill (Admin action)
   */
  rejectBill(billId, adminId, reason) {
    const bill = this.getById('bills', billId);
    if (!bill || bill.status !== 'pending_approval') {
      return { success: false, message: 'Bill not found or not pending approval.' };
    }

    const admin = this.getById('users', adminId);

    this.update('bills', billId, {
      status: 'rejected',
      rejection_reason: reason || 'Rejected by admin'
    });

    // Log rejection
    this.add('approvals', {
      id: Utils.generateId(),
      bill_id: billId,
      action: 'rejected',
      admin_id: adminId,
      admin_name: admin ? admin.name : 'Admin',
      changes: {},
      reason: reason || 'Rejected by admin',
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'Bill rejected.' };
  },

  /**
   * Modify a bill (Admin action — before approval)
   */
  modifyBill(billId, adminId, updatedItems) {
    const bill = this.getById('bills', billId);
    if (!bill || bill.status !== 'pending_approval') {
      return { success: false, message: 'Bill not found or not pending approval.' };
    }

    // Recalculate totals
    const newSubtotal = updatedItems.reduce((sum, i) => sum + i.base_price, 0);
    const newGST = updatedItems.reduce((sum, i) => sum + i.gst_amount, 0);
    const newGrandTotal = updatedItems.reduce((sum, i) => sum + i.total, 0);

    const admin = this.getById('users', adminId);

    // Log modification
    this.add('approvals', {
      id: Utils.generateId(),
      bill_id: billId,
      action: 'modified',
      admin_id: adminId,
      admin_name: admin ? admin.name : 'Admin',
      changes: { old_items: bill.items, new_items: updatedItems },
      reason: 'Modified by admin before approval',
      timestamp: new Date().toISOString()
    });

    this.update('bills', billId, {
      items: updatedItems,
      subtotal: newSubtotal,
      total_gst: newGST,
      grand_total: newGrandTotal
    });

    return { success: true, message: 'Bill modified successfully.' };
  },

  /**
   * Get pending bills count
   */
  getPendingBillsCount() {
    const bills = this.getAll('bills');
    return bills.filter(b => b.status === 'pending_approval').length;
  },

  /**
   * Place an order (LEGACY — kept for backward compat with old orders)
   */
  placeOrder(orderData) {
    // Now redirects to createBill
    return this.createBill(orderData);
  },

  /* ---------- UI HELPERS ---------- */

  /**
   * Setup navbar scroll effect
   */
  setupNavbar() {
    const navbar = document.querySelector('.navbar-shobha');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  },

  /**
   * Hide page loader
   */
  hideLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 500);
    }
  },

  /**
   * Render product card HTML
   */
  renderProductCard(product) {
    const totalStock = this.getTotalStock(product.id) || product.stock_qty;
    const stock = Utils.getStockStatus(totalStock, this.getSettings().low_stock_threshold || 10);
    const icon = Utils.getCategoryIcon(product.category);
    const isOutOfStock = totalStock <= 0;
    const mrp = product.mrp || product.price;
    const gstRate = product.gst_rate || Utils.getDefaultGSTRate(product.category);

    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4 fade-in">
        <div class="product-card h-100">
          <div class="product-img">
            ${product.image ? `<img src="${product.image}" alt="${Utils.sanitize(product.name)}">` : `<i class="fas ${icon}"></i>`}
            <span class="product-badge ${stock.class}">
              <i class="fas ${stock.icon} me-1"></i>${stock.label}
            </span>
            <button class="product-wishlist" title="Add to wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="product-body">
            <span class="product-category">${Utils.sanitize(product.category)}</span>
            <h5 class="product-name">
              <a href="product-detail.html?id=${product.id}" class="text-decoration-none text-dark">${Utils.sanitize(product.name)}</a>
            </h5>
            <p class="product-desc">${Utils.sanitize(product.description)}</p>
            ${product.dosage ? `<small class="text-muted"><i class="fas fa-prescription me-1"></i>${Utils.sanitize(product.dosage)}</small>` : ''}
            ${product.manufacturer ? `<small class="text-muted d-block"><i class="fas fa-industry me-1"></i>${Utils.sanitize(product.manufacturer)}</small>` : ''}
            <div class="product-footer">
              <div>
                <span class="product-price">${Utils.formatCurrency(mrp)}</span>
                <small class="text-muted d-block" style="font-size:0.7rem;">GST ${gstRate}% incl.</small>
              </div>
              <button class="btn-add-cart" 
                      onclick="App.addToCart('${product.id}')" 
                      ${isOutOfStock ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'Sold Out' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Get navbar HTML (shared across pages)
   */
  getNavbarHTML(activePage = '') {
    const user = Auth.getCurrentUser();
    const cart = this.getCart();
    const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return `
    <nav class="navbar navbar-expand-lg navbar-shobha fixed-top" id="mainNavbar">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <i class="fas fa-clinic-medical"></i>
          SHOBHA MEDICAL
        </a>
        
        <div class="navbar-search d-none d-lg-block mx-3">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search medicines, health products..." 
                 id="navSearchInput" onkeyup="if(event.key==='Enter') window.location.href='products.html?search='+this.value">
        </div>
        
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center gap-1">
            <li class="nav-item">
              <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">
                <i class="fas fa-home me-1"></i> Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'products' ? 'active' : ''}" href="products.html">
                <i class="fas fa-pills me-1"></i> Products
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'orders' ? 'active' : ''}" href="orders.html">
                <i class="fas fa-clipboard-list me-1"></i> Orders
              </a>
            </li>
            <li class="nav-item nav-cart-badge">
              <a class="nav-link ${activePage === 'cart' ? 'active' : ''}" href="cart.html">
                <i class="fas fa-shopping-cart me-1"></i> Cart
                <span class="badge cart-count" style="display:${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
              </a>
            </li>
            <li class="nav-item">
              ${user ? `
                <div class="dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i> ${Utils.sanitize(user.name)}
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>My Profile</a></li>
                    <li><a class="dropdown-item" href="orders.html"><i class="fas fa-box me-2"></i>My Orders</a></li>
                    ${user.role === 'admin' ? '<li><a class="dropdown-item" href="admin/dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Admin Panel</a></li>' : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="Auth.logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                  </ul>
                </div>
              ` : `
                <a class="nav-link ${activePage === 'profile' ? 'active' : ''}" href="profile.html">
                  <i class="fas fa-user me-1"></i> Login
                </a>
              `}
            </li>
          </ul>
        </div>
      </div>
    </nav>`;
  },

  /**
   * Get footer HTML (shared across pages)
   */
  getFooterHTML() {
    const settings = this.getSettings();
    return `
    <footer class="footer-section">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <div class="footer-brand">SHOBHA <span>MEDICAL</span></div>
            <p class="mt-3">Your trusted health partner since 2005. We provide genuine medicines, health products, and medical devices at the best prices with doorstep delivery.</p>
            <div class="footer-social">
              <a href="#"><i class="fab fa-facebook-f"></i></a>
              <a href="#"><i class="fab fa-twitter"></i></a>
              <a href="#"><i class="fab fa-instagram"></i></a>
              <a href="#"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-6">
            <h5>Quick Links</h5>
            <ul class="footer-links">
              <li><a href="index.html"><i class="fas fa-chevron-right"></i> Home</a></li>
              <li><a href="products.html"><i class="fas fa-chevron-right"></i> Products</a></li>
              <li><a href="orders.html"><i class="fas fa-chevron-right"></i> Track Order</a></li>
              <li><a href="profile.html"><i class="fas fa-chevron-right"></i> My Account</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5>Categories</h5>
            <ul class="footer-links">
              <li><a href="products.html?category=Medicines"><i class="fas fa-chevron-right"></i> Medicines</a></li>
              <li><a href="products.html?category=Supplements"><i class="fas fa-chevron-right"></i> Supplements</a></li>
              <li><a href="products.html?category=Medical Devices"><i class="fas fa-chevron-right"></i> Medical Devices</a></li>
              <li><a href="products.html?category=Ayurvedic"><i class="fas fa-chevron-right"></i> Ayurvedic</a></li>
              <li><a href="products.html?category=Personal Care"><i class="fas fa-chevron-right"></i> Personal Care</a></li>
            </ul>
          </div>
          <div class="col-lg-3 col-md-6">
            <h5>Contact Us</h5>
            <ul class="footer-links">
              <li><a href="tel:${settings.phone || ''}"><i class="fas fa-phone"></i> ${settings.phone || '+91 9970 670610'}</a></li>
              <li><a href="mailto:${settings.email || ''}"><i class="fas fa-envelope"></i> ${settings.email || 'shobhamedicalstores01@gmail.com'}</a></li>
              <li><a href="#"><i class="fas fa-map-marker-alt"></i> ${settings.address ? settings.address.split(',')[0] : 'Nanded, Maharashtra'}</a></li>
              <li><a href="#"><i class="fas fa-clock"></i> ${settings.working_hours ? settings.working_hours.split(',')[0] : 'Mon-Sat: 8AM-10PM'}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} SHOBHA MEDICAL STORES. All Rights Reserved. | Made with ❤️ by Sneha Vishwakarma</p>
        </div>
      </div>
    </footer>`;
  }
};

// Make globally available
window.App = App;
