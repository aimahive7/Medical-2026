/* ============================================
   SHOBHA MEDICAL STORES — Inward History
   Filtering and display logic
   ============================================ */

const InwardHistory = {
  /**
   * Filter bills based on criteria
   */
  filterBills(filters = {}) {
    let bills = Inward.getAll();
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      bills = bills.filter(b => 
        b.inward_number.toLowerCase().includes(q) ||
        b.agency_name.toLowerCase().includes(q) ||
        b.bill_no.toLowerCase().includes(q)
      );
    }
    
    if (filters.agency_id) {
      bills = bills.filter(b => b.agency_id === filters.agency_id);
    }
    
    if (filters.date_from) {
      bills = bills.filter(b => new Date(b.bill_date) >= new Date(filters.date_from));
    }
    
    if (filters.date_to) {
      bills = bills.filter(b => new Date(b.bill_date) <= new Date(filters.date_to));
    }
    
    // Sort by newest first
    return bills.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

window.InwardHistory = InwardHistory;
