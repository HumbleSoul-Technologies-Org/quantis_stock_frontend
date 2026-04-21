# Product Variant Tracking System - Implementation Plan

## Overview

Universal variant system for tracking products with multiple variants across all categories (electronics, clothing, plumbing, furniture, food/beverages, beauty products, etc.). Each variant has independent stock tracking, and sales are logged with specific variant details.

## Requirements

- Admin creates parent products (e.g., "iPhone", "Shirt", "PVC Pipe")
- Then adds variants with flexible custom attributes (e.g., White/Black/Blue for iPhone)
- Each variant has independent stock level
- All variants share the same unit price (product-level pricing)
- Two-step creation: Create parent product → Add variants separately
- Stock movements track variant-specific deductions with full details (variant name + price)
- Support flexible/custom variant attributes (key-value pairs)
- Works across all product categories (clothing, electronics, plumbing, furniture, etc.)

## Implementation Plan

### Step 1: Modify Product Type Definition (`lib/types.ts`)

Add `Variant` interface with: `id`, `name`, `attributes` (flexible), `stock`, `createdAt`

- Add `variants?: Variant[]` array to `Product` interface
- Add `isParentProduct?: boolean` flag to identify products with variants
- Keep `currentStock` as aggregate of all variant stocks (for backward compatibility)

### Step 2: Update Sale Item Type (`lib/types.ts`)

- Modify `SaleItem` to include optional `variantId` field
- Add `variantName` to track variant details in stock movement reference

### Step 3: Modify Product Creation UI (`components/products/ProductForm.tsx`)

- After product is created, show success message with "Add Variants" button
- Clicking button opens variant management modal
- Modal allows: Add variant (name + flexible attributes), View variants, Delete variant
- On variant add, persist to storage/API immediately

### Step 4: Create Variant Management Component (`components/products/VariantManager.tsx` - NEW)

- Modal UI with form: Variant name, Custom attributes (key-value pairs)
- Table showing all variants with stock levels and delete button
- Ability to edit variant stock directly
- Supports dynamic attribute fields based on product category (optional category-aware suggestions)

### Step 5: Update Sales Form (`components/sales/SalesForm.tsx`)

- When product selected, check if it has variants
- If variants exist, show variant dropdown/selector
- If no variants, behave as current (simple product)
- Line item includes: productId + variantId (if applicable)

### Step 6: Modify Sale Creation Logic (`context/DataContext.tsx`)

- When adding sale item with variant:
  - Deduct stock from specific variant (not total product stock)
  - Preserve variant info in sale item
- When creating stock movement:
  - Include variant name in reference or create separate field
  - Reference format: "Sale-{saleNumber}-{variantName}" or add `variantName` field to `StockMovement`

### Step 7: Update Stock Movement Tracking (`lib/types.ts`)

- Add optional `variantName?: string` field to `StockMovement` interface
- Stock movement display shows: "Sale - White iPhone @ $800" (combines variant + reference)

### Step 8: Update Stock Display (`components/inventory/InventoryStats.tsx`, `components/inventory/ProductInventoryCard.tsx`)

- If product has variants, show variant-level stock breakdown
- Aggregate total stock for parent product
- Display each variant with its stock count

### Step 9: Persist Variant Data (`lib/storage.ts`)

- Modify `addProduct` to save variants array
- Modify `updateProduct` to update variants
- Add `addVariant`, `updateVariant`, `deleteVariant` functions
- Sync variants to API alongside product data

### Step 10: Update Product Display (`components/products/ProductTable.tsx`)

- Show parent products with variant count badge (e.g., "iPhone (4 variants)")
- On expand/click, show variant list with stock levels

## Type Definitions

### Variant Interface

```typescript
export interface Variant {
  id: string;
  name: string; // e.g., "White", "Blue M", "16GB 256GB"
  attributes: Record<string, string>; // e.g., {color: "White", size: "M", capacity: "256GB"}
  stock: number;
  createdAt: string;
  updatedAt?: string;
}
```

### Updated Product Interface

```typescript
export interface Product {
  // ... existing fields
  currentStock: number; // Aggregate of all variant stocks
  variants?: Variant[];
  isParentProduct?: boolean;
}
```

### Updated SaleItem Interface

```typescript
export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  variantId?: string; // NEW: Reference to specific variant
  variantName?: string; // NEW: Cached variant name for display/tracking
}
```

### Updated StockMovement Interface

```typescript
export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference: string;
  variantName?: string; // NEW: Track which variant was moved
  businessId?: string;
  createdBy: string | User;
  createdAt: string;
}
```

## Category-Specific Variant Examples

### Electronics (iPhone)

