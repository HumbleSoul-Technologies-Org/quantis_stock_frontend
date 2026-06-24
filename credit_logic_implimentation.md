# Phase-Based Plan: Credit Sales Feature (Client-Side Only)

## TL;DR

Implement a complete credit sales system on the client-side by: (1) extending the Sale type with credit fields, (2) enhancing DataContext with credit state management, (3) building UI components for credit workflows, (4) adding customer credit profiles and payment tracking, (5) creating invoices/receipts, and (6) building analytics dashboards—all without backend changes, ensuring zero disruption to existing features.

## Architecture Overview

- **State Management:** Extend `DataContext.tsx` with credit-specific state and actions
- **Data Model:** Add credit fields to `Sale` type; new types for `Customer`, `Payment`, `CreditAccount`
- **Storage:** Persist credit data via existing `storage.ts` with encrypted backup
- **UI Components:** New forms, modals, and pages in `/components` and `/app/dashboard`
- **Validation:** Use existing error parsers and form validation patterns
- **Notifications:** Leverage `NotificationContext` for payment reminders and alerts

## Implementation Phases

### Phase 1: Foundation & Core Credit Sale (Weeks 1–2)

**Goal:** Enable marking sales as credit, store credit sale data, and integrate into existing sales flow.

**Steps:**

1. **Extend `lib/types.ts`** with new types:
   - Add credit fields to `Sale` interface: `isCredit: boolean`, `customerId?: string`, `dueDate?: string`, `creditTerms?: { paymentTerm: string; interestRate?: number }`, `outstandingBalance: number`
   - New type `Customer`: `id`, `_id`, `name`, `email`, `phone`, `businessId`, `totalCredit`, `outstandingBalance`, `creditLimit`, `lastPaymentDate`, `createdAt`
   - New type `CreditAccount`: `id`, `_id`, `customerId`, `totalDebt`, `amountPaid`, `outstandingBalance`, `dueDate`, `status: 'active' | 'overdue' | 'closed'`

2. **Update `context/DataContext.tsx`**:
   - Add state: `customers: Customer[]`, `creditAccounts: CreditAccount[]`
   - Add functions: `addCustomer(customer)`, `getOrCreateCustomer(name, email)`, `addCreditSale(sale)`, `updateCustomerBalance(customerId, amount)`
   - Update `addSale()` to handle credit logic: if `sale.isCredit === true`, call `addCreditSale()` instead
   - Persist customers and credit accounts to storage

3. **Update `lib/storage.ts`**:
   - Extend `AppState` type to include `customers`, `creditAccounts`
   - Add methods: `getCustomers()`, `saveCustomers()`, `getCreditAccounts()`, `saveCreditAccounts()`
   - Initialize default empty arrays in `DEFAULT_STATE`

4. **Modify `components/sales/SalesForm.tsx`**:
   - Add checkbox: "Sell on Credit?" (visible only to managers/admins)
   - Add conditional fields (when credit enabled):
     - Customer selector/quick-add
     - Payment term dropdown: "Net 30", "Net 60", "Net 90", or custom date picker
     - Display customer's current outstanding balance and credit limit
   - Validation: Ensure credit limit is not exceeded
   - Use existing error parsers for field-level errors

5. **Validation & Error Handling**:
   - If `isCredit === true` and customer not selected → error: "Customer required for credit sale"
   - If outstanding balance + new sale > credit limit → error: "Exceeds customer credit limit"
   - Use existing `useToast()` and error display patterns

**Verification**:

- ✅ Can mark a sale as credit without breaking cash sales
- ✅ Customer records are created and persisted
- ✅ Credit account balance is tracked
- ✅ Sales page still displays all sales (both cash and credit)
- ✅ No backend calls; all data is local

---

### Phase 2: Customer Management & Credit Profiles (Weeks 2–3)

**Goal:** Create a dedicated customer management page with credit profiles and limit management.

**Steps:**

1. **Create `/app/dashboard/customers/page.tsx`**:
   - List shows: name, email, total outstanding, credit limit, status (active/overdue)
   - Filters: outstanding balance (>0), overdue, all
   - Search by name/email
   - Skeleton loaders (use existing `CardSkeleton`)

