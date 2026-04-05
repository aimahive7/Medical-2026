/* ============================================
   SHOBHA MEDICAL STORES — Utility Functions
   ============================================ */

const Utils = {
  /**
   * Format currency in INR
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Format date in dd-mm-yyyy format
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  },

  /**
   * Format date with time
   */
  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return `${this.formatDate(dateStr)} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Generate order/estimate/invoice number
   */
  generateNumber(prefix) {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${num}`;
  },

  /**
   * Debounce function for search
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitize(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Hash password using SHA-256
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Get stock status label & class
   */
  getStockStatus(qty, threshold = 10) {
    if (qty <= 0) return { label: 'Out of Stock', class: 'out-of-stock', icon: 'fa-times-circle' };
    if (qty <= threshold) return { label: 'Low Stock', class: 'low-stock', icon: 'fa-exclamation-triangle' };
    return { label: 'In Stock', class: 'in-stock', icon: 'fa-check-circle' };
  },

  /**
   * Get order status info
   */
  getOrderStatusInfo(status) {
    const statuses = {
      'pending': { label: 'Pending', class: 'status-pending', icon: 'fa-clock' },
      'pending_approval': { label: 'Pending Approval', class: 'status-pending-approval', icon: 'fa-hourglass-half' },
      'approved': { label: 'Approved', class: 'status-approved', icon: 'fa-check-circle' },
      'rejected': { label: 'Rejected', class: 'status-rejected', icon: 'fa-times-circle' },
      'confirmed': { label: 'Confirmed', class: 'status-confirmed', icon: 'fa-check' },
      'packed': { label: 'Packed', class: 'status-packed', icon: 'fa-box' },
      'dispatched': { label: 'Dispatched', class: 'status-dispatched', icon: 'fa-truck' },
      'delivered': { label: 'Delivered', class: 'status-delivered', icon: 'fa-check-double' },
      'cancelled': { label: 'Cancelled', class: 'status-cancelled', icon: 'fa-times' }
    };
    return statuses[status] || statuses['pending'];
  },

  /**
   * Calculate tax (additive — old method kept for backward compat)
   */
  calculateTax(subtotal, rate = 18) {
    return (subtotal * rate) / 100;
  },

  /**
   * Calculate base price from MRP (GST INCLUSIVE)
   * Formula: Base = MRP / (1 + GST%/100)
   */
  calculateBasePrice(mrp, gstRate) {
    if (!gstRate || gstRate <= 0) return mrp;
    return mrp / (1 + gstRate / 100);
  },

  /**
   * Calculate GST amount from MRP (GST INCLUSIVE)
   * Formula: GST = MRP - Base
   */
  calculateGSTFromMRP(mrp, gstRate) {
    if (!gstRate || gstRate <= 0) return 0;
    return mrp - this.calculateBasePrice(mrp, gstRate);
  },

  /**
   * Get default GST rate by product category
   */
  getDefaultGSTRate(category) {
    const rates = {
      'Medicines': 5,
      'Supplements': 5,
      'Medical Devices': 18,
      'Personal Care': 18,
      'Baby Care': 5,
      'Ayurvedic': 5,
      'Surgical': 18
    };
    return rates[category] || 12;
  },

  /**
   * Check if a date is expired (past today)
   */
  isExpired(dateStr) {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiry < today;
  },

  /**
   * Check if expiring within N months (default 3)
   */
  isExpiringSoon(dateStr, months = 3) {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() + months);
    return expiry <= threshold && !this.isExpired(dateStr);
  },

  /**
   * Format GST rate display
   */
  formatGSTRate(rate) {
    return `${parseFloat(rate)}%`;
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info} toast-icon"></i>
      <span class="toast-msg">${this.sanitize(message)}</span>
      <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  },

  /**
   * Format relative time
   */
  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return this.formatDate(dateStr);
  },

  /**
   * Get URL parameters
   */
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  /**
   * Set URL parameter without reload
   */
  setUrlParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    history.pushState({}, '', url);
  },

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      'Medicines': 'fa-pills',
      'Supplements': 'fa-capsules',
      'Medical Devices': 'fa-heartbeat',
      'Personal Care': 'fa-pump-soap',
      'Baby Care': 'fa-baby',
      'Ayurvedic': 'fa-leaf',
      'First Aid': 'fa-first-aid',
      'Diabetes': 'fa-tint',
      'Skin Care': 'fa-spa',
      'Health Drinks': 'fa-mug-hot'
    };
    return icons[category] || 'fa-pills';
  },

  /**
   * Get category color class
   */
  getCategoryColorClass(category) {
    const classes = {
      'Medicines': 'medicines',
      'Supplements': 'supplements',
      'Medical Devices': 'devices',
      'Personal Care': 'personal',
      'Baby Care': 'baby',
      'Ayurvedic': 'ayurvedic'
    };
    return classes[category] || 'medicines';
  },

  /**
   * Validate email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate phone (Indian)
   */
  isValidPhone(phone) {
    return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
  },

  /**
   * Truncate text
   */
  truncate(str, maxLen = 50) {
    if (!str || str.length <= maxLen) return str;
    return str.substr(0, maxLen) + '...';
  },

  /**
   * Scroll to top smoothly
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Make globally available
window.Utils = Utils;
