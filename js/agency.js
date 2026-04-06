/* ============================================
   SHOBHA MEDICAL STORES — Agency Master
   CRUD operations and data management
   ============================================ */

const Agency = {
  COLLECTION: 'agencies',

  /**
   * Get all agencies
   */
  getAll() {
    return App.getAll(this.COLLECTION);
  },

  /**
   * Get agency by ID
   */
  getById(id) {
    return App.getById(this.COLLECTION, id);
  },

  /**
   * Add new agency
   */
  add(agencyData) {
    const errors = this.validate(agencyData);
    if (errors.length > 0) return { success: false, errors };

    const agency = {
      id: Utils.generateId(),
      ...agencyData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    App.add(this.COLLECTION, agency);
    return { success: true, agency };
  },

  /**
   * Update existing agency
   */
  update(id, updates) {
    const errors = this.validate(updates, true);
    if (errors.length > 0) return { success: false, errors };

    const updated = App.update(this.COLLECTION, id, {
      ...updates,
      updated_at: new Date().toISOString()
    });

    return { success: !!updated, agency: updated };
  },

  /**
   * Delete agency
   */
  delete(id) {
    return App.delete(this.COLLECTION, id);
  },

  /**
   * Validate agency data
   */
  validate(data, isUpdate = false) {
    const errors = [];
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || !data.name.trim()) errors.push('Agency Name is required');
    }
    
    if (data.email && !Utils.isValidEmail(data.email)) {
      errors.push('Invalid Email ID');
    }
    
    if (data.contact && !Utils.isValidPhone(data.contact)) {
      errors.push('Invalid Contact Number');
    }

    return errors;
  },

  /**
   * Get agency by name (for inward autocomplete/lookup)
   */
  getByName(name) {
    const agencies = this.getAll();
    return agencies.find(a => a.name.toLowerCase().trim() === name.toLowerCase().trim());
  }
};

// Make globally available
window.Agency = Agency;
