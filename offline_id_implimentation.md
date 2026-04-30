# Plan: Implement Offline ID System for Full Offline Mode

## Overview

Enable all features (suppliers, products, sales, stock movements, returns) to work offline by adding UUID-based `offline_id` fields to 7 resources and their cross-references. Each resource gets a permanent UUID at creation; when offline resources reference each other (e.g., product→supplier), both server ID (empty initially) and offline ID are stored. Server resolves offline references during sync to connect relationships.

---

## Implementation Phases

### Phase 1: Type System Updates (lib/types.ts)

Update 7 interfaces to add offline_id and offline reference fields:

#### 1. Supplier

```typescript
export interface Supplier {
  id?: string;
  _id?: string;
  offline_id?: string; // NEW: UUID for offline reference
  name: string;
  email: string;
  phone: string;
  // ... rest of fields
}
```

#### 2. Product

```typescript
export interface Product {
  id: string;
  _id?: string;
  offline_id?: string; // NEW: UUID for offline reference
  name: string;
  sku: string;
  supplierId: string; // CAN BE EMPTY when offline
  offline_supplier_id?: string; // NEW: Offline reference to supplier
  // ... rest of fields
}
```

#### 3. StockMovement

```typescript
export interface StockMovement {
  id: string;
  _id?: string;
  offline_id?: string; // NEW: UUID for offline reference
  productId: string; // CAN BE EMPTY when offline
  offline_product_id?: string; // NEW: Offline reference to product
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference: string;
  businessId?: string;
  createdBy: string | User;
  createdAt: string;
}
```

#### 4. Sale

```typescript
export interface Sale {
  id?: string;
  _id?: string;
  offline_id?: string; // NEW: UUID for offline reference
  saleNumber: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  status: "completed" | "returned";
  notes: string;
  businessId?: string;
  // ... rest of fields
}
```

#### 5. SaleReturn

```typescript
export interface SaleReturn {
  id?: string;
  _id?: string;
  offline_id?: string; // NEW: UUID for offline reference
  saleId: string; // CAN BE EMPTY when offline
  offline_sale_id?: string; // NEW: Offline reference to sale
  items: SaleReturnItem[];
  totalAmount: number;
  reason?: string;
  notes?: string;
  status: "pending" | "completed" | "cancelled";
  businessId?: string;
  // ... rest of fields
}
```

#### 6. SaleItem (nested in Sale.items)

```typescript
export interface SaleItem {
  productId: string; // CAN BE EMPTY when offline
  offline_product_id?: string; // NEW: Offline reference to product
  quantity: number;
  unitPrice: number;
  total: number;
}
```

#### 7. SaleReturnItem (nested in SaleReturn.items)

```typescript
export interface SaleReturnItem {
  productId: string; // CAN BE EMPTY when offline
  offline_product_id?: string; // NEW: Offline reference to product
  quantity: number;
  unitPrice: number;
  total: number;
}
```

---

### Phase 2: Client-Side ID Generation (context/DataContext.tsx)

Update 5 CRUD functions to generate offline_id at creation and set offline references:

#### 1. addSupplier

```typescript
const addSupplier = useCallback(
  async (supplier: Supplier) => {
    const supplierWithBusinessId = {
      ...supplier,
      offline_id: uuidv4(),  // NEW: Generate offline ID
      id: supplier.id || uuidv4(),
      businessId: supplier.businessId || user?.businessId,
    };
    // ... rest of function remains the same
  },
  [...]
);
```

#### 2. addProduct

```typescript
const addProduct = useCallback(
  async (product: Product) => {
    const productWithBusinessId = {
      ...product,
      offline_id: uuidv4(),                    // NEW: Generate offline ID
      id: product.id || uuidv4(),
      offline_supplier_id: product.supplierId, // NEW: Store offline reference
      supplierId: "",                          // NEW: Set to empty if offline
      businessId: product.businessId || user?.businessId,
    };
    // ... rest of function remains the same
  },
  [...]
);
```

#### 3. addStockMovement

