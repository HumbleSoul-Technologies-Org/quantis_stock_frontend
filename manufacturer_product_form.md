# Manufacturing Product Form Structure

This document captures the proposed structure for a universal manufacturing product form that can support multiple manufacturing business types such as food and beverages, textiles, chemicals, electronics, cosmetics, and other production-based businesses.

## Design Principles

- Keep the form flexible for different manufacturing industries.
- Separate broad classification from specific product details.
- Keep manufacturing-specific fields available for production planning and costing.
- Keep inventory separate from stock management where appropriate.

## Form Sections and Fields

### 1. Basic Information

- Product name
- Product code / SKU
- Product type
- Category
- Brand
- Description
- Status
  - Active
  - Inactive
  - Discontinued

### 2. Product Classification

- Product type
  - Example: Food and beverages, Textiles and apparel, Chemicals, Electronics
- Category
  - Example: Drinks, Clothing, Detergent, Spare parts
- Product stage
  - Raw material
  - Work in progress
  - Finished good
- Unit of measure
  - Piece, KG, Liter, Meter, Box, Carton, etc.
- Packaging type
  - Bottle, Box, Carton, Pouch, Drum, Bag, etc.

### 3. Production Setup

- Bill of Materials (BOM)
- Raw material requirements
- Standard production quantity
- Expected yield
- Rework / waste allowance
- Production cost per unit
- Production method / process type
- Production lead time

### 4. Variant and Packaging Details

- Variant name
- Size / volume
- Color
- Material
- Pack size
- Packaging requirements

### 5. Quality and Compliance

- Quality standard
- Inspection requirements
- Shelf life / durability
- Storage condition
- Compliance notes

### 6. Stock and Availability

- Current stock quantity
- Minimum stock level
- Maximum stock level
- Reorder level
- Storage location / warehouse

### 7. Costing and Pricing

- Cost price
- Selling price
- Currency
- Tax category

### 8. Optional Advanced Fields

- Recipe / formula
- Batch size
- Machine / equipment required
- Labour requirement
- Serial number requirement
- Lot number requirement

## Recommended Meaning of Key Fields

### Product type

A broad manufacturing group that describes the general business area.

Examples:

- Food and beverages
- Textiles and apparel
- Chemicals
- Electronics

### Category

A more specific class within the selected product type.

Examples:

- If Product type = Food and beverages
  - Category = Drinks
- If Product type = Textiles and apparel
  - Category = Clothing
- If Product type = Chemicals
  - Category = Detergent

### Product stage

Describes where the product sits in the production lifecycle.

- Raw material: input used to manufacture another product
- Work in progress: partially processed goods
- Finished good: completed product ready for sale or delivery

## Recommended MVP Field Set

For an initial implementation, the following fields are enough to make the form useful:

- Product name
- SKU
- Product type
- Category
- Product stage
- Unit of measure
- Packaging type
- BOM / raw materials
- Standard production quantity
- Expected yield
- Production cost per unit
- Quality standard
- Current stock
- Cost price
- Selling price

## Notes for Later Implementation

- Some fields should be optional depending on the manufacturing business type.
- The form should support both simple and advanced manufacturing workflows.
- The same form should be usable for edible and non-edible products.
- Inventory should remain a separate feature from basic stock tracking where required.
