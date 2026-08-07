# Manufacturing Expense Structure

This document captures the final proposed structure for expense management for a manufacturing business type.

## 1. Expense

```ts
type Expense = {
  id: string;
  businessId: string;
  branchId?: string;
  department?: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paymentMethod: "cash" | "bank" | "mobileMoney" | "other";
  paymentStatus: "unpaid" | "partial" | "paid";
  approvalStatus: "draft" | "submitted" | "approved" | "rejected" | "paid";
  reference?: string;
  supplierId?: string;
  employeeId?: string;
  productionOrderId?: string;
  costCenter?:
    | "production"
    | "warehouse"
    | "dispatch"
    | "maintenance"
    | "admin"
    | "other";
  attachmentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

## 2. Expense Category

```ts
type ExpenseCategory = {
  id: string;
  name: string;
  type:
    | "production"
    | "admin"
    | "warehouse"
    | "maintenance"
    | "transport"
    | "other";
};
```

## 3. Expense Payment

```ts
type ExpensePayment = {
  id: string;
  expenseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "bank" | "mobileMoney" | "other";
  reference?: string;
};
```

## 4. Expense Approval

```ts
type ExpenseApproval = {
  id: string;
  expenseId: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "submitted" | "approved" | "rejected";
  note?: string;
};
```

## 5. Expense Attachment

```ts
type ExpenseAttachment = {
  id: string;
  expenseId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};
```

## 6. Recommended Design Principles

- Keep expenses as the main source of truth.
- Use categories for reporting.
- Use cost center so the business can see where money is spent.
- Use production order linkage for manufacturing cost tracking.
- Keep approval and payment as separate states.
- Support attachments for audit and reconciliation.

## 7. Best Recommendation for a Manufacturing Business

For a manufacturing business, the most useful version is:

- Expense
- Expense Category
- Expense Approval
- Expense Payment
- Expense Attachment

This gives the system a practical module that supports:

- daily expense capture
- approval control
- payment tracking
- manufacturing cost analysis
