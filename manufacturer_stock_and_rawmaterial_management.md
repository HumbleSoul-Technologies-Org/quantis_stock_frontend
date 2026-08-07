# Manufacturing Stock and Raw Material Management

This document captures the suggested structure for manufacturing stock management, stock movement records, and raw material tracking for later review and implementation.

## 1. Manufacturing Stock Management Structure

### A. Raw Materials

Used to track input materials used in production.

Suggested fields:

- Raw material name
- Raw material code / SKU
- Category
- Description
- Unit of measure
- Packaging unit
- Quantity per pack
- Sub-unit size
- Total equivalent quantity
- Opening balance
- Current stock balance
- Quantity received
- Quantity used
- Quantity wasted
- Reorder level
- Minimum stock level
- Maximum stock level
- Supplier
- Purchase price
- Currency
- Storage location
- Storage condition
- Expiry date
- Handling notes

### B. Work in Progress (WIP)

Used to track goods that are currently being processed but are not yet finished.

Suggested fields:

- Product name
- Product code / SKU
- Batch / production reference
- Quantity in progress
- Current production stage
- Start date
- Expected completion date
- Department / production line
- Quality status
- Remarks

### C. Finished Goods

Used to track completed products ready for sale or dispatch.

Suggested fields:

- Product name
- Product code / SKU
- Batch / lot number
- Quantity completed
- Packaging type
- Storage location
- Production date
- Quality status
- Selling price
- Remarks

### D. Stock Summary / Balance View

Used to show the current overall stock situation.

Suggested fields:

- Raw material balance
- WIP balance
- Finished goods balance
- Low stock alerts
- Reorder alerts
- Recent stock movements

---

## 2. Suggested Stock Movement Fields

The stock movement record should support manufacturing-specific movements, not just basic sales stock movement.

Suggested fields:

- Movement date
- Movement type
- Product / material name
- Product code / SKU
- Stock stage
  - Raw material
  - WIP
  - Finished good
- Quantity
- Unit of measure
- Unit cost / price
- Source
- Destination
- Reference number
- Batch / lot number
- Production order ID
- Production line / department
- Reason for movement
- Quality status
- Remarks

### Suggested movement types

- Received from supplier
- Issued to production
- Transferred to WIP
- Production completed
- Finished goods dispatched
- Wasted
- Damaged
- Rejected
- Adjusted
- Returned

---

## 3. Suggested Raw Material Fields

These are the raw material-specific fields that should be available in the form.

Suggested fields:

- Raw material name
- Raw material code / SKU
- Category
- Description
- Unit of measure
- Packaging unit
- Quantity per pack
- Sub-unit size
- Total equivalent quantity
- Current stock balance
- Quantity received
- Quantity used
- Quantity wasted
- Reorder level
- Minimum stock level
- Maximum stock level
- Supplier
- Purchase price
- Currency
- Storage location
- Storage condition
- Expiry date
- Handling notes
- Production usage reference

---

## 4. Recommended Structure for the Form

The form should be organized in sections so that the user can record data according to the selected stock stage.

### Section 1: Basic details

- Stock type
- Product / material name
- Product code / SKU
- Date
- Reference number
- Batch / lot number

### Section 2: Movement details

- Movement type
- Quantity
- Unit of measure
- Source
- Destination
- Reason

### Section 3: Raw material-specific fields

- Supplier
- Packaging unit
- Quantity per pack
- Sub-unit size
- Total equivalent quantity
- Storage location

### Section 4: WIP-specific fields

- Production batch ID
- Current stage
- Department / line
- Expected completion date

### Section 5: Finished goods fields

- Packaging type
- Storage location
- Quality status

### Section 6: Balance / summary

- Opening balance
- Stock in
- Stock out
- Closing balance
- Low stock alert

---

## 5. Notes for Later Implementation

- The stock form should be dynamic and change based on whether the record is for raw materials, WIP, or finished goods.
- The unit of measure and packaging structure should be supported for accurate raw material tracking.
- The stock movement record should be manufacturing-aware and support production-based movements.
- Raw material tracking should be integrated into the stock management system rather than treated as a completely separate feature.