```typescript
const addStockMovement = useCallback(
  async (movement: StockMovement) => {
    const movementWithBusinessId = {
      ...movement,
      offline_id: uuidv4(),                    // NEW: Generate offline ID
      id: movement.id || uuidv4(),
      offline_product_id: movement.productId,  // NEW: Store offline reference
      productId: "",                           // NEW: Set to empty if offline
      businessId: movement.businessId || user?.businessId,
    };
    // ... rest of function remains the same
  },
  [...]
);
```

#### 4. addSale

```typescript
const addSale = useCallback(
  async (sale: Sale) => {
    const saleWithBusinessId = {
      ...sale,
      offline_id: uuidv4(),  // NEW: Generate offline ID
      id: sale.id || uuidv4(),
      items: sale.items.map(item => ({  // NEW: Process items
        ...item,
        offline_product_id: item.productId,  // NEW: Store offline reference
        productId: "",                       // NEW: Set to empty if offline
      })),
      businessId: sale.businessId || user?.businessId,
    };
    // ... rest of function remains the same
  },
  [...]
);
```

#### 5. addSaleReturn

```typescript
const addSaleReturn = useCallback(
  async (saleReturn: SaleReturn) => {
    const saleReturnWithBusinessId = {
      ...saleReturn,
      offline_id: uuidv4(),                     // NEW: Generate offline ID
      id: saleReturn.id || uuidv4(),
      offline_sale_id: saleReturn.saleId,       // NEW: Store offline reference
      saleId: "",                               // NEW: Set to empty if offline
      items: saleReturn.items.map(item => ({   // NEW: Process items
        ...item,
        offline_product_id: item.productId,     // NEW: Store offline reference
        productId: "",                          // NEW: Set to empty if offline
      })),
      businessId: saleReturn.businessId || user?.businessId,
    };
    // ... rest of function remains the same
  },
  [...]
);
```

#### 6. updateSale (NEW - With Auto Stock Movement Creation)

When updating a sale, quantities may change. The system must automatically create stock movement entries for the quantity delta to maintain accurate inventory tracking. Both `offline_id` and `offline_product_id` must be preserved permanently.

**Quantity Delta Logic:**

- If `newQty > oldQty`: Create NEW `stock_out` movement with `quantity = newQty - oldQty`, `reason: "sale"`
- If `newQty < oldQty`: Create NEW `stock_in` movement with `quantity = oldQty - newQty`, `reason: "return"`
- If `newQty == oldQty`: No stock movement created

**Example:** Original sale has product quantity = 2. Update to quantity = 3. Creates stock_out with quantity = 1 and reason = "sale". This represents the additional stock deducted.

**Example:** Original sale has product quantity = 2. Update to quantity = 1. Creates stock_in with quantity = 1 and reason = "return". This represents stock being returned.

