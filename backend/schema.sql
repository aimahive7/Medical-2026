CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT,
    hsn_code TEXT,
    manufacturer TEXT,
    composition TEXT,
    packing TEXT,
    
    conversion_unit INTEGER DEFAULT 1,
    gst_percent REAL DEFAULT 5,
    scheme_discount REAL DEFAULT 0,
    lock_discount BOOLEAN DEFAULT 0,
    
    item_type TEXT,
    category TEXT,
    storage TEXT,
    
    substitute_allowed BOOLEAN DEFAULT 0,
    schedule_drug BOOLEAN DEFAULT 0,
    returnable BOOLEAN DEFAULT 1,
    restricted_drug BOOLEAN DEFAULT 0,
    anti_tb BOOLEAN DEFAULT 0,
    corona_monitor BOOLEAN DEFAULT 0,
    self_barcode BOOLEAN DEFAULT 0,
    
    barcode TEXT,
    
    supplier1 TEXT,
    supplier2 TEXT,
    supplier3 TEXT,
    
    details TEXT,
    prescription_required BOOLEAN DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_batches (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    expiry_date TEXT,
    quantity INTEGER DEFAULT 0,
    free_quantity INTEGER DEFAULT 0,
    ptr_rate REAL DEFAULT 0,
    mrp REAL DEFAULT 0,
    gst_rate REAL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock_history (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    batch_id TEXT,
    batch_number TEXT,
    product_name TEXT,
    qty_before INTEGER,
    qty_after INTEGER,
    action TEXT,
    bill_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT,
    user_id TEXT,
    customer_name TEXT,
    customer_email TEXT,
    status TEXT,
    subtotal REAL,
    total_gst REAL,
    grand_total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id TEXT,
    product_id TEXT,
    batch_id TEXT,
    quantity INTEGER,
    mrp REAL,
    gst_rate REAL,
    base_price REAL,
    gst_amount REAL,
    total REAL,
    FOREIGN KEY(bill_id) REFERENCES bills(id) ON DELETE CASCADE
);
