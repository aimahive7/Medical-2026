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
    console.log('🏥 Shobha Medical Stores — App initialized');
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
      // Also hide out-of-stock if configured
      if (filters.hideOutOfStock) {
        products = products.filter(p => p.stock_qty > 0);
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
        p.category.toLowerCase().includes(q)
      );
    }

    // Price filter
    if (filters.minPrice !== undefined) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }

    // Stock filter
    if (filters.stockStatus === 'in-stock') {
      products = products.filter(p => p.stock_qty > 10);
    } else if (filters.stockStatus === 'low-stock') {
      const threshold = this.getSettings().low_stock_threshold || 10;
      products = products.filter(p => p.stock_qty > 0 && p.stock_qty <= threshold);
    } else if (filters.stockStatus === 'out-of-stock') {
      products = products.filter(p => p.stock_qty <= 0);
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
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
    if (product.stock_qty <= 0) {
      Utils.showToast('Product is out of stock', 'error');
      return false;
    }

    const cart = this.getCart();
    const existing = cart.items.find(item => item.product_id === productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock_qty) {
        Utils.showToast(`Only ${product.stock_qty} available`, 'warning');
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

    if (quantity > product.stock_qty) {
      Utils.showToast(`Only ${product.stock_qty} available`, 'warning');
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
   * Get cart with product details
   */
  getCartDetails() {
    const cart = this.getCart();
    const settings = this.getSettings();
    const items = cart.items.map(item => {
      const product = this.getById('products', item.product_id);
      if (!product) return null;
      return {
        ...item,
        product: product,
        subtotal: product.price * item.quantity
      };
    }).filter(Boolean);

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Utils.calculateTax(subtotal, settings.gst_rate || 18);
    const deliveryCharge = subtotal >= (settings.free_delivery_above || 500) ? 0 : (settings.delivery_charge || 40);
    const total = subtotal + tax + deliveryCharge;

    return {
      items,
      subtotal,
      tax,
      taxRate: settings.gst_rate || 18,
      deliveryCharge,
      freeDeliveryAbove: settings.free_delivery_above || 500,
      total,
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

  /* ---------- ORDER HELPERS ---------- */

  /**
   * Place an order
   */
  placeOrder(orderData) {
    const cart = this.getCartDetails();
    if (cart.items.length === 0) return null;

    const user = Auth.getCurrentUser();
    
    const order = {
      id: Utils.generateId(),
      order_number: Utils.generateNumber('ORD'),
      user_id: user ? user.id : 'guest',
      customer_name: orderData.name,
      customer_email: orderData.email,
      customer_phone: orderData.phone,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal: cart.subtotal,
      tax: cart.tax,
      delivery_charge: cart.deliveryCharge,
      total: cart.total,
      status: 'pending',
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
      confirmed_at: null,
      delivered_at: null
    };

    // Reduce stock
    order.items.forEach(item => {
      const product = this.getById('products', item.product_id);
      if (product) {
        const newQty = Math.max(0, product.stock_qty - item.quantity);
        // Log stock change
        this.add('stock_history', {
          id: Utils.generateId(),
          product_id: item.product_id,
          product_name: item.name,
          qty_before: product.stock_qty,
          qty_after: newQty,
          action: 'sale',
          order_id: order.id,
          timestamp: new Date().toISOString()
        });
        this.update('products', item.product_id, { stock_qty: newQty });
      }
    });

    this.add('orders', order);
    this.clearCart();
    
    return order;
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
    const stock = Utils.getStockStatus(product.stock_qty, this.getSettings().low_stock_threshold || 10);
    const icon = Utils.getCategoryIcon(product.category);
    const isOutOfStock = product.stock_qty <= 0;

    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4 fade-in">
        <div class="product-card h-100">
          <div class="product-img">
            <i class="fas ${icon}"></i>
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
            <div class="product-footer">
              <span class="product-price">${Utils.formatCurrency(product.price)}</span>
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
              <li><a href="tel:${settings.phone || ''}"><i class="fas fa-phone"></i> ${settings.phone || '+91 98765 43210'}</a></li>
              <li><a href="mailto:${settings.email || ''}"><i class="fas fa-envelope"></i> ${settings.email || 'info@shobhamedical.com'}</a></li>
              <li><a href="#"><i class="fas fa-map-marker-alt"></i> ${settings.address ? settings.address.split(',')[0] : 'Pune, Maharashtra'}</a></li>
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
