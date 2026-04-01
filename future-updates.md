# Future Update Roadmap

This document captures future feature updates at page level for the inventory system, by page grouping.

## 1. Products page (app/dashboard/products/page.tsx)
- Add `sales` role to view as read-only:
  - hide Add/Edit/Delete
  - hide StockIn route button
  - show availability badges (In stock / Low stock / Out of stock)
- Add analytics columns:
  - total sold units
  - total revenue per product
  - margin % per product
  - inventory turnover metric
- Add extended filter capabilities:
  - price range, cost range, supplier, status (active/inactive)
- Add bulk operation:
  - CSV import and bulk updates (category assignment, stock adjust)
- Add product deep drill-down:
  - product details, stock history, cost history, supplier links
- Add stronger validation:
  - `unitPrice`, `costPrice`, `currentStock`, `reorderLevel` finite and >=0

## 2. Inventory page (app/dashboard/inventory/page.tsx)
- Add live stock health dashboard:
  - in-hand, reserved, committed, available, forecast out days
- Add cycle-count and adjustment workflows:
  - create/review/finalize count—variance over/short report
- Add depletion forecast:
  - average daily `out` movement, days until stock out, reorder date
- Add multi-warehouse/location support (future):
  - location selector and per-location stock totals
- Add segmented movement KPI:
  - in/out/adjust/transfer, turnover, shrinkage
- Add role-based mode (sales read-only) and audit lines.

## 3. Sales page (app/dashboard/sales/page.tsx + components)
- Add stock validation before sale submission:
  - quantity <= current stock and low-stock warning
- Add lifecycle status model for sale:
  - `pending`, `confirmed`, `completed`, `cancelled`, `returned`
- Add payment capabilities:
  - partial payment, outstanding balance, multi-method
- Add advanced filtering/saved views:
  - product/customer/user/status/date range
- Add sales KPIs cards:
  - revenue, margin, items sold, avg order, velocity
- Add soft delete and audit trail with undo and metadata
- Add list export from current filters (CSV/PDF)
- Add per-sales-user metrics and commission tracking

## 4. Reports page (app/dashboard/reports/page.tsx)
- Add date range filters + presets (today/MTD/QTD/YTD/custom)
- Add visualizations:
  - trend charts (sales, inventory, categories)
- Add profit margin analytics:
  - product/category level and consolidated
- Add aging analysis:
  - 30/60/90+ days inventory aging report
- Add role-specific report views (sales/manager/accountant)
- Add export for filtered views (CSV, PDF)
- Add forecast/prediction hints in dashboards

## 5. Suppliers page (app/dashboard/suppliers/page.tsx)
- Add role-based permissions (view, edit, archive):
  - sales read-only, manager/editor, admin full
- Add supplier performance metrics:
  - lead time, on-time delivery %, fill rate, quality score
- Add supplier-product mapping section:
  - assigned SKUs, purchase cost, MOQ, lead time
- Add procurement PO integration:
  - create PO from supplier and display open PO status
- Add advanced search filters:
  - region/status/categories/recent orders
- Add supplier status management:
  - active/inactive/archive and blacklist
- Add supplier export capabilities (contact + metrics)

## 6. Settings page (app/dashboard/settings/page.tsx)
- Add Roles & Permissions management:
  - module-level access matrix
- Add multi-location setup:
  - warehouse config for location-specific thresholds
- Tax and pricing settings:
  - VAT/GST rules, multi-currency rates, rounding rules
- Notification rules engine:
  - event triggers, channel routing, recipients, webhook
- Audit/log policy settings:
  - retention period, audit toggle, log export
- Integration configuration:
  - API keys, webhooks, ERP connectors
- Security controls:
  - password policy, session timeout, 2FA
- Maintenance utilities:
  - data prune, cache invalidation, system health

## Roadmap Phases
### Phase 1 (high priority)
- Sales stock validation + status
- Product access for sales (read-only)
- Inventory low stock + reorder suggestion
- Reports date range + basic charts
- Suppliers role-based access + active/inactive

### Phase 2 (medium priority)
- Profit/margin/turnover KPIs
- Supplier performance + PO creation
- Reports drilldown and PDF/CSV export
- Settings permissions + audit policy
- Inventory cycle count + depletion forecast

### Phase 3 (advanced)
- Demand forecasting
- Multi-warehouse modelling
- Payment partials + invoices
- Sales quota & commissions
- ERP/CRM integrations

## Implementation notes
- Continue defensive array checks + date validation.
- Extend existing UI components with new props where possible.
- Use `user.role` checks in UI and data layers.
- Add tests for permissions and filtering.
- Maintain release change logs for each phase.

## Next steps
1. Commit this roadmap as `future-updates.README`.
2. Use ticket IDs: `feature/product-readonly-sales`, `feature/inventory-forecast`, `feature/reports-datefilters`, `feature/suppliers-performance`, etc.
3. Implement in iterative sprints and validate each page with role & data guard tests.
