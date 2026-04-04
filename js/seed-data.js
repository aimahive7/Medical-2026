/* ============================================
   SHOBHA MEDICAL STORES — Seed Data
   50+ Realistic Medical Products & Sample Data
   ============================================ */

const SeedData = {
  /**
   * Initialize all seed data on first visit
   */
  async init() {
    if (!localStorage.getItem('sms_initialized')) {
      this.seedProducts();
      this.seedSettings();
      await this.seedAdminUser();
      await this.seedSampleCustomers();
      this.seedSampleOrders();
      localStorage.setItem('sms_initialized', 'true');
      console.log('✅ Shobha Medical Stores — Data seeded successfully');
    }
  },

  /**
   * Force re-seed (for development)
   */
  reset() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sms_'));
    keys.forEach(k => localStorage.removeItem(k));
    this.init();
  },

  /**
   * Seed 55 medical products
   */
  seedProducts() {
    const products = [
      // --- Medicines (15) ---
      { id: Utils.generateId(), name: "Dolo 650mg", description: "Paracetamol tablet for fever and mild pain relief. Suitable for adults and children above 12 years.", category: "Medicines", price: 32, cost_price: 22, stock_qty: 250, dosage: "650mg", strength: "Tablet", image: "", expiry_date: "2027-06-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Crocin Advance 500mg", description: "Fast-acting paracetamol for quick fever and headache relief. MicroQuick technology for faster action.", category: "Medicines", price: 28, cost_price: 18, stock_qty: 180, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-08-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Azithromycin 500mg", description: "Antibiotic for bacterial infections. Used to treat respiratory, skin, ear, and eye infections.", category: "Medicines", price: 85, cost_price: 55, stock_qty: 120, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-04-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Pan-D Capsule", description: "Pantoprazole + Domperidone combination for acid reflux, gastritis, and indigestion.", category: "Medicines", price: 145, cost_price: 95, stock_qty: 90, dosage: "40mg/30mg", strength: "Capsule", image: "", expiry_date: "2027-12-01", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Cetirizine 10mg", description: "Antihistamine tablet for allergic rhinitis, hay fever, and skin allergies.", category: "Medicines", price: 18, cost_price: 10, stock_qty: 300, dosage: "10mg", strength: "Tablet", image: "", expiry_date: "2028-01-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Amoxicillin 250mg", description: "Broad-spectrum antibiotic for treating bacterial infections of the chest, ear, and urinary tract.", category: "Medicines", price: 65, cost_price: 42, stock_qty: 7, dosage: "250mg", strength: "Capsule", image: "", expiry_date: "2027-05-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Metformin 500mg", description: "Oral antidiabetic drug used to manage type 2 diabetes mellitus.", category: "Medicines", price: 22, cost_price: 12, stock_qty: 400, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-09-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Amlodipine 5mg", description: "Calcium channel blocker for hypertension and angina. Once daily dosing.", category: "Medicines", price: 35, cost_price: 20, stock_qty: 200, dosage: "5mg", strength: "Tablet", image: "", expiry_date: "2028-03-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Omeprazole 20mg", description: "Proton pump inhibitor for acid reflux disease and peptic ulcers.", category: "Medicines", price: 45, cost_price: 28, stock_qty: 150, dosage: "20mg", strength: "Capsule", image: "", expiry_date: "2027-11-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Ibuprofen 400mg", description: "NSAID for pain, inflammation, and fever. Useful for muscular and joint pain.", category: "Medicines", price: 25, cost_price: 14, stock_qty: 280, dosage: "400mg", strength: "Tablet", image: "", expiry_date: "2027-07-25", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Montelukast 10mg", description: "Leukotriene receptor antagonist for asthma and allergic rhinitis.", category: "Medicines", price: 120, cost_price: 78, stock_qty: 0, dosage: "10mg", strength: "Tablet", image: "", expiry_date: "2027-10-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Vitamin D3 Drops", description: "Cholecalciferol oral drops 60000 IU for vitamin D deficiency.", category: "Medicines", price: 110, cost_price: 70, stock_qty: 85, dosage: "60000IU/ml", strength: "Drops", image: "", expiry_date: "2028-02-28", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Ranitidine 150mg", description: "H2 receptor blocker for reducing stomach acid. Used for gastric ulcers.", category: "Medicines", price: 38, cost_price: 22, stock_qty: 160, dosage: "150mg", strength: "Tablet", image: "", expiry_date: "2027-06-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Levofloxacin 500mg", description: "Fluoroquinolone antibiotic for severe bacterial infections.", category: "Medicines", price: 95, cost_price: 62, stock_qty: 3, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-08-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Combiflam Tablet", description: "Paracetamol + Ibuprofen combination for pain and fever. Dual action formula.", category: "Medicines", price: 30, cost_price: 18, stock_qty: 320, dosage: "325mg/400mg", strength: "Tablet", image: "", expiry_date: "2027-12-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },

      // --- Supplements (10) ---
      { id: Utils.generateId(), name: "HealthKart Multivitamin", description: "Daily multivitamin with 24 essential nutrients including vitamins and minerals.", category: "Supplements", price: 599, cost_price: 380, stock_qty: 60, dosage: "1 tablet/day", strength: "60 tablets", image: "", expiry_date: "2028-06-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Shelcal 500mg", description: "Calcium supplement with Vitamin D3 for strong bones and teeth.", category: "Supplements", price: 175, cost_price: 115, stock_qty: 95, dosage: "500mg", strength: "30 tablets", image: "", expiry_date: "2028-01-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Becosules Z Capsules", description: "B-complex with Zinc for overall health, energy, and immunity.", category: "Supplements", price: 120, cost_price: 72, stock_qty: 130, dosage: "1 capsule/day", strength: "20 capsules", image: "", expiry_date: "2027-11-25", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Omega-3 Fish Oil 1000mg", description: "Essential fatty acids for heart health, brain function, and joint support.", category: "Supplements", price: 450, cost_price: 280, stock_qty: 45, dosage: "1000mg", strength: "60 softgels", image: "", expiry_date: "2028-04-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Iron + Folic Acid Tablets", description: "Iron supplement with folic acid for anemia prevention and treatment.", category: "Supplements", price: 85, cost_price: 50, stock_qty: 200, dosage: "100mg/0.5mg", strength: "30 tablets", image: "", expiry_date: "2027-09-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Zinc Tablets 50mg", description: "Essential mineral for immunity, wound healing, and cell growth.", category: "Supplements", price: 95, cost_price: 58, stock_qty: 110, dosage: "50mg", strength: "60 tablets", image: "", expiry_date: "2028-03-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Protein Powder Chocolate", description: "Whey protein powder for muscle recovery and daily protein needs.", category: "Supplements", price: 1250, cost_price: 850, stock_qty: 25, dosage: "30g scoop", strength: "1kg", image: "", expiry_date: "2028-05-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Biotin 10000mcg", description: "High-strength biotin for healthy hair, skin, and nails.", category: "Supplements", price: 350, cost_price: 210, stock_qty: 70, dosage: "10000mcg", strength: "60 tablets", image: "", expiry_date: "2028-02-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Vitamin C 1000mg", description: "High-dose Vitamin C for immune support and antioxidant protection.", category: "Supplements", price: 220, cost_price: 140, stock_qty: 150, dosage: "1000mg", strength: "30 tablets", image: "", expiry_date: "2028-07-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Probiotics Capsules", description: "10 billion CFU probiotic for gut health and digestive balance.", category: "Supplements", price: 380, cost_price: 240, stock_qty: 55, dosage: "10B CFU", strength: "30 capsules", image: "", expiry_date: "2027-12-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },

      // --- Medical Devices (8) ---
      { id: Utils.generateId(), name: "Digital Thermometer", description: "Accurate digital body thermometer with LCD display. Quick 10-second reading.", category: "Medical Devices", price: 199, cost_price: 120, stock_qty: 40, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Blood Pressure Monitor", description: "Automatic digital BP monitor for upper arm. Memory for 60 readings.", category: "Medical Devices", price: 1850, cost_price: 1200, stock_qty: 15, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Pulse Oximeter", description: "Fingertip pulse oximeter for SpO2 and heart rate monitoring.", category: "Medical Devices", price: 750, cost_price: 450, stock_qty: 30, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Glucometer Kit", description: "Blood glucose monitoring kit with 25 test strips and lancets.", category: "Medical Devices", price: 980, cost_price: 620, stock_qty: 20, dosage: "", strength: "", image: "", expiry_date: "2028-06-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Nebulizer Machine", description: "Compressor nebulizer for respiratory treatment. Includes adult and child masks.", category: "Medical Devices", price: 2200, cost_price: 1500, stock_qty: 8, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Weighing Scale Digital", description: "Precision digital weighing scale with BMI calculator. 180kg capacity.", category: "Medical Devices", price: 899, cost_price: 550, stock_qty: 12, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Stethoscope Dual Head", description: "Professional dual-head stethoscope for auscultation.", category: "Medical Devices", price: 520, cost_price: 310, stock_qty: 0, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Heating Pad Electric", description: "Electric heating pad for pain relief. 3 heat settings.", category: "Medical Devices", price: 650, cost_price: 400, stock_qty: 18, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },

      // --- Personal Care (8) ---
      { id: Utils.generateId(), name: "N95 Face Masks (Pack of 10)", description: "5-layer N95 respirator masks for protection against airborne particles.", category: "Personal Care", price: 250, cost_price: 160, stock_qty: 500, dosage: "", strength: "10 masks", image: "", expiry_date: "2028-12-31", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Hand Sanitizer 500ml", description: "70% alcohol-based hand sanitizer with aloe vera. Kills 99.9% germs.", category: "Personal Care", price: 120, cost_price: 70, stock_qty: 200, dosage: "", strength: "500ml", image: "", expiry_date: "2028-03-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Surgical Gloves (Box of 100)", description: "Disposable nitrile examination gloves. Powder-free, latex-free.", category: "Personal Care", price: 380, cost_price: 240, stock_qty: 35, dosage: "", strength: "100 gloves", image: "", expiry_date: "2028-09-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Betadine Antiseptic Solution", description: "Povidone-iodine antiseptic solution for wound cleaning and disinfection.", category: "Personal Care", price: 95, cost_price: 60, stock_qty: 80, dosage: "5% w/v", strength: "100ml", image: "", expiry_date: "2027-10-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Dettol Liquid 500ml", description: "Antiseptic disinfectant liquid for skin, surface, and laundry disinfection.", category: "Personal Care", price: 145, cost_price: 90, stock_qty: 100, dosage: "", strength: "500ml", image: "", expiry_date: "2028-08-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Cotton Roll 500g", description: "Absorbent cotton wool roll for medical and personal use.", category: "Personal Care", price: 85, cost_price: 50, stock_qty: 75, dosage: "", strength: "500g", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Adhesive Bandage Strips", description: "Flexible fabric adhesive bandages for minor cuts and wounds. Pack of 100.", category: "Personal Care", price: 65, cost_price: 35, stock_qty: 150, dosage: "", strength: "100 strips", image: "", expiry_date: "2028-06-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Vicks VapoRub 50ml", description: "Topical cough suppressant and nasal decongestant.", category: "Personal Care", price: 155, cost_price: 100, stock_qty: 90, dosage: "", strength: "50ml", image: "", expiry_date: "2028-04-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },

      // --- Baby Care (6) ---
      { id: Utils.generateId(), name: "Baby Gripe Water 150ml", description: "Ayurvedic gripe water for infant colic, gas, and digestive discomfort.", category: "Baby Care", price: 85, cost_price: 52, stock_qty: 60, dosage: "5ml/dose", strength: "150ml", image: "", expiry_date: "2027-12-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Baby Diapers (Medium, 50pcs)", description: "Ultra-soft disposable diapers with wetness indicator. Size Medium (6-11kg).", category: "Baby Care", price: 650, cost_price: 420, stock_qty: 40, dosage: "", strength: "50 diapers", image: "", expiry_date: "", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Baby Massage Oil 200ml", description: "Natural baby massage oil with olive and almond oil blend.", category: "Baby Care", price: 180, cost_price: 110, stock_qty: 55, dosage: "", strength: "200ml", image: "", expiry_date: "2028-05-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Infant Nasal Drops", description: "Saline nasal drops for infants. Clears nasal congestion safely.", category: "Baby Care", price: 45, cost_price: 25, stock_qty: 80, dosage: "0.65%", strength: "15ml", image: "", expiry_date: "2027-10-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Baby Soap Gentle 100g", description: "Mild, pH-balanced baby soap with no harsh chemicals.", category: "Baby Care", price: 75, cost_price: 45, stock_qty: 100, dosage: "", strength: "100g", image: "", expiry_date: "2028-09-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Pediatric Paracetamol Syrup", description: "Paracetamol oral suspension for children. Cherry flavored.", category: "Baby Care", price: 55, cost_price: 32, stock_qty: 5, dosage: "120mg/5ml", strength: "60ml", image: "", expiry_date: "2027-08-25", status: "active", is_hidden: false, created_at: new Date().toISOString() },

      // --- Ayurvedic (8) ---
      { id: Utils.generateId(), name: "Chyawanprash 500g", description: "Ayurvedic immunity booster with Amla and 40+ herbs.", category: "Ayurvedic", price: 280, cost_price: 180, stock_qty: 70, dosage: "1 tsp/day", strength: "500g", image: "", expiry_date: "2028-01-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Ashwagandha Capsules", description: "KSM-66 Ashwagandha for stress relief, energy, and vitality.", category: "Ayurvedic", price: 350, cost_price: 220, stock_qty: 50, dosage: "500mg", strength: "60 capsules", image: "", expiry_date: "2028-04-15", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Tulsi Drops 30ml", description: "Concentrated Tulsi extract for immunity and respiratory health.", category: "Ayurvedic", price: 120, cost_price: 72, stock_qty: 90, dosage: "5 drops", strength: "30ml", image: "", expiry_date: "2027-11-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Triphala Churna 100g", description: "Classic Ayurvedic digestive formula for gut health.", category: "Ayurvedic", price: 95, cost_price: 55, stock_qty: 65, dosage: "5g/day", strength: "100g", image: "", expiry_date: "2028-02-28", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Brahmi Capsules", description: "Brain tonic for memory, focus, and cognitive function.", category: "Ayurvedic", price: 280, cost_price: 170, stock_qty: 40, dosage: "250mg", strength: "60 capsules", image: "", expiry_date: "2028-06-10", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Giloy Juice 500ml", description: "Guduchi/Giloy herbal juice for immunity and detox.", category: "Ayurvedic", price: 165, cost_price: 100, stock_qty: 55, dosage: "15ml 2x/day", strength: "500ml", image: "", expiry_date: "2027-09-20", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Aloe Vera Gel 200ml", description: "Pure aloe vera gel for skin care, burns, and hydration.", category: "Ayurvedic", price: 110, cost_price: 65, stock_qty: 85, dosage: "", strength: "200ml", image: "", expiry_date: "2028-03-30", status: "active", is_hidden: false, created_at: new Date().toISOString() },
      { id: Utils.generateId(), name: "Neem Capsules", description: "Neem extract for blood purification and skin health.", category: "Ayurvedic", price: 140, cost_price: 85, stock_qty: 0, dosage: "500mg", strength: "60 capsules", image: "", expiry_date: "2027-12-15", status: "active", is_hidden: false, created_at: new Date().toISOString() }
    ];

    localStorage.setItem('sms_products', JSON.stringify(products));
  },

  /**
   * Seed shop settings
   */
  seedSettings() {
    const settings = {
      shop_name: "SHOBHA MEDICAL STORES",
      tagline: "Your Trusted Health Partner",
      gst_number: "27AABCS1234A1ZV",
      gst_rate: 18,
      low_stock_threshold: 10,
      phone: "9970670610",
      email: "info@shobhamedical.com",
      address: "ND-41, SAMBHAJI CHOWK, CIDCO NANDED-431603.",
      dl_no: "20-324111  21-324112",
      fdl_no: "21519324000092",
      jurisdiction: "NANDED",
      payment_methods: {
        cod: true,
        upi: true,
        card: true,
        netbanking: false
      },
      delivery_charge: 40,
      free_delivery_above: 500,
      currency: "INR",
      working_hours: "Mon-Sat: 8:00 AM - 10:00 PM, Sun: 9:00 AM - 2:00 PM"
    };

    localStorage.setItem('sms_settings', JSON.stringify(settings));
  },

  /**
   * Seed admin user
   */
  async seedAdminUser() {
    const adminHash = await Utils.hashPassword('admin123');
    const users = [
      {
        id: Utils.generateId(),
        name: "Admin",
        email: "admin@shobha.com",
        password_hash: adminHash,
        role: "admin",
        phone: "9876543210",
        addresses: [],
        created_at: new Date().toISOString()
      }
    ];

    localStorage.setItem('sms_users', JSON.stringify(users));
  },

  /**
   * Seed sample customers
   */
  async seedSampleCustomers() {
    const hash = await Utils.hashPassword('customer123');
    const existingUsers = JSON.parse(localStorage.getItem('sms_users') || '[]');

    const customers = [
      {
        id: Utils.generateId(),
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        password_hash: hash,
        role: "customer",
        phone: "9876543201",
        addresses: [{ id: 1, label: "Home", line1: "42, MG Road", city: "Pune", state: "Maharashtra", pincode: "411001" }],
        created_at: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: Utils.generateId(),
        name: "Priya Sharma",
        email: "priya@example.com",
        password_hash: hash,
        role: "customer",
        phone: "9876543202",
        addresses: [{ id: 1, label: "Home", line1: "15, FC Road", city: "Pune", state: "Maharashtra", pincode: "411004" }],
        created_at: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        id: Utils.generateId(),
        name: "Amit Patil",
        email: "amit@example.com",
        password_hash: hash,
        role: "customer",
        phone: "9876543203",
        addresses: [{ id: 1, label: "Home", line1: "78, Karve Road", city: "Pune", state: "Maharashtra", pincode: "411038" }],
        created_at: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ];

    localStorage.setItem('sms_users', JSON.stringify([...existingUsers, ...customers]));
  },

  /**
   * Seed sample orders
   */
  seedSampleOrders() {
    const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
    const products = JSON.parse(localStorage.getItem('sms_products') || '[]');
    const customers = users.filter(u => u.role === 'customer');

    if (customers.length === 0 || products.length === 0) return;

    const statuses = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered'];
    const orders = [];

    // Generate 8 sample orders
    for (let i = 0; i < 8; i++) {
      const customer = customers[i % customers.length];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      const usedIds = new Set();

      for (let j = 0; j < numItems; j++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (usedIds.has(product.id));
        usedIds.add(product.id);

        const qty = Math.floor(Math.random() * 3) + 1;
        items.push({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: qty
        });
      }

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = Utils.calculateTax(subtotal);
      const status = statuses[Math.min(i, statuses.length - 1)];
      const daysAgo = (8 - i) * 3;

      orders.push({
        id: Utils.generateId(),
        order_number: Utils.generateNumber('ORD'),
        user_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: subtotal + tax,
        status: status,
        payment_method: i % 2 === 0 ? 'COD' : 'UPI',
        address: customer.addresses[0] || { line1: 'N/A', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
        notes: '',
        created_at: new Date(Date.now() - 86400000 * daysAgo).toISOString(),
        confirmed_at: status !== 'pending' ? new Date(Date.now() - 86400000 * (daysAgo - 1)).toISOString() : null,
        delivered_at: status === 'delivered' ? new Date(Date.now() - 86400000 * (daysAgo - 3)).toISOString() : null
      });
    }

    localStorage.setItem('sms_orders', JSON.stringify(orders));
    localStorage.setItem('sms_estimates', JSON.stringify([]));
    localStorage.setItem('sms_invoices', JSON.stringify([]));
    localStorage.setItem('sms_stock_history', JSON.stringify([]));
  }
};

// Make globally available
window.SeedData = SeedData;