2. **Create Customer Components** in `/components/customers/`:
   - `CustomerList.tsx`: Table/card view with actions (edit, view details, delete)
   - `CustomerForm.tsx`: Add/edit customer with fields: name, email, phone, credit limit
   - `CustomerDetailPanel.tsx`: Shows credit profile—outstanding balance, credit usage %, recent sales, last payment
   - `CreditLimitEditor.tsx`: Modal to adjust credit limits (manager/admin only)

3. **Add CRUD Actions to DataContext**:
   - `updateCustomer(id, updates)`
   - `deleteCustomer(id)` (soft delete)
   - `getCustomerDetail(id)` returns aggregated data: balance, sales history, payments
   - Ensure optimistic updates for UI responsiveness

4. **Validation**:
   - Credit limit must be >= 0
   - Name/email required; email must be unique per business
   - Duplicate check with existing customers

**Verification**:

- ✅ Can create and manage customer profiles
- ✅ Credit limits are editable and persist
- ✅ Customer detail shows accurate outstanding balance
- ✅ Existing sales page unaffected

---

### Phase 3: Payment Tracking & Invoices (Weeks 3–4)

**Goal:** Record payments, manage credit balances, and generate professional invoices/receipts.

**Steps:**

1. **Extend `lib/types.ts`** with `Payment` type:
   - `id`, `_id`, `customerId`, `amount`, `paymentDate`, `paymentMethod: 'cash' | 'cheque' | 'bank_transfer' | 'other'`, `reference?: string`, `notes?: string`, `createdAt`

2. **Update DataContext**:
   - Add state: `payments: Payment[]`
   - Add functions:
     - `recordPayment(customerId, amount, paymentMethod, reference?)`: Creates payment record, updates outstanding balance
     - `getCustomerPaymentHistory(customerId)`: Returns sorted payments
     - `getOutstandingBalance(customerId)`: Returns current owed amount

3. **Create Payments Page** at `/app/dashboard/payments/`:
   - Tab 1: "Record Payment" form—customer selector, amount input, payment method, reference
   - Tab 2: "Payment History"—table with filters, sortable columns
   - Show running balance after each payment

4. **Create Payment Components** in `/components/payments/`:
   - `PaymentForm.tsx`: Record new payment with validation
   - `PaymentHistory.tsx`: Sortable table with date, customer, amount, method, balance
   - `PaymentSummary.tsx`: Shows total collected, total outstanding

5. **Enhanced Sales Forms & Components**:
   - Update sales list to show:
     - Sale type badge: "Credit" or "Cash"
     - Outstanding amount for credit sales
   - Add "Mark as Paid" quick action (if outstanding > 0)

6. **Invoice Generation**:
   - Extend `receiptFormatter.ts` to support invoices
   - Create `InvoicePreview.tsx` modal showing:
     - Invoice number, customer name/email/phone
     - Sale items, quantities, prices, totals
     - Due date, payment terms, notes
   - Add "Generate Invoice" button in sales view for credit sales

7. **Validation**:
   - Payment amount must be > 0 and <= outstanding balance
   - Payment date cannot be in future

**Verification**:

- ✅ Can record payments and see balance decrease
- ✅ Payment history is accurate
- ✅ Invoice preview displays correctly
- ✅ Credit sales show outstanding amount

---

### Phase 4: Notifications & Reminders (Weeks 4–5)

**Goal:** Proactively alert users about due payments, overdue amounts, and credit limit warnings.

**Steps:**

1. **Extend DataContext with Alert Logic**:
   - Add computed properties:
     - `overdueAccounts`: Credit accounts where `dueDate < today` and `outstandingBalance > 0`
     - `upcomingDuePayments`: Due within 7 days
     - `customerApproachingLimit`: Outstanding > 80% of credit limit
   - Add functions:
     - `getAlerts()`: Returns array of alerts
     - `markAlertAsRead(alertId)`: Dismiss alert

2. **Create Alerts Dashboard Widget**:
   - Add new card to main dashboard showing:
     - 🔴 Overdue Payments: Count + list
     - 🟡 Approaching Credit Limit: Count + list
     - 🟢 Upcoming Due (7 days): Count + list
   - Each alert is clickable
   - Dismiss button per alert