```typescript
const updateSale = useCallback(
  async (saleId: string, updatedSale: Partial<Sale>) => {
    // Fetch the original sale to compare quantities
    const originalSale = sales.find(
      (s) => s.id === saleId || s.offline_id === saleId,
    );
    if (!originalSale) {
      throw new Error("Sale not found for update");
    }

    // Preserve offline_id permanently
    const saleToUpdate = {
      ...updatedSale,
      offline_id: originalSale.offline_id, // PRESERVE: Keep original offline ID
      items:
        updatedSale.items?.map((item, index) => ({
          ...item,
          offline_product_id:
            item.offline_product_id ||
            originalSale.items[index]?.offline_product_id, // PRESERVE
          productId: item.productId || "",
        })) || originalSale.items,
      businessId: updatedSale.businessId || user?.businessId,
    };

    // Calculate quantity deltas and create stock movements for each item
    if (updatedSale.items && Array.isArray(updatedSale.items)) {
      for (let i = 0; i < updatedSale.items.length; i++) {
        const newItem = updatedSale.items[i];
        const oldItem = originalSale.items[i];

        if (!newItem || !oldItem) continue;

        const oldQty = oldItem.quantity || 0;
        const newQty = newItem.quantity || 0;
        const qtyDelta = newQty - oldQty;

        // Only create stock movement if quantity changed
        if (qtyDelta !== 0) {
          if (qtyDelta > 0) {
            // Quantity increased: Create stock_out for additional quantity taken
            await addStockMovement({
              offline_id: uuidv4(),
              offline_product_id:
                newItem.offline_product_id || newItem.productId,
              productId: "",
              quantity: qtyDelta,
              type: "stock_out",
              reason: "sale",
              notes: `Sale ${saleId} quantity update: +${qtyDelta} units`,
              date: new Date(),
              businessId: user?.businessId,
            } as StockMovement);
          } else {
            // Quantity decreased: Create stock_in for returned quantity
            await addStockMovement({
              offline_id: uuidv4(),
              offline_product_id:
                newItem.offline_product_id || newItem.productId,
              productId: "",
              quantity: Math.abs(qtyDelta),
              type: "stock_in",
              reason: "return",
              notes: `Sale ${saleId} quantity update: ${qtyDelta} units returned`,
              date: new Date(),
              businessId: user?.businessId,
            } as StockMovement);
          }
        }
      }
    }

    // Enqueue the sale update operation
    await enqueueAction({
      type: "update",
      endpoint: `/sales/${saleId}`,
      method: "PUT",
      payload: saleToUpdate,
    });

    // Update local state (DataContext)
    setSales((prevSales) =>
      prevSales.map((s) =>
        s.id === saleId || s.offline_id === saleId
          ? { ...s, ...saleToUpdate }
          : s,
      ),
    );
  },
  [sales, addStockMovement, user?.businessId, enqueueAction],
);
```

---

### Phase 2b: Form-Level Offline ID Capture (UI Components)

When resources are selected in forms offline, pass the resource's `offline_id` to maintain proper references. This ensures stock movements, products, and sales sync correctly by capturing the offline resource's UUID.