- Parent: "iPhone 15"
- Variants: `{color: "White", storage: "256GB"}`
- Variants: `{color: "Black", storage: "256GB"}`
- Variants: `{color: "Blue", storage: "512GB"}`

### Clothing (Shirt)

- Parent: "Cotton T-Shirt"
- Variants: `{color: "Blue", size: "M"}`
- Variants: `{color: "Blue", size: "L"}`
- Variants: `{color: "Red", size: "M"}`
- Variants: `{color: "Red", size: "L"}`

### Plumbing Materials (PVC Pipe)

- Parent: "PVC Pipe"
- Variants: `{diameter: "1.5 inch", pressure: "100PSI"}`
- Variants: `{diameter: "2 inch", pressure: "100PSI"}`
- Variants: `{diameter: "1.5 inch", pressure: "150PSI"}`

### Furniture (Couch)

- Parent: "Leather Couch"
- Variants: `{color: "Dark Brown", size: "3-seater"}`
- Variants: `{color: "Black", size: "2-seater"}`
- Variants: `{color: "Beige", size: "3-seater"}`

### Food/Beverages (Juice)

- Parent: "Orange Juice"
- Variants: `{flavor: "Fresh Orange", size: "500ml"}`
- Variants: `{flavor: "Fresh Orange", size: "1L"}`
- Variants: `{flavor: "Pulp Free", size: "500ml"}`

### Beauty Products (Shampoo)

- Parent: "Hair Shampoo"
- Variants: `{scent: "Lavender", size: "200ml"}`
- Variants: `{scent: "Rose", size: "200ml"}`
- Variants: `{scent: "Lavender", size: "500ml"}`

## Stock Movement Examples

When a sale is recorded for a specific variant, the stock movement will show:

```
Type: "out"
Reason: "Sale"
Reference: "S-1713607200000-White iPhone"
VariantName: "White iPhone @ $800"
Quantity: 2
CreatedAt: "2024-04-20T10:30:00Z"
```

Display in UI: **"Sale - White iPhone @ $800 (Qty: 2) - Ref: S-1713607200000"**

## Files to Modify/Create

**Modified:**

- `lib/types.ts` — Add Variant type, modify Product/SaleItem/StockMovement
- `components/products/ProductForm.tsx` — Add "Add Variants" button
- `components/sales/SalesForm.tsx` — Add variant selector
- `context/DataContext.tsx` — Update addProduct, addSale, addVariant logic
- `lib/storage.ts` — Persist variants
- `components/products/ProductTable.tsx` — Show variant count badge
- `components/inventory/InventoryStats.tsx` — Show variant breakdown
- `components/inventory/ProductInventoryCard.tsx` — Show variant breakdown

**Created:**

- `components/products/VariantManager.tsx` — Variant CRUD modal
- `hooks/useVariants.ts` — Custom hook for variant operations (optional)

## Verification Checklist

- [ ] Create product without variants → Works as before (backward compatible)
- [ ] Create product with variants:
  - [ ] Create "iPhone" product
  - [ ] Click "Add Variants"
  - [ ] Add 4 variants: White (20), Black (15), Blue (10), Pink (8)
  - [ ] Each variant shows with independent stock
- [ ] Make sale with variant:
  - [ ] Create sale → Select "iPhone" → Select "White" → Qty 3
  - [ ] Stock: White 20 → 17
  - [ ] Stock movement: "Sale - White iPhone @ $800"
  - [ ] Total product stock updates (aggregate)
- [ ] Products page displays variants with badge
- [ ] Inventory cards show variant breakdown
- [ ] Offline sync queues variant operations
- [ ] Build succeeds with no TypeScript errors

## Key Design Decisions

1. **Variants are optional** — Backward compatible with existing products
2. **Price is product-level** — Not variant-level (all variants of same product have same price)
3. **Flexible attributes** — Key-value pairs, not predefined fields
4. **Two-step creation** — Better UX, allows gradual variant addition
5. **Aggregate currentStock** — Computed from all variants for backward compatibility
6. **Stock movements include variantName** — For detailed tracking
7. **Universal system** — Works across all product categories

## Future Enhancements

1. Category-aware attribute suggestions (e.g., Clothing suggests color/size)
2. Bulk variant import (CSV upload)
3. Variant-specific reorder levels
4. Variant images (different image per variant)
5. Variant-specific pricing (if needed)
6. Variant barcodes/QR codes
7. Variant transfer between products

---

**Status:** Ready for implementation  
**Created:** April 20, 2026  
**Next Steps:** Follow the 10-step implementation plan sequentially, starting with Type Definitions (Step 1)
