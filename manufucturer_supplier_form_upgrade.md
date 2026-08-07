# Manufacturer Supplier Form Upgrade

This document captures the concluded supplier structure for manufacturing businesses, designed for later implementation.

## 1. Recommended Supplier Approach

Use one shared supplier module, but allow it to support both:

- retail/wholesale supplier flow
- manufacturing supplier flow

This is better than creating a completely separate supplier system for manufacturers.

## 2. Suggested Supplier Structure

### A. Basic Supplier Identity

- Supplier name
- Supplier code
- Contact person
- Phone number
- Email
- Address
- Supplier type
  - raw material supplier
  - packaging supplier
  - general supplier
  - wholesale/retail supplier

### B. Supplier Classification

- Supplier category
  - local
  - import
  - preferred
  - alternate
- Business type
  - manufacturing supplier
  - retail supplier
  - wholesale supplier

### C. Supply Details

- Materials supplied
- Raw material category
- Packaging materials supplied
- Delivery terms
- Lead time
- Minimum order quantity
- Maximum order quantity

### D. Pricing and Payment

- Unit price
- Currency
- Payment terms
- Credit period
- Preferred payment method

### E. Delivery and Logistics

- Delivery frequency
- Preferred delivery time
- Delivery location
- Transportation method

### F. Quality and Compliance

- Quality certification
- Product quality notes
- Shelf life / expiry handling
- Inspection requirements

### G. Relationship and Performance

- Supplier rating
- Reliability score
- Delivery performance
- Payment history
- Notes / remarks

## 3. Recommended Implementation Direction

The supplier form should be flexible enough to support:

- retail and wholesale suppliers
- raw material suppliers for manufacturing
- packaging suppliers for production

This keeps the system simple while still covering manufacturing needs.

## 4. Final Conclusion

The best structure is:

- one shared supplier master record
- with manufacturing-specific fields for raw material sourcing and production support