**Problem:** Forms must pass `offline_id` when selecting offline-created resources, not a server ID (which doesn't exist yet).

**Solution:** Use this pattern in all forms that select resources:

```typescript
const getResourceValue = (resource: any) => {
  // If has server ID, use that; if only offline_id, use that
  return resource.offline_id || resource.id || resource._id;
};
```

#### 1. ProductForm.tsx - Supplier Selection

When user selects a supplier:

```typescript
<SupplierSelect
  value={formData.supplierId}
  onChange={(supplier) => {
    const selectedId = supplier.offline_id || supplier.id || supplier._id;
    setFormData(prev => ({ ...prev, supplierId: selectedId }));
  }}
/>
```

#### 2. StockMovementForm.tsx - Product Selection

When user selects a product:

```typescript
<ProductSelect
  value={formData.productId}
  onChange={(product) => {
    const selectedId = product.offline_id || product.id || product._id;
    setFormData(prev => ({ ...prev, productId: selectedId }));
  }}
/>
```

#### 3. SalesForm.tsx - Product Selection in Items

When user selects products for each sale item:

```typescript
items.map((item, index) => (
  <ProductSelect
    key={index}
    value={item.productId}
    onChange={(product) => {
      const selectedId = product.offline_id || product.id || product._id;
      const newItems = [...items];
      newItems[index].productId = selectedId;
      setFormData(prev => ({ ...prev, items: newItems }));
    }}
  />
))
```

#### 4. SalesReturnDialog.tsx - Sale and Product Selection

When user selects a sale and return item products:

```typescript
// Sale selection
<SaleSelect
  value={formData.saleId}
  onChange={(sale) => {
    const selectedId = sale.offline_id || sale.id || sale._id;
    setFormData(prev => ({ ...prev, saleId: selectedId }));
  }}
/>

// Return item product selection
returnItems.map((item, index) => (
  <ProductSelect
    key={index}
    value={item.productId}
    onChange={(product) => {
      const selectedId = product.offline_id || product.id || product._id;
      const newItems = [...returnItems];
      newItems[index].productId = selectedId;
      setReturnItems(newItems);
    }}
  />
))
```

**Key Points:**

- **Precedence:** offline_id > id > \_id (prefer offline_id for offline resources)
- **Backward Compatible:** Works with both online and offline resources
- **No Breaking Changes:** Either ID works for lookup
- **Form Modification Files:**
  - `components/products/ProductForm.tsx`
  - `components/inventory/StockMovementForm.tsx`
  - `components/sales/SalesForm.tsx`
  - `components/sales/SalesReturnDialog.tsx`

---

### Phase 3: Server-Side Schema Updates (MongoDB models)

Add `offline_id` and offline reference fields to 7 models in `C:\Users\bb466\inventory-server\models\`:

- **Server schema expectations:**
  - use `type: String` and `index: true` for `offline_id` and offline reference fields
  - add compound indexes like `{ businessId: 1, offline_id: 1 }` and `{ businessId: 1, offline_<reference>_id: 1 }` for business-scoped lookup performance
  - make server ID fields optional when created offline so `supplierId`, `productId`, and `saleId` can be empty until resolution
  - preserve both server IDs and offline reference fields in persisted documents for audit and traceability

#### 1. Supplier.js

```javascript
offline_id: {
  type: String,
  index: true,  // Index for lookups
}
```

#### 2. Product.js

```javascript
offline_id: {
  type: String,
  index: true,  // Index for lookups
},
offline_supplier_id: {
  type: String,
  index: true,  // Index for lookups
},
supplierId: {
  type: String,
  // Allow null/empty for offline products
}
```

#### 3. StockMovement.js

```javascript
offline_id: {
  type: String,
  index: true,  // Index for lookups
},
offline_product_id: {
  type: String,
  index: true,  // Index for lookups
},
productId: {
  type: String,
  // Allow null/empty for offline movements
}
```

#### 4. Sale.js

```javascript
offline_id: {
  type: String,
  index: true,  // Index for lookups
},
// In SaleItem subdocument schema:
items: [{
  productId: {
    type: String,
    // Allow null/empty for offline items
  },
  offline_product_id: {
    type: String,
    index: true,  // Index for lookups
  },
  quantity: Number,
  unitPrice: Number,
  total: Number
}]
```

#### 5. SaleReturn.js

```javascript
offline_id: {
  type: String,
  index: true,  // Index for lookups
},
offline_sale_id: {
  type: String,
  index: true,  // Index for lookups
},
saleId: {
  type: String,
  // Allow null/empty for offline returns
},
// In SaleReturnItem subdocument schema:
items: [{
  productId: {
    type: String,
    // Allow null/empty for offline items
  },
  offline_product_id: {
    type: String,
    index: true,  // Index for lookups
  },
  quantity: Number,
  unitPrice: Number,
  total: Number
}]
```

---

### Phase 4: Server-Side ID Resolution (Controllers)

Update 5 create/update controllers in `C:\Users\bb466\inventory-server\controllers\` to resolve offline IDs before saving:

- **Controller expectations:**
  - resolve offline references only when the server ID is missing
  - always scope lookups by `businessId` for tenant isolation
  - preserve both `offline_id` and `offline_<reference>_id` fields in saved payloads
  - use null-safe checks before updating stock or related records
  - keep logic transaction/session-aware if the existing flow uses transactions
  - log resolution attempts and warnings when offline references cannot be resolved

#### 1. supplierControllers.js (createSupplier)

No resolution needed (root resource):

```javascript
const newSupplier = new Suppliers({
  ...data,
  offline_id: data.offline_id, // Just store the offline_id
  businessId: req.businessId,
});
```

#### 2. productControllers.js (createProduct)

Resolve offline_supplier_id if supplier_id is empty:

```javascript
let finalSupplierId = data.supplier_id;

if (!finalSupplierId && data.offline_supplier_id) {
  const supplier = await Suppliers.findOne({
    offline_id: data.offline_supplier_id,
    businessId: req.businessId,
  });
  if (supplier) {
    finalSupplierId = supplier._id; // Use server _id
  }
}

const newProduct = new Products({
  ...data,
  supplier_id: finalSupplierId,
  offline_id: data.offline_id,
  offline_supplier_id: data.offline_supplier_id, // Store both
  businessId: req.businessId,
});
```

#### 3. inventoryControllers.js (createStockMovement)

Resolve offline_product_id if productId is empty:

```javascript
let finalProductId = data.productId;

if (!finalProductId && data.offline_product_id) {
  const product = await Products.findOne({
    offline_id: data.offline_product_id,
    businessId: req.businessId,
  });
  if (product) {
    finalProductId = product._id; // Use server _id
  }
}

const newMovement = new StockMovement({
  ...data,
  productId: finalProductId,
  offline_id: data.offline_id,
  offline_product_id: data.offline_product_id, // Store both
  businessId: req.businessId,
});
```

#### 4. salesControllers.js (createSale)

Resolve product offline IDs in items:

```javascript
const resolvedItems = await Promise.all(
  data.items.map(async (item) => {
    let finalProductId = item.productId;

    if (!finalProductId && item.offline_product_id) {
      const product = await Products.findOne({
        offline_id: item.offline_product_id,
        businessId: req.businessId,
      });
      if (product) {
        finalProductId = product._id; // Use server _id
      }
    }

    return {
      ...item,
      productId: finalProductId,
      offline_product_id: item.offline_product_id, // Store both
    };
  }),
);

const newSale = new Sales({
  ...data,
  items: resolvedItems,
  offline_id: data.offline_id,
  businessId: req.businessId,
});
```

#### 5. saleReturnControllers.js (createSaleReturn)

Resolve saleId and product offline IDs:

```javascript
let finalSaleId = data.saleId;

if (!finalSaleId && data.offline_sale_id) {
  const sale = await Sales.findOne({
    offline_id: data.offline_sale_id,
    businessId: req.businessId,
  });
  if (sale) {
    finalSaleId = sale._id; // Use server _id
  }
}

const resolvedItems = await Promise.all(
  data.items.map(async (item) => {
    let finalProductId = item.productId;

    if (!finalProductId && item.offline_product_id) {
      const product = await Products.findOne({
        offline_id: item.offline_product_id,
        businessId: req.businessId,
      });
      if (product) {
        finalProductId = product._id; // Use server _id
      }
    }

    return {
      ...item,
      productId: finalProductId,
      offline_product_id: item.offline_product_id, // Store both
    };
  }),
);

const newSaleReturn = new SaleReturn({
  ...data,
  saleId: finalSaleId,
  offline_sale_id: data.offline_sale_id, // Store both
  items: resolvedItems,
  offline_id: data.offline_id,
  businessId: req.businessId,
});
```

---

### Phase 5: Sync Logic Verification (lib/offline/sync-engine.ts)

Verify sync payloads include offline_id references:

- Confirm: When syncing operations, payload includes `offline_id` fields
- Confirm: When syncing, reference fields (if empty) include corresponding offline field
- Add debug logs for offline ID resolution if needed
- No major changes expected (existing code should work)

---

### Phase 6: Offline Storage Verification (lib/storage.ts)

Verify offline storage methods handle new fields:

- Storage methods already persist full objects to localStorage/IndexedDB
- New fields will be preserved automatically
- No schema changes needed
- Validate that `addOfflineSupplier`, `addOfflineProduct`, `addOfflineStockMovement`, etc. work correctly

---

### Phase 7: Testing & Validation

Create comprehensive test scenarios to verify the implementation:

#### Scenario 1: Supplier → Product chain (offline)

1. Go offline
2. Create supplier (gets offline_id: uuid-1)
3. Create product with that supplier (gets offline_id: uuid-2, offline_supplier_id: uuid-1)
4. Go online, sync supplier (gets server ID, e.g., 507f1f77bcf86cd799439011)
5. Sync product → server resolves offline_supplier_id to server ID ✅

#### Scenario 2: Sale → SaleReturn chain (offline)

1. Go offline
2. Create sale (offline_id: uuid-3)
3. Create sale return referencing that sale (offline_id: uuid-4, offline_sale_id: uuid-3)
4. Go online, sync sale (gets server ID)
5. Sync sale return → server resolves offline_sale_id to server ID ✅

#### Scenario 3: Sale with items (offline)

1. Go offline
2. Create sale with 3 items, each with offline_product_id set
3. Go online, sync sale → server resolves all product offline IDs ✅
4. Verify items reference correct product server IDs in database

#### Scenario 4: Mixed online/offline resources

1. Create supplier online (has server ID)
2. Go offline, create product with that supplier
3. Go online, sync product → server sees server supplierId, uses it directly ✅
4. Verify product links to correct supplier

---

## Sync Payload Examples

### Offline Supplier Creation

```json
{
  "name": "Tech Supplies Inc",
  "email": "info@techsupplies.com",
  "phone": "+1-555-0123",
  "offline_id": "550e8400-e29b-41d4-a716-446655440000",
  "businessId": "69f0b1c4d86df760823a90c1"
}
```

### Offline Product Creation (before supplier syncs)

```json
{
  "name": "iPhone 15",
  "sku": "APPLE-15",
  "offline_id": "550e8400-e29b-41d4-a716-446655440001",
  "supplier_id": "", // EMPTY
  "offline_supplier_id": "550e8400-e29b-41d4-a716-446655440000", // References supplier offline_id
  "unitPrice": 999,
  "costPrice": 500,
  "unit": "units",
  "reorderLevel": 5,
  "currentStock": 0,
  "businessId": "69f0b1c4d86df760823a90c1"
}
```

### Offline Product Creation (after supplier syncs)

```json
{
  "name": "iPhone 15",
  "sku": "APPLE-15",
  "offline_id": "550e8400-e29b-41d4-a716-446655440001",
  "supplier_id": "507f1f77bcf86cd799439011", // NOW HAS SERVER ID
  "offline_supplier_id": "550e8400-e29b-41d4-a716-446655440000", // Still included
  "unitPrice": 999,
  "costPrice": 500,
  "unit": "units",
  "reorderLevel": 5,
  "currentStock": 0,
  "businessId": "69f0b1c4d86df760823a90c1"
}
```

---

## Relevant Files

### Client-Side

- **lib/types.ts** — 7 interfaces to update (Supplier, Product, StockMovement, Sale, SaleReturn, SaleItem, SaleReturnItem)
- **context/DataContext.tsx** — 5 functions to update (addSupplier, addProduct, addStockMovement, addSale, addSaleReturn)
- **components/products/ProductForm.tsx** — Update supplier selection to pass offline_id
- **components/inventory/StockMovementForm.tsx** — Update product selection to pass offline_id
- **components/sales/SalesForm.tsx** — Update product selection in items to pass offline_id
- **components/sales/SalesReturnDialog.tsx** — Update sale and product selection to pass offline_id
- **lib/storage.ts** — Verify offline storage methods (no edits expected)
- **lib/offline/sync-engine.ts** — Verify payload structure (no edits expected)

### Server-Side (C:\Users\bb466\inventory-server)

- **models/Supplier.js** — Add `offline_id` field
- **models/Product.js** — Add `offline_id`, `offline_supplier_id` fields
- **models/StockMovement.js** — Add `offline_id`, `offline_product_id` fields
- **models/Sale.js** — Add `offline_id` field, update SaleItem schema
- **models/SaleReturn.js** — Add `offline_id`, `offline_sale_id` fields, update SaleReturnItem schema
- **controllers/supplierControllers.js** — No resolution (just store offline_id)
- **controllers/productControllers.js** — Resolve offline_supplier_id logic
- **controllers/inventoryControllers.js** — Resolve offline_product_id logic
- **controllers/salesControllers.js** — Resolve product offline IDs in items
- **controllers/saleReturnControllers.js** — Resolve offline_sale_id and product offline IDs

---

## Verification Steps

1. **TypeScript Compilation**

   ```bash
   pnpm exec tsc --noEmit -p tsconfig.json
   ```

   All types should pass without errors ✅

2. **Functional Tests (Manual)**
   - Run Scenario 1-4 from Phase 7
   - Verify sync logs show offline_id resolution
   - Verify database shows resolved server IDs
   - Verify client offline storage reflects updates

3. **Edge Cases**
   - Delete supplier, then sync product referencing deleted supplier (should handle gracefully)
   - Sync product before supplier syncs (offline_id should resolve once supplier syncs)
   - Multiple products referencing same supplier (all should resolve to same server ID)

4. **Data Integrity**
   - Verify `offline_id` is unique per business (no duplicates)
   - Verify relationships are maintained (no orphaned references)
   - Verify server IDs populate correctly after sync

---

## Key Decisions

- `offline_id` is **not server-generated**; it's a permanent client UUID assigned at creation
- Both `server_id` (e.g., `supplierId`) and `offline_id` reference are **stored durably** in database
- `offline_id` is **unique per business** (scoped to `businessId`)
- Server resolves offline IDs **before validation/save** so no downstream issues
- Offline refs included in sync payload **even after server ID exists** (for traceability & audit)

---

## Out of Scope

- Deleting offline items (assume all offline items are valid and will sync)
- Merging duplicate resources post-sync (document as limitation)
- Offline edit/update operations (focus is creation initially)
- Mobile app sync (web-only for now)
- Complex conflict resolution (users shouldn't create duplicates)

---

## Further Considerations

### 1. Data Migration

Existing offline items (created before this implementation) won't have `offline_id`.

**Recommendation:** Generate on app startup for any offline resources missing `offline_id`:

```typescript
const migrateOfflineIds = (resources) => {
  return resources.map((resource) => ({
    ...resource,
    offline_id: resource.offline_id || uuidv4(),
  }));
};
```

### 2. Conflict Resolution

If user creates product with supplier online, then offline creates same supplier with different name:

- Current approach: Both sync separately (could create duplicates)
- Better approach: Client-side deduplication? Server-side merging?

**Recommendation:** Document as limitation — users shouldn't create duplicates offline. Consider server-side duplicate detection in future phase.

### 3. Audit Trail

Consider storing both `offline_id` and final `server_id` in database for:

- Debugging sync issues
- Tracing data lineage
- Understanding offline-to-online mapping

**Recommendation:** Already implemented (storing both IDs). Could add audit log table in future phase.

### 4. Performance Optimization

Lookups by `offline_id` should be indexed for fast resolution during sync.

**Recommendation:** Add indexes to `offline_id` fields on all models (already included in Phase 3 schema examples).

---

## Execution Order

1. ✅ Phase 1: Update types (lib/types.ts)
2. ✅ Phase 2: Update DataContext functions (context/DataContext.tsx)
3. ✅ Phase 2b: Form-level offline ID capture (4 UI components) — **CRITICAL FOR SYNC SUCCESS**
4. ✅ Phase 3: Update server schemas (models)
5. ✅ Phase 4: Implement ID resolution (controllers)
6. ✅ Phase 5: Verify sync logic (lib/offline/sync-engine.ts) — likely no changes
7. ✅ Phase 6: Verify offline storage (lib/storage.ts) — likely no changes
8. ✅ Phase 7: Run test scenarios

**Parallel execution possible:**

- Phase 1, 2 & 2b can be done together (client-side)
- Phase 3 & 4 depend on Phase 1 types being finalized, then can be done together (server-side)
- Phase 5 & 6 can be done in parallel with Phase 2

**Why Phase 2b is Critical:** Without form-level offline ID capture, resources selected from dropdowns will pass incorrect IDs, causing server-side resolution to fail with "not found" errors during sync.

---

## Next Steps

- [ ] Execute Phase 1: Update types in lib/types.ts
- [ ] Execute Phase 2: Update DataContext functions
- [ ] **Execute Phase 2b: Update forms to capture offline IDs** ← DO BEFORE PHASE 3
- [ ] Compile TypeScript: `pnpm exec tsc --noEmit -p tsconfig.json`
- [ ] Execute Phase 3: Update server schemas
- [ ] Execute Phase 4: Implement ID resolution in controllers
- [ ] Execute Phase 5: Verify sync logic
- [ ] Execute Phase 6: Verify offline storage
- [ ] Execute Phase 7: Run manual test scenarios
