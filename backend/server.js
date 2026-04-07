const express = require('express');
const cors = require('cors');
const db = require('./database');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

// -----------------------------------------
// PRODUCT ROUTES
// -----------------------------------------

// List Products
app.get('/api/products', async (req, res) => {
    try {
        const { search, category, schedule_drug } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        
        if (search) {
            query += ' AND (name LIKE ? OR manufacturer LIKE ? OR composition LIKE ?)';
            const q = `%${search}%`;
            params.push(q, q, q);
        }
        if (category && category !== 'all') {
            query += ' AND category = ?';
            params.push(category);
        }
        if (schedule_drug === 'true') {
            query += ' AND schedule_drug = 1';
        }
        
        query += ' ORDER BY created_at DESC';

        const products = await db.all(query, params);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create Product
app.post('/api/products', async (req, res) => {
    try {
        const p = req.body;
        const id = generateId();
        
        const q = `INSERT INTO products (
            id, name, image_url, hsn_code, manufacturer, composition, packing,
            conversion_unit, gst_percent, scheme_discount, lock_discount,
            item_type, category, storage, substitute_allowed, schedule_drug,
            returnable, restricted_drug, anti_tb, corona_monitor, self_barcode,
            barcode, supplier1, supplier2, supplier3, details, prescription_required
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
            id, p.name, p.image_url, p.hsn_code, p.manufacturer, p.composition, p.packing,
            p.conversion_unit || 1, p.gst_percent || 5, p.scheme_discount || 0, p.lock_discount ? 1 : 0,
            p.item_type, p.category, p.storage, p.substitute_allowed ? 1 : 0, p.schedule_drug ? 1 : 0,
            p.returnable !== false ? 1 : 0, p.restricted_drug ? 1 : 0, p.anti_tb ? 1 : 0, p.corona_monitor ? 1 : 0, p.self_barcode ? 1 : 0,
            p.barcode, p.supplier1, p.supplier2, p.supplier3, p.details, p.prescription_required ? 1 : 0
        ];
        
        await db.run(q, params);
        const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!product) return res.status(404).json({ success: false, message: 'Not found' });
        
        const batches = await db.all('SELECT * FROM product_batches WHERE product_id = ?', [req.params.id]);
        res.json({ success: true, product, batches });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
    try {
        const p = req.body;
        const id = req.params.id;
        
        const q = `UPDATE products SET 
            name=?, image_url=?, hsn_code=?, manufacturer=?, composition=?, packing=?,
            conversion_unit=?, gst_percent=?, scheme_discount=?, lock_discount=?,
            item_type=?, category=?, storage=?, substitute_allowed=?, schedule_drug=?,
            returnable=?, restricted_drug=?, anti_tb=?, corona_monitor=?, self_barcode=?,
            barcode=?, supplier1=?, supplier2=?, supplier3=?, details=?, prescription_required=?
            WHERE id=?`;
            
        const params = [
            p.name, p.image_url, p.hsn_code, p.manufacturer, p.composition, p.packing,
            p.conversion_unit, p.gst_percent, p.scheme_discount, p.lock_discount ? 1 : 0,
            p.item_type, p.category, p.storage, p.substitute_allowed ? 1 : 0, p.schedule_drug ? 1 : 0,
            p.returnable ? 1 : 0, p.restricted_drug ? 1 : 0, p.anti_tb ? 1 : 0, p.corona_monitor ? 1 : 0, p.self_barcode ? 1 : 0,
            p.barcode, p.supplier1, p.supplier2, p.supplier3, p.details, p.prescription_required ? 1 : 0,
            id
        ];
        
        await db.run(q, params);
        res.json({ success: true, message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// -----------------------------------------
// BATCH ROUTES
// -----------------------------------------
app.post('/api/products/:id/batches', async (req, res) => {
    try {
        const p = req.body;
        const batchId = generateId();
        
        const q = `INSERT INTO product_batches (
            id, product_id, batch_number, expiry_date, quantity, free_quantity, ptr_rate, mrp, gst_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
            batchId, req.params.id, p.batch_number, p.expiry_date, p.quantity, p.free_quantity || 0,
            p.ptr_rate || 0, p.mrp || 0, p.gst_rate || 5
        ];
        
        await db.run(q, params);
        res.json({ success: true, batchId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/batches', async (req, res) => {
    try {
        const batches = await db.all('SELECT * FROM product_batches ORDER BY created_at DESC');
        res.json({ success: true, batches });
    } catch(err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// -----------------------------------------
// INWARD BILLING TRANSACTION
// -----------------------------------------
app.post('/api/inward', async (req, res) => {
    try {
        const payload = req.body;
        // Expected payload structure:
        // {
        //   bill: { id, inward_number, agency_id, agency_name, bill_no, bill_date, payment_mode, bill_discount_type, bill_discount_value, bill_discount_amount, total_subtotal, total_row_discount, total_gst, round_off, grand_total, item_count, total_qty },
        //   items: [ { product_id, product_name, batch, expiry, qty, free, mrp, rate, discount_type, discount_value, discount_amount, gst, taxable_amount, gst_amount, amount } ]
        // }

        const b = payload.bill;
        const items = payload.items;
        const billId = b.id || generateId();

        await db.run('BEGIN TRANSACTION');

        // Insert or replace the bill
        await db.run(`
            INSERT INTO bills (id, bill_number, user_id, customer_name, customer_email, status, subtotal, total_gst, grand_total, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [billId, b.inward_number, null, b.agency_name, null, 'completed', b.total_subtotal, b.total_gst, b.grand_total, new Date().toISOString()]);

        // Process Items inside the bill
        for (const item of items) {
            // Find existing batch
            const existingBatch = await db.get(
                'SELECT * FROM product_batches WHERE product_id = ? COLLATE NOCASE AND batch_number = ? COLLATE NOCASE',
                [item.product_id, item.batch]
            );

            let storedBatchId;

            if (existingBatch) {
                storedBatchId = existingBatch.id;
                const newQty = existingBatch.quantity + item.qty;
                const newFree = existingBatch.free_quantity + item.free;
                
                // Update batch using STRICT update rules -> Price changes based on batch
                await db.run(`
                    UPDATE product_batches 
                    SET quantity = ?, free_quantity = ?, expiry_date = ?, mrp = ?, ptr_rate = ?, gst_rate = ?
                    WHERE id = ?
                `, [newQty, newFree, item.expiry, item.mrp, item.rate, item.gst, storedBatchId]);
            } else {
                storedBatchId = generateId();
                await db.run(`
                    INSERT INTO product_batches (id, product_id, batch_number, expiry_date, quantity, free_quantity, ptr_rate, mrp, gst_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [storedBatchId, item.product_id, item.batch, item.expiry, item.qty, item.free, item.rate, item.mrp, item.gst]);
            }

            // Record into bill_items
            await db.run(`
                INSERT INTO bill_items (bill_id, product_id, batch_id, quantity, mrp, gst_rate, base_price, gst_amount, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [billId, item.product_id, storedBatchId, item.qty, item.mrp, item.gst, item.taxable_amount, item.gst_amount, item.amount]);
            
            // Record stock history
            await db.run(`
                INSERT INTO stock_history (id, product_id, batch_id, batch_number, product_name, qty_before, qty_after, action, bill_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                generateId(), item.product_id, storedBatchId, item.batch, item.product_name, 
                existingBatch ? existingBatch.quantity : 0, 
                existingBatch ? existingBatch.quantity + item.qty : item.qty, 
                'INWARD', billId
            ]);
        }

        await db.run('COMMIT');
        res.json({ success: true, message: 'Inward Bill successfully saved.', bill_id: billId });
    } catch (err) {
        await db.run('ROLLBACK');
        res.status(500).json({ success: false, error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`Node Server running on http://localhost:${PORT}`);
});
