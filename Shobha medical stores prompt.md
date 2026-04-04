# SHOBHA MEDICAL STORES - Complete Website Build Prompt

## PROJECT OVERVIEW
Build a full-stack medical e-commerce website for **SHOBHA MEDICAL STORES** with customer-facing portal and comprehensive admin dashboard for inventory and order management.

## BUSINESS REQUIREMENTS

### Shop Details
- **Name:** SHOBHA MEDICAL STORES
- **Type:** Medical/Pharmacy E-commerce Platform
- **Primary Functions:** Sell medicines, medical supplies, and health products

---

## FEATURE REQUIREMENTS

### 1. CUSTOMER PORTAL
#### Product Browsing
- Display all available medical products with:
  - Product name, description, dosage/strength
  - Price, quantity available
  - Category (Medicines, Supplements, Medical Devices, etc.)
  - Stock status (In Stock / Out of Stock / Limited Stock)
  - Search and filter functionality
  
#### Shopping Cart
- Add/remove items from cart
- Update quantities
- View cart summary with total

#### Order & Estimation
- **Estimate Generation:**
  - Generate bill estimate before checkout
  - Display itemized estimate with:
    - Product names, quantities, unit prices
    - Subtotal, taxes, total amount
    - Estimate number and timestamp
  - Customer can save or print estimate
  - Option to proceed to order confirmation

#### Order Placement
- Submit order after customer confirmation
- Enter delivery address details
- Select payment method (Cash on Delivery / Online Payment - optional)
- Order confirmation page with order number
- Email confirmation sent to customer

#### Order Tracking
- View order history
- Track order status: Pending, Confirmed, Packed, Dispatched, Delivered

---

### 2. ADMIN DASHBOARD

#### Authentication
- Secure admin login
- Role-based access control

#### Product Management
- **View All Products:** Table with all medicines/items
  - Columns: ID, Name, Category, Price, Stock Quantity, Status
  
- **Add New Product:**
  - Product name, description
  - Category selection
  - Price, cost price
  - Stock quantity
  - Dosage/strength/specifications
  - Image upload
  - Expiry date (if applicable)
  
- **Modify Product:**
  - Edit any product details
  - Update pricing, stock quantity
  - Change product status
  
- **Hide/Remove Product:**
  - Hide from public view (soft delete)
  - Permanent removal (hard delete)
  - Bulk hide/remove functionality
  
- **Stock Management:**
  - View out-of-stock items separately
  - Low stock alerts (customizable threshold)
  - Stock adjustment (add/reduce quantity)
  - Stock history/audit log

#### Order Management
- **View All Orders:** Table with:
  - Order ID, Customer Name, Order Date
  - Items count, Total Amount, Status
  - Search and filter by date range, status, customer

- **Order Details:** 
  - Customer information
  - Itemized order details
  - Estimated bill preview
  
- **Order Confirmation Workflow:**
  - Pending orders list
  - Review estimate
  - Confirm or reject order
  - Add notes/comments
  - Generate invoice upon confirmation
  
- **Invoice Generation:**
  - Auto-generate invoice PDF after confirmation
  - Invoice details:
    - Shop name: SHOBHA MEDICAL STORES
    - Invoice number, date
    - Customer details
    - Itemized product list with quantities and prices
    - Subtotal, tax, total amount
    - Payment terms
    - Download/print functionality
    - Email invoice to customer

- **Order Status Management:**
  - Update order status (Confirmed → Packed → Dispatched → Delivered)
  - Add delivery tracking info
  - Mark as delivered

#### Dashboard Analytics (Optional but Recommended)
- Total sales (today, this month, total)
- Total orders (pending, confirmed, delivered)
- Top-selling products
- Out-of-stock count
- Revenue chart
- Recent orders widget

#### User Management
- View all admin users
- Create new admin accounts
- Assign roles/permissions
- Deactivate accounts

#### Settings
- Shop information (name, contact, address)
- Tax settings (GST rate, etc.)
- Payment methods configuration
- Low stock threshold
- Invoice template customization

---

## TECHNICAL SPECIFICATIONS