3. **Integrate with NotificationContext**:
   - Dispatch notifications for:
     - Payment received: "Payment of KES X received from Customer Y"
     - Overdue reminder: "Customer X has overdue payment of KES Y"
     - Credit limit warning: "Customer X approaching credit limit (85% used)"
   - Use existing `addNotification()` with appropriate priority

4. **Create Reminders Page** at `/app/dashboard/credit-sales/reminders`:
   - List of all overdue and upcoming due payments
   - Sortable by customer, amount, due date
   - Bulk actions: "Mark as Paid", "Adjust Due Date"

5. **Update Customer Detail Panel**:
   - Show status badge: 🟢 "Current", 🟡 "Approaching Limit", 🔴 "Overdue"
   - Display days overdue
   - Show payment due date prominently

**Verification**:

- ✅ Overdue accounts are flagged correctly
- ✅ Alerts appear on dashboard and update in real-time
- ✅ Notifications work without affecting existing types
- ✅ No backend calls; all date logic client-side

---

### Phase 5: Reporting & Analytics (Weeks 5–6)

**Goal:** Build dashboards and reports for credit sales insights, cash flow, and risk analysis.

**Steps:**

1. **Create Credit Sales Dashboard** at `/app/dashboard/reports/credit-sales`:
   - Metrics:
     - Total credit sales
     - Total outstanding
     - Total collected
     - Collection rate: `Total Collected / Total Credit Sales * 100%`
   - Charts (using `chartUtils.ts`):
     - Credit Sales Trend (line chart by month)
     - Outstanding by Customer (bar chart - top 10)
     - Aging Report (stacked bar: 0–30 days, 30–60 days, 60+ days)
     - Payment Method Distribution (pie chart)
   - Filters: Date range, customer, payment status

2. **Create Aging Report Component** in `/components/reports/`:
   - Table: Customer → Outstanding Amount → Days Overdue → % of Total
   - Color-coded: Green (current), Yellow (30–60 days), Red (60+ days)
   - Summary row with totals

3. **Extend Reports Page** at `/dashboard/reports/`:
   - Add tab for "Credit Sales Analytics"
   - Links to sub-reports: Aging, Customer Performance, Payment Trends

4. **Customer Performance Report**:
   - Metrics: Total sales, total paid, outstanding, payment history (on-time %, late %), credit score
   - Sortable by any metric

5. **Cash Flow Projection** (simple):
   - Assume all outstanding collected by due date
   - Project cumulative cash by month
   - Disclaimer about assumptions

6. **Update Main Dashboard**:
   - Add Credit Sales widget: total outstanding, 30/60/90+ breakdown
   - Show collection rate KPI
   - Link to detailed report

7. **Data Aggregation in DataContext**:
   - Functions:
     - `getCreditSaleMetrics()`: totals, trends, rates
     - `getAgingBuckets()`: group outstanding by days overdue
     - `getCustomerRanking()`: top/bottom by outstanding/history
     - `getPaymentTrends(period)`: aggregated payments by month

**Verification**:

- ✅ Dashboard shows accurate metrics
- ✅ Charts update when new sales/payments recorded
- ✅ Aging report correctly categorizes
- ✅ Filters work correctly

---

### Phase 6: Advanced Features & Polish (Weeks 6–7)

**Goal:** Fine-tune UX, add bulk operations, lay groundwork for future phases.

**Steps:**

1. **Bulk Payment Entry**:
   - Page at `/dashboard/payments/bulk`
   - Manual or CSV entry of multiple payments
   - Validation per row; display errors and successes

