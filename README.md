# Inventory Management System - Backend Architecture

A MongoDB and Express-based backend for the inventory management system supporting multi-category products, sales tracking, stock movements, and user management.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Collections Overview](#collections-overview)
- [Data Models](#data-models)
- [Relationships](#relationships)
- [Indexing Strategy](#indexing-strategy)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)

---

## 🗂️ Project Structure

```
inventory-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── environment.ts       # Environment variables
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Sale.ts
│   │   ├── StockMovement.ts
│   │   ├── Supplier.ts
│   │   └── Inventory.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── inventory.ts
│   │   ├── suppliers.ts
│   │   └── users.ts
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── utils/
│   │   └── validators.ts
│   └── server.ts
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Schema

### MongoDB Connection String

```
mongodb://username:password@host:port/inventory_db
```

### Database Name

```
inventory_db
```

---

## 📊 Collections Overview

| Collection            | Purpose                        | Key Fields                     | Documents |
| --------------------- | ------------------------------ | ------------------------------ | --------- |
| **users**             | User accounts & authentication | id, username, role, password   | 1K+       |
| **products**          | Product catalog                | id, name, sku, category, price | 10K+      |
| **sales**             | Sales transactions             | id, saleNumber, items, amount  | 100K+     |
| **stock_movements**   | Stock in/out tracking          | id, type, productId, quantity  | 50K+      |
| **suppliers**         | Supplier information           | id, name, contact, email       | 100-500   |
| **inventory_history** | Historical stock levels        | id, productId, date, level     | 10K+      |
| **categories**        | Product categories             | id, name, description          | 10-50     |
| **settings**          | System configuration           | key, value, type               | 20-50     |

---

## 📝 Data Models

### 1. **Users Collection**

```javascript
{
  _id: ObjectId(),
  username: String,                 // Unique
  email: String,                    // Unique
  password: String,                 // Hashed (bcrypt)
  role: String,                     // 'admin', 'manager', 'sales'
  businessSetup: {
    businessName: String,
    businessType: String,           // 'retail', 'wholesale', 'hybrid'
    currency: String,               // 'USD', 'KES', etc.
    lowStockThreshold: Number,
    emailAlerts: Boolean,
    smsAlerts: Boolean,
    setupCompletedAt: Date
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

**Indexes:**

```javascript
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
```

---

### 2. **Products Collection**

```javascript
{
  _id: ObjectId(),
  name: String,                     // Required
  sku: String,                      // Unique
  category: String,                 // Reference to categories
  description: String,
  supplier: {
    supplierId: ObjectId,          // Reference to suppliers
    supplierName: String,
    supplierSKU: String
  },
  pricing: {
    unitPrice: Number,              // Selling price
    costPrice: Number,              // Cost price
    currency: String
  },
  stock: {
    currentStock: Number,
    reorderLevel: Number,
    reorderQuantity: Number,
    warehouseLocation: String
  },
  unit: String,                     // 'units', 'kg', 'liters', etc.
  status: String,                   // 'active', 'discontinued'
  customAttributes: {               // Category-specific fields
    brand: String,
    model: String,
    size: String,
    color: String,
    expiryDate: Date,               // For food/medicine
    batchNumber: String
  },
  image: String,                    // Image URL
  createdBy: ObjectId,              // Reference to users
  createdAt: Date,
  updatedAt: Date,
  discontinuedDate: Date,
  discontinuationReason: String
}
```

**Indexes:**

```javascript
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ status: 1 });
db.products.createIndex({ "stock.currentStock": 1 });
db.products.createIndex({ name: "text", description: "text" });
```

---

### 3. **Sales Collection**

```javascript
{
  _id: ObjectId(),
  saleNumber: String,               // Unique: 'S-{timestamp}'
  date: Date,
  customer: {
    name: String,                   // Required
    phone: String,
    email: String
  },
  items: [
    {
      productId: ObjectId,          // Reference to products
      productName: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }
  ],
  summary: {
    totalItems: Number,
    totalAmount: Number,
    discount: Number,
    tax: Number,
    netAmount: Number
  },
  payment: {
    type: String,                   // 'cash', 'card', 'check', 'bank_transfer'
    transactionId: String,          // For non-cash payments
    status: String                  // 'completed', 'pending', 'failed'
  },
  notes: String,
  createdBy: ObjectId,              // Reference to users
  createdAt: Date,
  updatedAt: Date,
  status: String                    // 'completed', 'cancelled', 'returned'
}
```

**Indexes:**

```javascript
db.sales.createIndex({ saleNumber: 1 }, { unique: true });
db.sales.createIndex({ date: 1 }, { background: true });
db.sales.createIndex({ createdBy: 1 });
db.sales.createIndex({ "payment.transactionId": 1 });
db.sales.createIndex({ "customer.name": "text" });
```

---

### 4. **Stock Movements Collection**

```javascript
{
  _id: ObjectId(),
  reference: String,                // SI-2026-00001, SO-2026-00002, ADJ-2026-00003
  type: String,                     // 'in', 'out', 'adjustment'
  productId: ObjectId,              // Reference to products
  productName: String,              // Denormalized for queries
  quantity: Number,
  reason: String,                   // 'Sale', 'Purchase', 'Return', 'Adjustment'
  relatedDocuments: {
    saleId: ObjectId,
    purchaseId: ObjectId,
    transferFrom: ObjectId          // For warehouse transfers
  },
  notes: String,
  createdBy: ObjectId,              // Reference to users
  createdAt: Date,
  batchNumber: String,
  expiryDate: Date
}
```

**Indexes:**

```javascript
db.stock_movements.createIndex({ reference: 1 }, { unique: true });
db.stock_movements.createIndex({ productId: 1 });
db.stock_movements.createIndex({ type: 1 });
db.stock_movements.createIndex({ createdAt: 1 }, { background: true });
db.stock_movements.createIndex({ createdAt: -1 });
```

---

### 5. **Suppliers Collection**

```javascript
{
  _id: ObjectId(),
  name: String,                     // Required, unique
  email: String,
  phone: String,
  // Structured postal address
  address: {
    street: String,
    city: String,
    country: String
  },
  // Backwards-compatible flat fields (some frontend components use these)
  city: String,
  country: String,
  // Primary and secondary contact persons
  contact: {
    primaryContact: String,
    primaryPhone: String,
    secondaryContact: String,
    secondaryPhone: String
  },
  // Payment-related details
  paymentTerms: String,              // e.g., '30 days', 'COD'
  payment: {
    bankDetails: String,
    taxId: String
  },
  // Products this supplier provides (SKUs or product IDs)
  products: [String],
  // Operational metadata
  status: String,                   // 'active', 'inactive', 'blocked'
  rating: Number,                   // 1-5
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

```javascript
db.suppliers.createIndex({ name: 1 }, { unique: true });
db.suppliers.createIndex({ status: 1 });
db.suppliers.createIndex({ email: 1 });
```

---

### 6. **Inventory History Collection**

```javascript
{
  _id: ObjectId(),
  productId: ObjectId,              // Reference to products
  date: Date,
  stockLevel: Number,
  lowStockAlert: Boolean,
  notes: String,
  snapshot: {
    productName: String,
    reorderLevel: Number,
    unitPrice: Number
  }
}
```

**Indexes:**

```javascript
db.inventory_history.createIndex({ productId: 1, date: -1 });
db.inventory_history.createIndex({ date: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
```

---

### 7. **Categories Collection**

```javascript
{
  _id: ObjectId(),
  name: String,                     // Unique
  slug: String,                     // URL-friendly name
  description: String,
  parentCategory: ObjectId,         // For hierarchical categories
  fieldSchema: {                    // Define category-specific fields
    fields: [
      {
        key: String,
        label: String,
        type: String,               // 'text', 'date', 'textarea', 'select'
        required: Boolean,
        options: [String]           // For select type
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**

```javascript
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ slug: 1 });
```

---

### 8. **Settings Collection**

This project defines its settings shape in the frontend TypeScript type `AppSettings`. See the canonical interface in [lib/types.ts](lib/types.ts#L1-L200).

Preferred document layout (single document that stores the core app settings):

```javascript
{
  _id: ObjectId(),
  // Top-level settings object matching `AppSettings` in the frontend
  settings: {
    currency: {
      symbol: String,       // e.g. '$'
      code: String,         // e.g. 'USD'
      decimalPlaces: Number // e.g. 2
    },
    units: {
      weight: String, // 'kg', 'lbs'
      volume: String, // 'L', 'ml'
      count: String   // 'units', 'boxes'
    },
    notifications: {
      emailAlerts: Boolean,
      smsAlerts: Boolean,
      lowStockAlerts: Boolean,
      saleNotifications: Boolean
    },
    general: {
      companyName: String,
      contactEmail: String,
      theme: String // 'light' | 'dark'
    },
    credentials: {
      teamUsers: [
        {
          id: String,
          name: String,
          email: String,
          password: String, // hashed on server
          role: String,
          createdAt: Date,
          lastLogin: Date | null
        }
      ],
      passwordPolicy: {
        minLength: Number,
        requireMixedCase: Boolean,
        requireNumbers: Boolean,
        requireSpecialChars: Boolean
      },
      sessionTimeout: Number // minutes
    }
  },
  updatedBy: ObjectId,
  updatedAt: Date
}
```

Notes:

- The frontend expects the `AppSettings` shape defined in [lib/types.ts](lib/types.ts#L1-L200) and uses default values seeded in [lib/storage.ts](lib/storage.ts#L1-L120).
- In the current demo implementation `settings` are stored client-side in localStorage under a single `STORAGE_KEY`. When you migrate to a backend, persist the `settings` object in a `settings` collection (single document keyed by environment or `businessId` for multi-tenant setups).

**Example (default) settings document:**

```json
{
  "currency": { "symbol": "$", "code": "USD", "decimalPlaces": 2 },
  "units": { "weight": "kg", "volume": "L", "count": "units" },
  "notifications": {
    "emailAlerts": true,
    "smsAlerts": false,
    "lowStockAlerts": true,
    "saleNotifications": true
  },
  "general": {
    "companyName": "My Stock Manager",
    "contactEmail": "contact@company.com",
    "theme": "light"
  },
  "credentials": {
    "teamUsers": [],
    "passwordPolicy": {
      "minLength": 8,
      "requireMixedCase": true,
      "requireNumbers": true,
      "requireSpecialChars": false
    },
    "sessionTimeout": 30
  }
}
```

When implementing API endpoints, map frontend `updateSettings()` calls to `PATCH /api/settings` or `PUT /api/settings/:id` and validate incoming payloads against this schema.

---

## 🔗 Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │ (createdBy)
       ├─→ Products
       ├─→ Sales
       ├─→ StockMovements
       └─→ Settings (updatedBy)

┌─────────────────┐
│   Categories    │
└────────┬────────┘
         │
         └─→ Products

┌─────────────────┐
│   Suppliers     │
└────────┬────────┘
         │
         └─→ Products (supplierSchema)

┌──────────────────┐
│    Products      │
└────────┬─────────┘
         │
         ├─→ Sales (items)
         ├─→ StockMovements
         └─→ InventoryHistory

┌─────────────┐
│    Sales    │
└──────┬──────┘
       │ (items)
       └─→ Products

┌──────────────────────┐
│  StockMovements      │
└────────┬─────────────┘
         │ (references)
         ├─→ Sales
         └─→ Products
```

---

## 🔍 Indexing Strategy

### Performance Indexes

1. **Frequently Queried Fields**
   - User by username/email (auth)
   - Products by category, status, SKU
   - Sales by date, customer, saleNumber
   - Stock movements by type, productId

2. **Foreign Keys (References)**
   - All `ObjectId` references should be indexed
   - `createdBy`, `supplierId`, `productId`

3. **Text Search**
   - Product name and description
   - Customer names in sales
   - Supplier names

4. **Compound Indexes** (for common queries)

   ```javascript
   db.sales.createIndex({ date: -1, status: 1 });
   db.products.createIndex({ category: 1, status: 1 });
   db.stock_movements.createIndex({ productId: 1, date: -1 });
   ```

5. **TTL Indexes** (automatic cleanup)
   ```javascript
   // Delete inventory history older than 90 days
   db.inventory_history.createIndex(
     { createdAt: 1 },
     { expireAfterSeconds: 7776000 },
   );
   ```

---

## ⚙️ Setup Instructions

### 1. Environment Variables (`.env`)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/inventory_db
MONGODB_USER=admin
MONGODB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Pagination
ITEMS_PER_PAGE=20
```

### 2. Initialize Database

```bash
# Install dependencies
npm install

# Create indexes
npm run db:init

# Seed default data (optional)
npm run db:seed
```

### 3. Start Server

```bash
npm run dev      # Development
npm run build    # Production build
npm start        # Production
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Products

- `GET /api/products` - Get all products (with pagination, filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales

- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create sale
- `DELETE /api/sales/:id` - Delete sale

### Stock Movements

- `GET /api/inventory/movements` - Get stock movements
- `POST /api/inventory/movements` - Record stock movement
- `GET /api/inventory/movements/product/:productId` - Get movements for product

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier

### Settings

- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting

---

## 📊 Database Statistics

### Expected Collection Sizes (First Year)

| Collection        | Estimated Docs | Size    |
| ----------------- | -------------- | ------- |
| users             | 50             | ~50 KB  |
| products          | 5,000          | ~50 MB  |
| sales             | 50,000         | ~500 MB |
| stock_movements   | 100,000        | ~100 MB |
| suppliers         | 200            | ~1 MB   |
| inventory_history | 50,000         | ~50 MB  |

**Total DB Size: ~700 MB**

---

## 🔒 Security Best Practices

1. **Authentication**: JWT with expiry
2. **Hashing**: bcrypt for passwords
3. **Validation**: Input validation on all endpoints
4. **Authorization**: Role-based access control (RBAC)
5. **Encryption**: TLS for database connections
6. **Audit Logging**: Track all modifications
7. **Rate Limiting**: Prevent API abuse

---

## 📈 Scalability Considerations

1. **Sharding**: By category or region if > 1TB
2. **Replication**: 3-node replica set for HA
3. **Caching**: Redis for frequently queried data
4. **Pagination**: Always implement for large datasets
5. **Archival**: Move old inventory history to cold storage

---

## 🚀 Next Steps

1. Set up MongoDB Atlas or local MongoDB instance
2. Create `.env` file with database credentials
3. Run database initialization scripts
4. Implement authentication middleware
5. Build API endpoints following REST conventions
6. Add request validation and error handling
7. Set up automated backups
8. Implement logging and monitoring