### Frontend
- **Framework:** React.js / Next.js
- **Styling:** Tailwind CSS / Material-UI
- **State Management:** Redux / Context API
- **Pages Needed:**
  - Customer: Home, Products, Cart, Checkout, Order Confirmation, Order History
  - Admin: Login, Dashboard, Products Management, Orders Management, Settings

### Backend
- **Framework:** Node.js (Express.js) or Python (Django/Flask)
- **Database:** PostgreSQL / MongoDB
- **Authentication:** JWT tokens
- **API Design:** RESTful or GraphQL

### Database Schema
```
Tables/Collections:
- users (customer, admin, roles)
- products (id, name, category, price, stock_qty, status, expiry_date, etc.)
- carts (user_id, products[], quantities[])
- estimates (estimate_id, user_id, items[], total, timestamp)
- orders (order_id, user_id, items[], total, status, created_at, confirmed_at)
- invoices (invoice_id, order_id, pdf_data, created_at)
- stock_history (product_id, qty_before, qty_after, action, timestamp)
```

### Key Features Implementation
1. **Estimate to Invoice Flow:**
   - Customer generates estimate
   - Admin reviews and confirms order
   - System auto-generates invoice PDF
   - Invoice sent to customer via email

2. **Stock Management:**
   - Automatic status updates based on quantity
   - Low stock notifications
   - Out-of-stock products hidden from customer view

3. **Security:**
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Secure password hashing
   - HTTPS enforcement

---

## USER FLOWS

### Customer Flow
1. Browse products → Search/filter → View details
2. Add to cart → View cart → Proceed to checkout
3. Generate estimate → Review estimate
4. Confirm order → Enter delivery address
5. Place order → Receive confirmation & order number
6. Track order status → Receive invoice upon confirmation

### Admin Flow
1. Login to dashboard
2. Manage inventory (add/edit/hide/remove products)
3. Monitor stock levels
4. Review pending orders
5. Confirm order & generate invoice
6. Update order status
7. View analytics and reports

---

## DELIVERABLES

1. **Frontend Application**
   - Responsive UI (desktop, tablet, mobile)
   - Customer portal
   - Admin dashboard

2. **Backend API**
   - All CRUD operations
   - Authentication & authorization
   - Estimate and invoice generation
   - Email notifications

3. **Database**
   - Properly normalized/structured schema
   - Indexes for performance

4. **Additional**
   - PDF generation for invoices
   - Email service integration
   - API documentation
   - Deployment guide

---

## INSTRUCTIONS FOR CLAUDE OPUS 4.6

You are tasked with architecting and generating code for the SHOBHA MEDICAL STORES e-commerce platform. 

**Please provide:**

1. **Complete Architecture & Tech Stack Recommendation**
   - Frontend, backend, database, and hosting recommendations
   - Reasoning for each choice

2. **Database Schema**
   - Detailed tables/collections with fields, types, relationships

3. **API Endpoints List**
   - All required endpoints with HTTP methods, parameters, and responses

4. **Code Generation**
   - Start with the foundational setup
   - Generate modular, scalable code
   - Follow industry best practices
   - Include error handling and validation
   - Add comprehensive comments

5. **Step-by-Step Implementation Guide**
   - Environment setup
   - Installation instructions
   - Configuration steps
   - Testing approach

6. **Security Considerations**
   - Authentication/authorization implementation
   - Data protection measures
   - CORS, rate limiting, input validation

**Approach:** 
- Build incrementally (auth → products → cart → orders → invoicing)
- Provide complete, working code (not pseudo-code)
- Include environment variables template
- Suggest testing strategies for each module
- Provide frontend and backend code separately

---

## ADDITIONAL NOTES

- Medical shop context: Handle sensitive product information carefully
- Compliance: Consider any local regulations for pharmaceutical e-commerce
- Invoice format: Professional, with all necessary business details
- Mobile-first approach recommended for customer portal
- Performance: Optimize for quick product search and checkout
- Scalability: Build with future expansion in mind

**Start with the most critical features first:**
1. User authentication (customer & admin)
2. Product management
3. Shopping cart
4. Order & estimate system
5. Invoice generation
6. Dashboard analytics