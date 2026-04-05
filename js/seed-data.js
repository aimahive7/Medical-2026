/* ============================================
   SHOBHA MEDICAL STORES — Seed Data
   50+ Realistic Medical Products with Batch Tracking
   ============================================ */

const SeedData = {
  /**
   * Initialize all seed data on first visit
   */
  async init() {
    if (!localStorage.getItem('sms_initialized_v2')) {
      // Clear old v1 data if exists
      const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('sms_'));
      oldKeys.forEach(k => localStorage.removeItem(k));

      this.seedProducts();
      this.seedProductBatches();
      this.seedSettings();
      await this.seedAdminUser();
      await this.seedSampleCustomers();
      this.seedSampleOrders();
      this.seedCollections();
      localStorage.setItem('sms_initialized_v2', 'true');
      console.log('✅ Shobha Medical Stores — Data seeded (v2 with batches & GST)');
    }
  },

  /**
   * Force re-seed (for development)
   */
  reset() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sms_'));
    keys.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('sms_initialized_v2');
    this.init();
  },

  /**
   * Initialize empty collections
   */
  seedCollections() {
    if (!localStorage.getItem('sms_bills')) localStorage.setItem('sms_bills', '[]');
    if (!localStorage.getItem('sms_approvals')) localStorage.setItem('sms_approvals', '[]');
    if (!localStorage.getItem('sms_estimates')) localStorage.setItem('sms_estimates', '[]');
    if (!localStorage.getItem('sms_invoices')) localStorage.setItem('sms_invoices', '[]');
    if (!localStorage.getItem('sms_stock_history')) localStorage.setItem('sms_stock_history', '[]');
  },

  /**
   * Seed 55 medical products with new fields
   */
  seedProducts() {
    const products = [
      // --- Medicines (15) --- GST 5%
      { id: 'prod_001', name: "Dolo 650mg", description: "Paracetamol tablet for fever and mild pain relief. Suitable for adults and children above 12 years.", category: "Medicines", mrp: 32, ptr_rate: 22, price: 32, cost_price: 22, stock_qty: 250, dosage: "650mg", strength: "Tablet", image: "", expiry_date: "2027-06-15", status: "active", is_hidden: false, hsn_code: "3004", composition: "Paracetamol 650mg", manufacturer: "Micro Labs Ltd", about: "Dolo 650 is a widely prescribed paracetamol tablet used for fever, headache, body aches, and mild to moderate pain.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_002', name: "Crocin Advance 500mg", description: "Fast-acting paracetamol for quick fever and headache relief. MicroQuick technology for faster action.", category: "Medicines", mrp: 28, ptr_rate: 18, price: 28, cost_price: 18, stock_qty: 180, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-08-20", status: "active", is_hidden: false, hsn_code: "3004", composition: "Paracetamol 500mg", manufacturer: "GlaxoSmithKline", about: "Crocin Advance uses MicroQuick technology for faster absorption and quicker relief from pain and fever.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_003', name: "Azithromycin 500mg", description: "Antibiotic for bacterial infections. Used to treat respiratory, skin, ear, and eye infections.", category: "Medicines", mrp: 85, ptr_rate: 55, price: 85, cost_price: 55, stock_qty: 120, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-04-10", status: "active", is_hidden: false, hsn_code: "3004", composition: "Azithromycin 500mg", manufacturer: "Cipla Ltd", about: "A macrolide antibiotic used for various bacterial infections including respiratory tract, skin, and ENT infections.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_004', name: "Pan-D Capsule", description: "Pantoprazole + Domperidone combination for acid reflux, gastritis, and indigestion.", category: "Medicines", mrp: 145, ptr_rate: 95, price: 145, cost_price: 95, stock_qty: 90, dosage: "40mg/30mg", strength: "Capsule", image: "", expiry_date: "2027-12-01", status: "active", is_hidden: false, hsn_code: "3004", composition: "Pantoprazole 40mg + Domperidone 30mg", manufacturer: "Alkem Laboratories", about: "Combination medicine for GERD, acid reflux, and peptic ulcers.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_005', name: "Cetirizine 10mg", description: "Antihistamine tablet for allergic rhinitis, hay fever, and skin allergies.", category: "Medicines", mrp: 18, ptr_rate: 10, price: 18, cost_price: 10, stock_qty: 300, dosage: "10mg", strength: "Tablet", image: "", expiry_date: "2028-01-15", status: "active", is_hidden: false, hsn_code: "3004", composition: "Cetirizine Hydrochloride 10mg", manufacturer: "Zee Laboratories", about: "Non-drowsy antihistamine for allergies, rhinitis, and urticaria.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_006', name: "Amoxicillin 250mg", description: "Broad-spectrum antibiotic for treating bacterial infections of the chest, ear, and urinary tract.", category: "Medicines", mrp: 65, ptr_rate: 42, price: 65, cost_price: 42, stock_qty: 7, dosage: "250mg", strength: "Capsule", image: "", expiry_date: "2027-05-20", status: "active", is_hidden: false, hsn_code: "3004", composition: "Amoxicillin Trihydrate 250mg", manufacturer: "Cipla Ltd", about: "Penicillin-type antibiotic for chest, ear, urinary, and dental infections.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_007', name: "Metformin 500mg", description: "Oral antidiabetic drug used to manage type 2 diabetes mellitus.", category: "Medicines", mrp: 22, ptr_rate: 12, price: 22, cost_price: 12, stock_qty: 400, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-09-30", status: "active", is_hidden: false, hsn_code: "3004", composition: "Metformin Hydrochloride 500mg", manufacturer: "USV Pvt Ltd", about: "First-line oral medication for type 2 diabetes management.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_008', name: "Amlodipine 5mg", description: "Calcium channel blocker for hypertension and angina. Once daily dosing.", category: "Medicines", mrp: 35, ptr_rate: 20, price: 35, cost_price: 20, stock_qty: 200, dosage: "5mg", strength: "Tablet", image: "", expiry_date: "2028-03-15", status: "active", is_hidden: false, hsn_code: "3004", composition: "Amlodipine Besylate 5mg", manufacturer: "Micro Labs Ltd", about: "Used to treat high blood pressure and coronary artery disease.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_009', name: "Omeprazole 20mg", description: "Proton pump inhibitor for acid reflux disease and peptic ulcers.", category: "Medicines", mrp: 45, ptr_rate: 28, price: 45, cost_price: 28, stock_qty: 150, dosage: "20mg", strength: "Capsule", image: "", expiry_date: "2027-11-10", status: "active", is_hidden: false, hsn_code: "3004", composition: "Omeprazole 20mg", manufacturer: "Dr. Reddy's Labs", about: "Reduces stomach acid production for GERD and ulcer treatment.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_010', name: "Ibuprofen 400mg", description: "NSAID for pain, inflammation, and fever. Useful for muscular and joint pain.", category: "Medicines", mrp: 25, ptr_rate: 14, price: 25, cost_price: 14, stock_qty: 280, dosage: "400mg", strength: "Tablet", image: "", expiry_date: "2027-07-25", status: "active", is_hidden: false, hsn_code: "3004", composition: "Ibuprofen 400mg", manufacturer: "Abbott India", about: "Non-steroidal anti-inflammatory for pain, inflammation, and fever.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_011', name: "Montelukast 10mg", description: "Leukotriene receptor antagonist for asthma and allergic rhinitis.", category: "Medicines", mrp: 120, ptr_rate: 78, price: 120, cost_price: 78, stock_qty: 0, dosage: "10mg", strength: "Tablet", image: "", expiry_date: "2027-10-15", status: "active", is_hidden: false, hsn_code: "3004", composition: "Montelukast Sodium 10mg", manufacturer: "Sun Pharma", about: "Prevents and manages asthma attacks and allergic rhinitis symptoms.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_012', name: "Vitamin D3 Drops", description: "Cholecalciferol oral drops 60000 IU for vitamin D deficiency.", category: "Medicines", mrp: 110, ptr_rate: 70, price: 110, cost_price: 70, stock_qty: 85, dosage: "60000IU/ml", strength: "Drops", image: "", expiry_date: "2028-02-28", status: "active", is_hidden: false, hsn_code: "3004", composition: "Cholecalciferol 60000 IU", manufacturer: "Abbott India", about: "High-dose vitamin D supplement for deficiency treatment.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_013', name: "Ranitidine 150mg", description: "H2 receptor blocker for reducing stomach acid. Used for gastric ulcers.", category: "Medicines", mrp: 38, ptr_rate: 22, price: 38, cost_price: 22, stock_qty: 160, dosage: "150mg", strength: "Tablet", image: "", expiry_date: "2027-06-30", status: "active", is_hidden: false, hsn_code: "3004", composition: "Ranitidine Hydrochloride 150mg", manufacturer: "GNP Pharma", about: "Reduces stomach acid for ulcer and GERD treatment.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_014', name: "Levofloxacin 500mg", description: "Fluoroquinolone antibiotic for severe bacterial infections.", category: "Medicines", mrp: 95, ptr_rate: 62, price: 95, cost_price: 62, stock_qty: 3, dosage: "500mg", strength: "Tablet", image: "", expiry_date: "2027-08-10", status: "active", is_hidden: false, hsn_code: "3004", composition: "Levofloxacin Hemihydrate 500mg", manufacturer: "Cipla Ltd", about: "Broad-spectrum antibiotic for serious bacterial infections.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_015', name: "Combiflam Tablet", description: "Paracetamol + Ibuprofen combination for pain and fever. Dual action formula.", category: "Medicines", mrp: 30, ptr_rate: 18, price: 30, cost_price: 18, stock_qty: 320, dosage: "325mg/400mg", strength: "Tablet", image: "", expiry_date: "2027-12-15", status: "active", is_hidden: false, hsn_code: "3004", composition: "Paracetamol 325mg + Ibuprofen 400mg", manufacturer: "Sanofi India", about: "Dual-action formula for effective pain and fever relief.", gst_rate: 5, created_at: new Date().toISOString() },

      // --- Supplements (10) --- GST 5%
      { id: 'prod_016', name: "HealthKart Multivitamin", description: "Daily multivitamin with 24 essential nutrients including vitamins and minerals.", category: "Supplements", mrp: 599, ptr_rate: 380, price: 599, cost_price: 380, stock_qty: 60, dosage: "1 tablet/day", strength: "60 tablets", image: "", expiry_date: "2028-06-20", status: "active", is_hidden: false, hsn_code: "2106", composition: "Multivitamin + Multimineral", manufacturer: "HealthKart", about: "Complete daily nutrition with 24 essential vitamins and minerals.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_017', name: "Shelcal 500mg", description: "Calcium supplement with Vitamin D3 for strong bones and teeth.", category: "Supplements", mrp: 175, ptr_rate: 115, price: 175, cost_price: 115, stock_qty: 95, dosage: "500mg", strength: "30 tablets", image: "", expiry_date: "2028-01-15", status: "active", is_hidden: false, hsn_code: "2106", composition: "Calcium Carbonate 500mg + Vitamin D3", manufacturer: "Torrent Pharma", about: "Calcium and vitamin D3 supplement for bone health.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_018', name: "Becosules Z Capsules", description: "B-complex with Zinc for overall health, energy, and immunity.", category: "Supplements", mrp: 120, ptr_rate: 72, price: 120, cost_price: 72, stock_qty: 130, dosage: "1 capsule/day", strength: "20 capsules", image: "", expiry_date: "2027-11-25", status: "active", is_hidden: false, hsn_code: "2106", composition: "Vitamin B Complex + Zinc", manufacturer: "Pfizer", about: "Helps in energy metabolism and immune function.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_019', name: "Omega-3 Fish Oil 1000mg", description: "Essential fatty acids for heart health, brain function, and joint support.", category: "Supplements", mrp: 450, ptr_rate: 280, price: 450, cost_price: 280, stock_qty: 45, dosage: "1000mg", strength: "60 softgels", image: "", expiry_date: "2028-04-10", status: "active", is_hidden: false, hsn_code: "2106", composition: "Omega-3 Fatty Acids (EPA + DHA)", manufacturer: "HealthKart", about: "Supports cardiovascular health, brain function, and joint mobility.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_020', name: "Iron + Folic Acid Tablets", description: "Iron supplement with folic acid for anemia prevention and treatment.", category: "Supplements", mrp: 85, ptr_rate: 50, price: 85, cost_price: 50, stock_qty: 200, dosage: "100mg/0.5mg", strength: "30 tablets", image: "", expiry_date: "2027-09-15", status: "active", is_hidden: false, hsn_code: "2106", composition: "Ferrous Fumarate 100mg + Folic Acid 0.5mg", manufacturer: "Glaxo India", about: "Prevents and treats iron deficiency anemia.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_021', name: "Zinc Tablets 50mg", description: "Essential mineral for immunity, wound healing, and cell growth.", category: "Supplements", mrp: 95, ptr_rate: 58, price: 95, cost_price: 58, stock_qty: 110, dosage: "50mg", strength: "60 tablets", image: "", expiry_date: "2028-03-20", status: "active", is_hidden: false, hsn_code: "2106", composition: "Zinc Sulphate Monohydrate 50mg", manufacturer: "HealthKart", about: "Supports immune function and promotes wound healing.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_022', name: "Protein Powder Chocolate", description: "Whey protein powder for muscle recovery and daily protein needs.", category: "Supplements", mrp: 1250, ptr_rate: 850, price: 1250, cost_price: 850, stock_qty: 25, dosage: "30g scoop", strength: "1kg", image: "", expiry_date: "2028-05-30", status: "active", is_hidden: false, hsn_code: "2106", composition: "Whey Protein Concentrate", manufacturer: "HealthKart", about: "High-quality whey protein for muscle building and recovery.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_023', name: "Biotin 10000mcg", description: "High-strength biotin for healthy hair, skin, and nails.", category: "Supplements", mrp: 350, ptr_rate: 210, price: 350, cost_price: 210, stock_qty: 70, dosage: "10000mcg", strength: "60 tablets", image: "", expiry_date: "2028-02-15", status: "active", is_hidden: false, hsn_code: "2106", composition: "D-Biotin 10000mcg", manufacturer: "HealthKart", about: "Promotes healthy hair growth, clear skin, and strong nails.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_024', name: "Vitamin C 1000mg", description: "High-dose Vitamin C for immune support and antioxidant protection.", category: "Supplements", mrp: 220, ptr_rate: 140, price: 220, cost_price: 140, stock_qty: 150, dosage: "1000mg", strength: "30 tablets", image: "", expiry_date: "2028-07-10", status: "active", is_hidden: false, hsn_code: "2106", composition: "Ascorbic Acid 1000mg", manufacturer: "Limcee", about: "Boosts immunity and provides antioxidant protection.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_025', name: "Probiotics Capsules", description: "10 billion CFU probiotic for gut health and digestive balance.", category: "Supplements", mrp: 380, ptr_rate: 240, price: 380, cost_price: 240, stock_qty: 55, dosage: "10B CFU", strength: "30 capsules", image: "", expiry_date: "2027-12-20", status: "active", is_hidden: false, hsn_code: "2106", composition: "Lactobacillus + Bifidobacterium 10 Billion CFU", manufacturer: "Dabur", about: "Restores gut flora balance and supports digestive health.", gst_rate: 5, created_at: new Date().toISOString() },

      // --- Medical Devices (8) --- GST 18%
      { id: 'prod_026', name: "Digital Thermometer", description: "Accurate digital body thermometer with LCD display. Quick 10-second reading.", category: "Medical Devices", mrp: 199, ptr_rate: 120, price: 199, cost_price: 120, stock_qty: 40, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "Omron Healthcare", about: "Fast and accurate digital thermometer for body temperature measurement.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_027', name: "Blood Pressure Monitor", description: "Automatic digital BP monitor for upper arm. Memory for 60 readings.", category: "Medical Devices", mrp: 1850, ptr_rate: 1200, price: 1850, cost_price: 1200, stock_qty: 15, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "Omron Healthcare", about: "Clinically validated automatic blood pressure monitor with memory function.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_028', name: "Pulse Oximeter", description: "Fingertip pulse oximeter for SpO2 and heart rate monitoring.", category: "Medical Devices", mrp: 750, ptr_rate: 450, price: 750, cost_price: 450, stock_qty: 30, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "FingerTip", about: "Measures blood oxygen saturation (SpO2) and pulse rate instantly.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_029', name: "Glucometer Kit", description: "Blood glucose monitoring kit with 25 test strips and lancets.", category: "Medical Devices", mrp: 980, ptr_rate: 620, price: 980, cost_price: 620, stock_qty: 20, dosage: "", strength: "", image: "", expiry_date: "2028-06-30", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "Accu-Chek", about: "Complete blood glucose monitoring system for diabetic patients.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_030', name: "Nebulizer Machine", description: "Compressor nebulizer for respiratory treatment. Includes adult and child masks.", category: "Medical Devices", mrp: 2200, ptr_rate: 1500, price: 2200, cost_price: 1500, stock_qty: 8, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "Philips", about: "Compressor nebulizer for effective delivery of respiratory medications.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_031', name: "Weighing Scale Digital", description: "Precision digital weighing scale with BMI calculator. 180kg capacity.", category: "Medical Devices", mrp: 899, ptr_rate: 550, price: 899, cost_price: 550, stock_qty: 12, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "8423", composition: "", manufacturer: "Omron Healthcare", about: "Digital weighing scale with high precision and BMI calculation.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_032', name: "Stethoscope Dual Head", description: "Professional dual-head stethoscope for auscultation.", category: "Medical Devices", mrp: 520, ptr_rate: 310, price: 520, cost_price: 310, stock_qty: 0, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9018", composition: "", manufacturer: "Littmann", about: "Professional-grade dual-head stethoscope for clear auscultation.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_033', name: "Heating Pad Electric", description: "Electric heating pad for pain relief. 3 heat settings.", category: "Medical Devices", mrp: 650, ptr_rate: 400, price: 650, cost_price: 400, stock_qty: 18, dosage: "", strength: "", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "8516", composition: "", manufacturer: "Electric", about: "Therapeutic heating pad with adjustable temperature settings.", gst_rate: 18, created_at: new Date().toISOString() },

      // --- Personal Care (8) --- GST 18%
      { id: 'prod_034', name: "N95 Face Masks (Pack of 10)", description: "5-layer N95 respirator masks for protection against airborne particles.", category: "Personal Care", mrp: 250, ptr_rate: 160, price: 250, cost_price: 160, stock_qty: 500, dosage: "", strength: "10 masks", image: "", expiry_date: "2028-12-31", status: "active", is_hidden: false, hsn_code: "6307", composition: "", manufacturer: "3M", about: "Medical-grade N95 masks with 5-layer filtration.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_035', name: "Hand Sanitizer 500ml", description: "70% alcohol-based hand sanitizer with aloe vera. Kills 99.9% germs.", category: "Personal Care", mrp: 120, ptr_rate: 70, price: 120, cost_price: 70, stock_qty: 200, dosage: "", strength: "500ml", image: "", expiry_date: "2028-03-15", status: "active", is_hidden: false, hsn_code: "3401", composition: "Ethanol 70% + Aloe Vera", manufacturer: "Dettol", about: "Kills 99.9% of germs without water.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_036', name: "Surgical Gloves (Box of 100)", description: "Disposable nitrile examination gloves. Powder-free, latex-free.", category: "Personal Care", mrp: 380, ptr_rate: 240, price: 380, cost_price: 240, stock_qty: 35, dosage: "", strength: "100 gloves", image: "", expiry_date: "2028-09-20", status: "active", is_hidden: false, hsn_code: "4015", composition: "", manufacturer: "Mediquest", about: "Medical-grade nitrile gloves for examination and procedures.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_037', name: "Betadine Antiseptic Solution", description: "Povidone-iodine antiseptic solution for wound cleaning and disinfection.", category: "Personal Care", mrp: 95, ptr_rate: 60, price: 95, cost_price: 60, stock_qty: 80, dosage: "5% w/v", strength: "100ml", image: "", expiry_date: "2027-10-30", status: "active", is_hidden: false, hsn_code: "3004", composition: "Povidone-Iodine 5% w/v", manufacturer: "Win-Medicare", about: "Broad-spectrum antiseptic for wound care and surgical scrub.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_038', name: "Dettol Liquid 500ml", description: "Antiseptic disinfectant liquid for skin, surface, and laundry disinfection.", category: "Personal Care", mrp: 145, ptr_rate: 90, price: 145, cost_price: 90, stock_qty: 100, dosage: "", strength: "500ml", image: "", expiry_date: "2028-08-15", status: "active", is_hidden: false, hsn_code: "3808", composition: "Chloroxylenol 4.8%", manufacturer: "Reckitt Benckiser", about: "Trusted antiseptic disinfectant for personal and home hygiene.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_039', name: "Cotton Roll 500g", description: "Absorbent cotton wool roll for medical and personal use.", category: "Personal Care", mrp: 85, ptr_rate: 50, price: 85, cost_price: 50, stock_qty: 75, dosage: "", strength: "500g", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "5601", composition: "", manufacturer: "Softener", about: "Pure absorbent cotton for medical wound dressing.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_040', name: "Adhesive Bandage Strips", description: "Flexible fabric adhesive bandages for minor cuts and wounds. Pack of 100.", category: "Personal Care", mrp: 65, ptr_rate: 35, price: 65, cost_price: 35, stock_qty: 150, dosage: "", strength: "100 strips", image: "", expiry_date: "2028-06-30", status: "active", is_hidden: false, hsn_code: "3005", composition: "", manufacturer: "Johnson & Johnson", about: "Flexible fabric bandages for minor wound protection.", gst_rate: 18, created_at: new Date().toISOString() },

      { id: 'prod_041', name: "Vicks VapoRub 50ml", description: "Topical cough suppressant and nasal decongestant.", category: "Personal Care", mrp: 155, ptr_rate: 100, price: 155, cost_price: 100, stock_qty: 90, dosage: "", strength: "50ml", image: "", expiry_date: "2028-04-20", status: "active", is_hidden: false, hsn_code: "3004", composition: "Camphor + Menthol + Eucalyptus Oil", manufacturer: "Procter & Gamble", about: "Topical treatment for cough, cold, and nasal congestion.", gst_rate: 18, created_at: new Date().toISOString() },

      // --- Baby Care (6) --- GST 5%
      { id: 'prod_042', name: "Baby Gripe Water 150ml", description: "Ayurvedic gripe water for infant colic, gas, and digestive discomfort.", category: "Baby Care", mrp: 85, ptr_rate: 52, price: 85, cost_price: 52, stock_qty: 60, dosage: "5ml/dose", strength: "150ml", image: "", expiry_date: "2027-12-10", status: "active", is_hidden: false, hsn_code: "3004", composition: "Dill Oil + Sarjikakshara", manufacturer: "Woodward's", about: "Traditional gripe water for infant digestive comfort.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_043', name: "Baby Diapers (Medium, 50pcs)", description: "Ultra-soft disposable diapers with wetness indicator. Size Medium (6-11kg).", category: "Baby Care", mrp: 650, ptr_rate: 420, price: 650, cost_price: 420, stock_qty: 40, dosage: "", strength: "50 diapers", image: "", expiry_date: "", status: "active", is_hidden: false, hsn_code: "9619", composition: "", manufacturer: "Pampers", about: "Ultra-absorbent diapers with wetness indicator technology.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_044', name: "Baby Massage Oil 200ml", description: "Natural baby massage oil with olive and almond oil blend.", category: "Baby Care", mrp: 180, ptr_rate: 110, price: 180, cost_price: 110, stock_qty: 55, dosage: "", strength: "200ml", image: "", expiry_date: "2028-05-15", status: "active", is_hidden: false, hsn_code: "3304", composition: "Olive Oil + Almond Oil", manufacturer: "Johnson & Johnson", about: "Gentle massage oil blend for baby's delicate skin.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_045', name: "Infant Nasal Drops", description: "Saline nasal drops for infants. Clears nasal congestion safely.", category: "Baby Care", mrp: 45, ptr_rate: 25, price: 45, cost_price: 25, stock_qty: 80, dosage: "0.65%", strength: "15ml", image: "", expiry_date: "2027-10-20", status: "active", is_hidden: false, hsn_code: "3004", composition: "Sodium Chloride 0.65%", manufacturer: "Nasoclear", about: "Safe saline solution for infant nasal congestion relief.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_046', name: "Baby Soap Gentle 100g", description: "Mild, pH-balanced baby soap with no harsh chemicals.", category: "Baby Care", mrp: 75, ptr_rate: 45, price: 75, cost_price: 45, stock_qty: 100, dosage: "", strength: "100g", image: "", expiry_date: "2028-09-30", status: "active", is_hidden: false, hsn_code: "3401", composition: "", manufacturer: "Johnson & Johnson", about: "pH-balanced gentle soap for baby's sensitive skin.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_047', name: "Pediatric Paracetamol Syrup", description: "Paracetamol oral suspension for children. Cherry flavored.", category: "Baby Care", mrp: 55, ptr_rate: 32, price: 55, cost_price: 32, stock_qty: 5, dosage: "120mg/5ml", strength: "60ml", image: "", expiry_date: "2027-08-25", status: "active", is_hidden: false, hsn_code: "3004", composition: "Paracetamol 120mg/5ml", manufacturer: "Abbott India", about: "Cherry-flavored paracetamol suspension for children's fever and pain.", gst_rate: 5, created_at: new Date().toISOString() },

      // --- Ayurvedic (8) --- GST 5%
      { id: 'prod_048', name: "Chyawanprash 500g", description: "Ayurvedic immunity booster with Amla and 40+ herbs.", category: "Ayurvedic", mrp: 280, ptr_rate: 180, price: 280, cost_price: 180, stock_qty: 70, dosage: "1 tsp/day", strength: "500g", image: "", expiry_date: "2028-01-20", status: "active", is_hidden: false, hsn_code: "3003", composition: "Amla + 40+ Ayurvedic Herbs", manufacturer: "Dabur", about: "Traditional immunity booster with rich antioxidant properties.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_049', name: "Ashwagandha Capsules", description: "KSM-66 Ashwagandha for stress relief, energy, and vitality.", category: "Ayurvedic", mrp: 350, ptr_rate: 220, price: 350, cost_price: 220, stock_qty: 50, dosage: "500mg", strength: "60 capsules", image: "", expiry_date: "2028-04-15", status: "active", is_hidden: false, hsn_code: "3003", composition: "Ashwagandha Root Extract (KSM-66)", manufacturer: "Himalaya", about: "Adaptogenic herb for stress relief, energy, and vitality.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_050', name: "Tulsi Drops 30ml", description: "Concentrated Tulsi extract for immunity and respiratory health.", category: "Ayurvedic", mrp: 120, ptr_rate: 72, price: 120, cost_price: 72, stock_qty: 90, dosage: "5 drops", strength: "30ml", image: "", expiry_date: "2027-11-30", status: "active", is_hidden: false, hsn_code: "3003", composition: "Ocimum Sanctum Extract", manufacturer: "Organic India", about: "Concentrated holy basil extract for immune and respiratory support.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_051', name: "Triphala Churna 100g", description: "Classic Ayurvedic digestive formula for gut health.", category: "Ayurvedic", mrp: 95, ptr_rate: 55, price: 95, cost_price: 55, stock_qty: 65, dosage: "5g/day", strength: "100g", image: "", expiry_date: "2028-02-28", status: "active", is_hidden: false, hsn_code: "3003", composition: "Amla + Haritaki + Bibhitaki", manufacturer: "Patanjali", about: "Classical Ayurvedic formula for digestive health and detoxification.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_052', name: "Brahmi Capsules", description: "Brain tonic for memory, focus, and cognitive function.", category: "Ayurvedic", mrp: 280, ptr_rate: 170, price: 280, cost_price: 170, stock_qty: 40, dosage: "250mg", strength: "60 capsules", image: "", expiry_date: "2028-06-10", status: "active", is_hidden: false, hsn_code: "3003", composition: "Bacopa Monnieri Extract", manufacturer: "Himalaya", about: "Ayurvedic brain tonic for enhanced memory and cognitive function.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_053', name: "Giloy Juice 500ml", description: "Guduchi/Giloy herbal juice for immunity and detox.", category: "Ayurvedic", mrp: 165, ptr_rate: 100, price: 165, cost_price: 100, stock_qty: 55, dosage: "15ml 2x/day", strength: "500ml", image: "", expiry_date: "2027-09-20", status: "active", is_hidden: false, hsn_code: "3003", composition: "Tinospora Cordifolia Extract", manufacturer: "Patanjali", about: "Herbal juice for immune boosting and natural detoxification.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_054', name: "Aloe Vera Gel 200ml", description: "Pure aloe vera gel for skin care, burns, and hydration.", category: "Ayurvedic", mrp: 110, ptr_rate: 65, price: 110, cost_price: 65, stock_qty: 85, dosage: "", strength: "200ml", image: "", expiry_date: "2028-03-30", status: "active", is_hidden: false, hsn_code: "1302", composition: "Aloe Barbadensis Leaf Gel", manufacturer: "Patanjali", about: "Pure aloe vera gel for skin hydration and minor burn relief.", gst_rate: 5, created_at: new Date().toISOString() },

      { id: 'prod_055', name: "Neem Capsules", description: "Neem extract for blood purification and skin health.", category: "Ayurvedic", mrp: 140, ptr_rate: 85, price: 140, cost_price: 85, stock_qty: 0, dosage: "500mg", strength: "60 capsules", image: "", expiry_date: "2027-12-15", status: "active", is_hidden: false, hsn_code: "3003", composition: "Azadirachta Indica Extract", manufacturer: "Himalaya", about: "Neem extract for blood purification and clear skin.", gst_rate: 5, created_at: new Date().toISOString() }
    ];

    localStorage.setItem('sms_products', JSON.stringify(products));
  },

  /**
   * Seed product batches (batch-wise stock tracking)
   */
  seedProductBatches() {
    const batches = [
      // Dolo 650 - 2 batches
      { id: 'batch_001', product_id: 'prod_001', batch_number: 'DOL24A01', expiry_date: '2027-06-15', quantity: 150, free_quantity: 10, ptr_rate: 22, mrp: 32, gst_rate: 5, created_at: new Date().toISOString() },
      { id: 'batch_002', product_id: 'prod_001', batch_number: 'DOL24B02', expiry_date: '2027-12-20', quantity: 100, free_quantity: 5, ptr_rate: 22, mrp: 32, gst_rate: 5, created_at: new Date().toISOString() },

      // Crocin Advance
      { id: 'batch_003', product_id: 'prod_002', batch_number: 'CRO24A03', expiry_date: '2027-08-20', quantity: 180, free_quantity: 0, ptr_rate: 18, mrp: 28, gst_rate: 5, created_at: new Date().toISOString() },

      // Azithromycin
      { id: 'batch_004', product_id: 'prod_003', batch_number: 'AZI24A04', expiry_date: '2027-04-10', quantity: 120, free_quantity: 5, ptr_rate: 55, mrp: 85, gst_rate: 5, created_at: new Date().toISOString() },

      // Pan-D
      { id: 'batch_005', product_id: 'prod_004', batch_number: 'PAN24A05', expiry_date: '2027-12-01', quantity: 90, free_quantity: 0, ptr_rate: 95, mrp: 145, gst_rate: 5, created_at: new Date().toISOString() },

      // Cetirizine
      { id: 'batch_006', product_id: 'prod_005', batch_number: 'CET24A06', expiry_date: '2028-01-15', quantity: 300, free_quantity: 20, ptr_rate: 10, mrp: 18, gst_rate: 5, created_at: new Date().toISOString() },

      // Amoxicillin - low stock
      { id: 'batch_007', product_id: 'prod_006', batch_number: 'AMX24A07', expiry_date: '2027-05-20', quantity: 7, free_quantity: 0, ptr_rate: 42, mrp: 65, gst_rate: 5, created_at: new Date().toISOString() },

      // Metformin
      { id: 'batch_008', product_id: 'prod_007', batch_number: 'MET24A08', expiry_date: '2027-09-30', quantity: 400, free_quantity: 25, ptr_rate: 12, mrp: 22, gst_rate: 5, created_at: new Date().toISOString() },

      // Amlodipine
      { id: 'batch_009', product_id: 'prod_008', batch_number: 'AML24A09', expiry_date: '2028-03-15', quantity: 200, free_quantity: 10, ptr_rate: 20, mrp: 35, gst_rate: 5, created_at: new Date().toISOString() },

      // Omeprazole
      { id: 'batch_010', product_id: 'prod_009', batch_number: 'OME24A10', expiry_date: '2027-11-10', quantity: 150, free_quantity: 0, ptr_rate: 28, mrp: 45, gst_rate: 5, created_at: new Date().toISOString() },

      // Combiflam
      { id: 'batch_011', product_id: 'prod_015', batch_number: 'CMB24A11', expiry_date: '2027-12-15', quantity: 320, free_quantity: 15, ptr_rate: 18, mrp: 30, gst_rate: 5, created_at: new Date().toISOString() },

      // Blood Pressure Monitor (device, no expiry batch)
      { id: 'batch_012', product_id: 'prod_027', batch_number: 'BPM24A12', expiry_date: '', quantity: 15, free_quantity: 0, ptr_rate: 1200, mrp: 1850, gst_rate: 18, created_at: new Date().toISOString() },

      // Pulse Oximeter
      { id: 'batch_013', product_id: 'prod_028', batch_number: 'POX24A13', expiry_date: '', quantity: 30, free_quantity: 2, ptr_rate: 450, mrp: 750, gst_rate: 18, created_at: new Date().toISOString() },

      // N95 Masks
      { id: 'batch_014', product_id: 'prod_034', batch_number: 'N9524A14', expiry_date: '2028-12-31', quantity: 500, free_quantity: 50, ptr_rate: 160, mrp: 250, gst_rate: 18, created_at: new Date().toISOString() },

      // Ashwagandha
      { id: 'batch_015', product_id: 'prod_049', batch_number: 'ASH24A15', expiry_date: '2028-04-15', quantity: 50, free_quantity: 5, ptr_rate: 220, mrp: 350, gst_rate: 5, created_at: new Date().toISOString() },

      // Chyawanprash
      { id: 'batch_016', product_id: 'prod_048', batch_number: 'CHY24A16', expiry_date: '2028-01-20', quantity: 70, free_quantity: 0, ptr_rate: 180, mrp: 280, gst_rate: 5, created_at: new Date().toISOString() },
    ];

    localStorage.setItem('sms_product_batches', JSON.stringify(batches));
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
        id: 'user_admin',
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
        id: 'user_cust1',
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        password_hash: hash,
        role: "customer",
        phone: "9876543201",
        addresses: [{ id: 1, label: "Home", line1: "42, MG Road", city: "Pune", state: "Maharashtra", pincode: "411001" }],
        created_at: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: 'user_cust2',
        name: "Priya Sharma",
        email: "priya@example.com",
        password_hash: hash,
        role: "customer",
        phone: "9876543202",
        addresses: [{ id: 1, label: "Home", line1: "15, FC Road", city: "Pune", state: "Maharashtra", pincode: "411004" }],
        created_at: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        id: 'user_cust3',
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
   * Seed sample orders (legacy format for backward compat)
   */
  seedSampleOrders() {
    const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
    const products = JSON.parse(localStorage.getItem('sms_products') || '[]');
    const customers = users.filter(u => u.role === 'customer');

    if (customers.length === 0 || products.length === 0) return;

    const orders = [];

    // Generate 4 sample orders (legacy format)
    for (let i = 0; i < 4; i++) {
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
          price: product.mrp || product.price,
          quantity: qty
        });
      }

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = Utils.calculateTax(subtotal, 5);
      const statuses = ['confirmed', 'packed', 'dispatched', 'delivered'];
      const status = statuses[i];
      const daysAgo = (4 - i) * 3;

      orders.push({
        id: `order_${i+1}`,
        order_number: Utils.generateNumber('ORD'),
        user_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: items,
        subtotal: subtotal,
        tax: tax,
        delivery_charge: subtotal >= 500 ? 0 : 40,
        total: subtotal + tax + (subtotal >= 500 ? 0 : 40),
        status: status,
        payment_method: i % 2 === 0 ? 'COD' : 'UPI',
        address: customer.addresses[0] || { line1: 'N/A', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
        notes: '',
        created_at: new Date(Date.now() - 86400000 * daysAgo).toISOString(),
        confirmed_at: new Date(Date.now() - 86400000 * (daysAgo - 1)).toISOString(),
        delivered_at: status === 'delivered' ? new Date(Date.now() - 86400000 * (daysAgo - 3)).toISOString() : null
      });
    }

    localStorage.setItem('sms_orders', JSON.stringify(orders));

    // Also seed 2 sample bills (new workflow)
    const sampleBills = [
      {
        id: 'bill_001',
        bill_number: Utils.generateNumber('BILL'),
        user_id: customers[0].id,
        customer_name: customers[0].name,
        customer_email: customers[0].email,
        customer_phone: customers[0].phone,
        items: [
          { product_id: 'prod_001', batch_id: 'batch_001', name: 'Dolo 650mg', batch_number: 'DOL24A01', expiry_date: '2027-06-15', quantity: 3, mrp: 32, gst_rate: 5, base_price: 30.48, gst_amount: 1.52, total: 96 },
          { product_id: 'prod_005', batch_id: 'batch_006', name: 'Cetirizine 10mg', batch_number: 'CET24A06', expiry_date: '2028-01-15', quantity: 2, mrp: 18, gst_rate: 5, base_price: 17.14, gst_amount: 0.86, total: 36 }
        ],
        subtotal: 125.24,
        total_gst: 6.76,
        grand_total: 132,
        delivery_charge: 0,
        status: 'pending_approval',
        payment_method: 'COD',
        address: customers[0].addresses[0],
        notes: 'Need urgent delivery',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        approved_at: null,
        approved_by: null,
        rejection_reason: null
      },
      {
        id: 'bill_002',
        bill_number: Utils.generateNumber('BILL'),
        user_id: customers[1].id,
        customer_name: customers[1].name,
        customer_email: customers[1].email,
        customer_phone: customers[1].phone,
        items: [
          { product_id: 'prod_027', batch_id: 'batch_012', name: 'Blood Pressure Monitor', batch_number: 'BPM24A12', expiry_date: '', quantity: 1, mrp: 1850, gst_rate: 18, base_price: 1567.80, gst_amount: 282.20, total: 1850 }
        ],
        subtotal: 1567.80,
        total_gst: 282.20,
        grand_total: 1850,
        delivery_charge: 0,
        status: 'approved',
        payment_method: 'UPI',
        address: customers[1].addresses[0],
        notes: '',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        approved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        approved_by: 'user_admin',
        rejection_reason: null
      }
    ];

    localStorage.setItem('sms_bills', JSON.stringify(sampleBills));
  }
};

// Make globally available
window.SeedData = SeedData;
