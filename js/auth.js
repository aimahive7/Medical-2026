/* ============================================
   SHOBHA MEDICAL STORES — Authentication
   Login, Register, Session Management
   ============================================ */

const Auth = {
  SESSION_KEY: 'sms_session',

  /**
   * Initialize auth state
   */
  init() {
    // Check session expiry
    const session = this.getSession();
    if (session && session.expires_at) {
      if (new Date(session.expires_at) < new Date()) {
        this.clearSession();
      }
    }
  },

  /**
   * Register a new user
   */
  async register(userData) {
    const users = App.getAll('users');

    // Check if email exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered. Please login.' };
    }

    // Validate
    if (!Utils.isValidEmail(userData.email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!userData.name || userData.name.trim().length < 2) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (!userData.password || userData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // Hash password
    const password_hash = await Utils.hashPassword(userData.password);

    const user = {
      id: Utils.generateId(),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password_hash: password_hash,
      role: 'customer',
      phone: userData.phone || '',
      addresses: [],
      created_at: new Date().toISOString()
    };

    App.add('users', user);

    // Auto login
    this.createSession(user);

    return { success: true, message: 'Account created successfully!', user: user };
  },

  /**
   * Login user
   */
  async login(email, password) {
    const users = App.getAll('users');
    const password_hash = await Utils.hashPassword(password);

    const user = users.find(u =>
      u.email === email.toLowerCase().trim() &&
      u.password_hash === password_hash
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    this.createSession(user);
    return { success: true, message: `Welcome back, ${user.name}!`, user: user };
  },

  /**
   * Admin login
   */
  async adminLogin(email, password) {
    const result = await this.login(email, password);
    if (!result.success) return result;

    if (result.user.role !== 'admin') {
      this.clearSession();
      return { success: false, message: 'Access denied. Admin privileges required.' };
    }

    return result;
  },

  /**
   * Logout
   */
  logout() {
    this.clearSession();
    Utils.showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = window.location.pathname.includes('/admin/') ? 'login.html' : 'profile.html';
    }, 500);
  },

  /**
   * Create session
   */
  createSession(user) {
    const session = {
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  /**
   * Get current session
   */
  getSession() {
    return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
  },

  /**
   * Clear session
   */
  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.getSession() !== null;
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const session = this.getSession();
    return session && session.role === 'admin';
  },

  /**
   * Get current user object
   */
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return App.getById('users', session.user_id);
  },

  /**
   * Update user profile
   */
  updateProfile(updates) {
    const session = this.getSession();
    if (!session) return { success: false, message: 'Not logged in.' };

    const user = App.update('users', session.user_id, updates);
    if (!user) return { success: false, message: 'User not found.' };

    // Update session name/email if changed
    if (updates.name) session.name = updates.name;
    if (updates.email) session.email = updates.email;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Profile updated.', user: user };
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    const session = this.getSession();
    if (!session) return { success: false, message: 'Not logged in.' };

    const user = App.getById('users', session.user_id);
    const currentHash = await Utils.hashPassword(currentPassword);

    if (user.password_hash !== currentHash) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    const newHash = await Utils.hashPassword(newPassword);
    App.update('users', session.user_id, { password_hash: newHash });

    return { success: true, message: 'Password changed successfully.' };
  },

  /**
   * Protect page — redirect if not logged in
   */
  requireAuth(redirectTo = 'profile.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  },

  /**
   * Protect admin page
   */
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = window.location.pathname.includes('/admin/') ? 'login.html' : '../profile.html';
      return false;
    }
    return true;
  }
};

// Make globally available
window.Auth = Auth;