2. **Customer Credit Status Management**:
   - Ability to "suspend" customer (can't create new credit sales)
   - Mark account as "closed" or "paid in full"
   - Status change history

3. **Interest Calculation** (optional):
   - If interest rate > 0, calculate accrued monthly
   - Display in customer detail and reports
   - Include option in payment calculations

4. **Customizable Reports**:
   - Save report filters as "saved views"
   - Store in localStorage per business
   - Quick-load from sidebar

5. **Better Duplicate Handling**:
   - Detect existing customers by email
   - Option to merge duplicate records
   - Consolidate sales/payments/balance

6. **Audit Log for Credit Transactions**:
   - Extend activity logging to capture:
     - Credit sale created, payment recorded, limit changed, status changed
   - Use existing `logActivity` with credit types
   - Viewable in activity history

7. **UI Polish**:
   - Helpful tooltips on all credit pages
   - Consistent color-coding: Green (healthy), Yellow (warning), Red (critical)
   - Responsive design testing
   - Accessibility: ARIA labels, keyboard navigation

8. **Data Export** (client-side):
   - "Export to CSV" buttons on reports
   - Current view, all data, or date-range filtered

**Verification**:

- ✅ Bulk payment entry works without errors
- ✅ Customer status changes respected in credit logic
- ✅ Interest calculations visible and accurate
- ✅ Audit log captures all credit events
- ✅ Export generates valid CSV

---

## Critical Files to Modify/Create

### Modified Files

- `lib/types.ts`: Add Customer, CreditAccount, Payment types; extend Sale
- `context/DataContext.tsx`: Add credit state and functions
- `lib/storage.ts`: Add credit data persistence
- `components/sales/SalesForm.tsx`: Add credit sale checkbox and fields
- `app/dashboard/page.tsx`: Add credit alerts widget
- `components/sales/SalesTable.tsx`: Show credit badge and outstanding amount
- `app/dashboard/reports/page.tsx`: Add credit reports section

### New Files by Phase

**Phase 1:** (Types/DataContext updates only)

**Phase 2:**

- `app/dashboard/customers/page.tsx`
- `components/customers/CustomerList.tsx`
- `components/customers/CustomerForm.tsx`
- `components/customers/CustomerDetailPanel.tsx`
- `components/customers/CreditLimitEditor.tsx`

**Phase 3:**

- `app/dashboard/payments/page.tsx`
- `components/payments/PaymentForm.tsx`
- `components/payments/PaymentHistory.tsx`
- `components/payments/PaymentSummary.tsx`
- `components/sales/InvoicePreview.tsx`

**Phase 4:**

- `app/dashboard/credit-sales/reminders/page.tsx`
- `components/credit-sales/CreditAlertsWidget.tsx`
- `components/credit-sales/CustomerStatusBadge.tsx`

**Phase 5:**

- `app/dashboard/reports/credit-sales/page.tsx`
- `components/reports/CreditSalesOverview.tsx`
- `components/reports/AgingReport.tsx`
- `components/reports/CustomerPerformanceReport.tsx`
- `components/reports/CashFlowProjection.tsx`

**Phase 6:**

- `app/dashboard/payments/bulk/page.tsx`
- `components/credit-sales/BulkPaymentEntry.tsx`

---

## Dependency Map

```
Phase 1 (Foundation)
  ↓
Phase 2 (Customer Management)
  ↓
Phase 3 (Payments & Invoices)
  ↓
Phase 4 (Notifications & Reminders)
  ↓
Phase 5 (Reporting & Analytics)
  ↓
Phase 6 (Advanced Features & Polish)
```

---

## Risk & Mitigation

| Risk                            | Severity | Mitigation                                                |
| ------------------------------- | -------- | --------------------------------------------------------- |
| Breaking existing sales flow    | High     | Phase 1 non-breaking; `isCredit` defaults to false        |
| Data persistence & loss         | High     | Use encrypted storage; test data sync; backup             |
| Performance with large datasets | Medium   | Pagination; useMemo for calculations; index by customerId |
| Complex balance calculations    | Medium   | Unit test logic; validate manually                        |
| Date/timezone issues            | Medium   | Use ISO strings; test across timezones                    |
| Duplicate customer handling     | Low      | Email uniqueness; merge UI; warnings                      |

---

## Timeline Summary

- Phase 1: 2 weeks
- Phase 2: 1 week
- Phase 3: 1 week
- Phase 4: 1 week
- Phase 5: 1 week
- Phase 6: 1 week

**Total:** ~7 weeks (can be 5 weeks with parallel work)

---

## Success Metrics

1. Users can create credit sales without errors
2. Credit balance tracking is 100% accurate
3. Payment reconciliation takes <5 min/month
4. Overdue alerts reduce collection time by 30%
5. Credit sales increase by 20% within 1 month
6. Zero data loss
7. > 80% user adoption among sales/finance teams
