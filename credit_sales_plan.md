# Credit Sales & Installment Payments System - Implementation Plan

## Requirements Summary

- **Credit Sales**: Optional toggle at checkout (not mandatory for all sales)
- **Customer Module**: Full customer profiles with credit limits & history
- **Installments**: Both fixed (3/6/12 months) and flexible (custom amounts/dates)
- **Credit Approval**: Automatic if under limit, manual override for exceeding
- **Interest/Penalties**: Configurable late payment fees
- **Payment Reminders**: Automated + manual override capability
- **Reporting**: Outstanding balance aging + full credit scorecard

## Architecture Overview

### New entities to create:

1. **Customer** - replaces simple name string, tracks credit history
2. **CreditConfig** - business-level credit settings (interest rates, approval limits)
3. **CreditSale** - extends Sale with credit-specific tracking
4. **InstallmentSchedule** - tracks payment schedule and history
5. **Payment** - records individual installment/payment entries
6. **CreditApproval** - approval workflow and credit limit tracking

### Implementation Phases

1. **Foundation** - New data types and database schema
2. **Customer Module** - CRUD operations and credit profile management
3. **Credit Sales Core** - Sale modification with credit flag and payment tracking
4. **Installment Engine** - Schedule generation and payment processing
5. **UI/UX** - Forms and payment tracking interfaces
6. **Reporting & Analytics** - Credit reports and dashboards
7. **Automation** - Reminders, overdue flags, interest calculations

---

## Current System Analysis

### Current Sale Structure

The `Sale` interface currently contains:

- `id`, `saleNumber`, `date`, `items` (array of SaleItem)
- `totalAmount`, `status` ('completed'|'returned')
- `customerName` (simple string - no customer relationship)
- `paymentType` ('cash'|'card'|'transfer'|'cheque'|'other'), `txnId`
- `notes`, `businessId`, `createdBy`, `createdAt`
- `returnStatus` ('none'|'partial'|'returned')

**Limitations:**

- No payment status tracking (pending, paid, overdue)
- No customer relationship/profile
- No installment or credit term support
- Basic payment info only (method + ID, no amounts or dates)

### Current Customer Tracking

- Only `customerName` string in Sale record
- No customer contact information
- No credit history or repeat customer tracking
- No credit limit management
- No dedicated Customer type

### Current Payment Flow

1. Sale created with payment method and txnId
2. No tracking of payment status after sale
3. Sale returns process refunds but no installment concept
4. No payment reminders or overdue tracking

---

## **Phase 1: Foundation - New Data Types & Schema**

_Prerequisite for all other phases_

### 1.1 Create Customer type in `lib/types.ts`

```typescript
export interface Customer {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  businessId?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;

  // Credit tracking
  creditLimit: number;
  creditScore: number; // 0-100
  creditStatus: "approved" | "pending" | "rejected" | "suspended";

  // Activity tracking
  totalPurchases: number;
  outstandingBalance: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
```

### 1.2 Create CreditConfig type in `lib/types.ts`

```typescript
export interface CreditConfig {
  businessId: string;
  interestRate: number; // percentage
  lateFeeType: "fixed" | "percentage";
  lateFeeAmount: number;
  daysDueBeforeOverdue: number; // default 30
  autoApprovalLimit: number;
  requireApprovalAboveLimit: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 1.3 Create InstallmentSchedule type in `lib/types.ts`

```typescript
export interface InstallmentSchedule {
  id?: string;
  _id?: string;
  saleId: string;
  customerId: string;
  businessId?: string;

  // Schedule configuration
  scheduleType: "fixed_months" | "custom" | "flexible";
  fixedMonths?: number; // 3, 6, 12
  customDates?: Array<{
    dueDate: string;
    amount: number;
  }>;

  // Amounts tracking
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;

  // Status
  status: "active" | "completed" | "overdue" | "defaulted";
  createdAt: string;
  startDate: string;
  expectedCompletionDate: string;
  completedAt?: string;
}
```

### 1.4 Create Payment type in `lib/types.ts`

```typescript
export interface Payment {
  id?: string;
  _id?: string;
  installmentId: string;
  saleId: string;
  customerId: string;
  businessId?: string;

  // Payment details
  paymentAmount: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: "cash" | "card" | "transfer" | "cheque" | "other";
  txnId?: string;

  // Status
  paymentStatus: "pending" | "paid" | "overdue" | "partial";
  daysOverdue: number; // 0 if not overdue

  // Additional
  notes?: string;
  createdAt: string;
  createdBy?: string;
}
```

### 1.5 Create CreditApproval type in `lib/types.ts`

```typescript
export interface CreditApproval {
  id?: string;
  _id?: string;
  saleId: string;
  customerId: string;
  businessId?: string;

  // Request details
  requestedAmount: number;
  requestedLimit: number;

  // Approval workflow
  approvalStatus: "pending" | "approved" | "rejected" | "manual_review";
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}
```

### 1.6 Extend Sale type in `lib/types.ts`

Add these fields to existing Sale interface:

```typescript
// Credit sale fields
isCreditSale: boolean; // default: false
customerId?: string; // reference to Customer when credit sale
paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' | 'defaulted';
paidAmount: number; // for partial payment tracking
dueDate?: string;
installmentCount?: number;

// Keep existing fields for backward compatibility
customerName?: string; // still available for non-credit sales
```

---

## **Phase 2: Customer Module**

_Depends on Phase 1; independent of other phases_

### 2.1 Add Customer CRUD to DataContext in `context/DataContext.tsx`

```typescript
const [customers, setCustomers] = useState<Customer[]>([]);

const addCustomer = useCallback(
  async (customer: Customer) => {
    // Validate unique email per business
    const existingCustomer = customers.find(
      (c) => c.email === customer.email && c.businessId === user?.businessId,
    );
    if (existingCustomer) {
      throw new Error("Customer with this email already exists");
    }

    const customerWithBusinessId = {
      ...customer,
      businessId: customer.businessId || user?.businessId,
      id: customer.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      createdBy: user?.id || user?._id || "system",
      outstandingBalance: 0,
      totalPurchases: 0,
    };

    storage.addCustomer(customerWithBusinessId);
    setCustomers([...customers, customerWithBusinessId]);

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "POST",
          "/customers",
          customerWithBusinessId,
          user.token,
        );
        refetchCustomers?.();
      } catch (error) {
        console.warn("Failed to sync customer:", error);
      }
    }
  },
  [customers, isOnline, user?.token, user?.businessId, user?.id, user?._id],
);

const updateCustomer = useCallback(
  async (id: string, updates: Partial<Customer>) => {
    storage.updateCustomer(id, updates);
    setCustomers(
      customers.map((c) =>
        c.id === id || c._id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c,
      ),
    );

    if (isOnline && user?.token) {
      try {
        await apiRequest("PUT", `/customers/${id}`, updates, user.token);
        queryClient.invalidateQueries({
          queryKey: ["customers", user?.businessId],
        });
      } catch (error) {
        console.warn("Failed to update customer:", error);
      }
    }
  },
  [customers, isOnline, user?.token],
);

const deleteCustomer = useCallback(
  async (id: string) => {
    // Soft delete - mark as inactive rather than removing
    await updateCustomer(id, { creditStatus: "suspended" });
  },
  [updateCustomer],
);

const getCustomerById = useCallback(
  (id: string) => customers.find((c) => c.id === id || c._id === id),
  [customers],
);

const getCustomerCreditHistory = useCallback(
  (customerId: string) => {
    const customerSales = sales.filter((s) => s.customerId === customerId);
    const customerPayments =
      payments?.filter((p) => p.customerId === customerId) || [];
    return { sales: customerSales, payments: customerPayments };
  },
  [sales, payments],
);

const checkCreditEligibility = useCallback(
  (customerId: string, requestedAmount: number) => {
    const customer = getCustomerById(customerId);
    if (!customer) return { eligible: false, requiresApproval: true };

    const availableCredit = customer.creditLimit - customer.outstandingBalance;
    const eligible = requestedAmount <= availableCredit;
    const requiresApproval = requestedAmount > creditConfig?.autoApprovalLimit;

    return { eligible, requiresApproval, availableCredit };
  },
  [getCustomerById, creditConfig],
);
```

### 2.2 Create CustomerContext in `context/CustomerContext.tsx`

- Similar pattern to DataContext but focused on customer operations
- Provides: `customers`, `addCustomer`, `updateCustomer`, `deleteCustomer`, `getCustomerCreditHistory`, `checkCreditEligibility`

### 2.3 Add storage layer in `lib/storage.ts`

```typescript
// Customer storage
addCustomer(customer: Customer) {
  const state = this.getState();
  const customers = state.customers || [];
  state.customers = [...customers, customer];
  this.saveState(state);
}

updateCustomer(id: string, updates: Partial<Customer>) {
  const state = this.getState();
  state.customers = (state.customers || []).map(c =>
    c.id === id || c._id === id ? { ...c, ...updates } : c
  );
  this.saveState(state);
}

deleteCustomer(id: string) {
  const state = this.getState();
  state.customers = (state.customers || []).filter(
    c => c.id !== id && c._id !== id
  );
  this.saveState(state);
}

getCustomerState() {
  return this.getState().customers || [];
}
```

### 2.4 Create Customer management UI - `components/customers/CustomerForm.tsx`

- Form fields: name, email, phone, address, credit limit, credit status
- Validation: email unique per business
- Submit: Creates or updates customer

### 2.5 Create Customer list page - `app/dashboard/customers/page.tsx`

- Display all customers with:
  - Name, Email, Phone
  - Credit Limit, Outstanding Balance
  - Credit Status, Total Purchases
- Actions: Edit credit limit, Edit status, View history, Delete
- Search and filter capabilities

---

## **Phase 3: Credit Sales Core**

_Depends on Phases 1 & 2; independent of installment details initially_

### 3.1 Modify SalesForm in `components/sales/SalesForm.tsx`

Add to form:

```typescript
const [isCreditSale, setIsCreditSale] = useState(false);
const [selectedCustomerId, setSelectedCustomerId] = useState("");
const [dueDate, setDueDate] = useState(
  new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
);

// When isCreditSale toggle changes:
// - Show customer dropdown selector (from customers list)
// - Show dueDate field (pre-filled to 30 days from today)
// - Hide paymentType and txnId fields

// Form submission:
if (isCreditSale) {
  // Validate customer selected
  if (!selectedCustomerId) {
    notifyError("Customer required for credit sales");
    return;
  }
  saleData.isCreditSale = true;
  saleData.customerId = selectedCustomerId;
  saleData.dueDate = dueDate;
  saleData.paymentStatus = "pending";
} else {
  // Existing cash flow
  saleData.isCreditSale = false;
  saleData.customerName = customerName;
  saleData.paymentType = paymentType;
  saleData.txnId = txnId;
}
```

### 3.2 Extend addSale() in `context/DataContext.tsx`

```typescript
const addSale = useCallback(
  async (sale: Sale) => {
    const saleWithBusinessId = {
      ...sale,
      businessId: sale.businessId || user?.businessId,
    };

    // Handle credit sale approval
    if (saleWithBusinessId.isCreditSale && saleWithBusinessId.customerId) {
      const eligibility = checkCreditEligibility(
        saleWithBusinessId.customerId,
        saleWithBusinessId.totalAmount,
      );

      if (!eligibility.eligible) {
        throw new Error(
          `Credit limit exceeded. Available: ${eligibility.availableCredit}`,
        );
      }

      // Create approval request if above auto-approval limit
      if (eligibility.requiresApproval) {
        const approval = await createCreditApproval({
          saleId: saleWithBusinessId.id || "",
          customerId: saleWithBusinessId.customerId,
          requestedAmount: saleWithBusinessId.totalAmount,
          requestedLimit: 0,
          approvalStatus: "pending",
          requestedAt: new Date().toISOString(),
          businessId: user?.businessId,
        });

        // Don't complete sale yet - wait for approval
        setCreditApprovals([...creditApprovals, approval]);
        return; // Stop here, sale not completed until approved
      }
    }

    // ... rest of existing addSale logic
    // Continue with stock movements and storage as normal
  },
  [customers, creditConfig, isOnline, user?.token, user?.businessId],
);
```

### 3.3 Add CreditApproval workflow in `context/DataContext.tsx`

```typescript
const createCreditApproval = useCallback(
  async (approval: CreditApproval) => {
    const approvalWithBusinessId = {
      ...approval,
      businessId: approval.businessId || user?.businessId,
      id: approval.id || Math.random().toString(36).substr(2, 9),
      requestedAt: new Date().toISOString(),
    };

    storage.addCreditApproval(approvalWithBusinessId);
    setCreditApprovals([...creditApprovals, approvalWithBusinessId]);

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "POST",
          "/credit/approval",
          approvalWithBusinessId,
          user.token,
        );
      } catch (error) {
        console.warn("Failed to create approval:", error);
      }
    }

    return approvalWithBusinessId;
  },
  [creditApprovals, isOnline, user?.token, user?.businessId],
);

const approveCreditApproval = useCallback(
  async (approvalId: string) => {
    const approval = creditApprovals.find(
      (a) => a.id === approvalId || a._id === approvalId,
    );
    if (!approval) throw new Error("Approval not found");

    // Complete the pending sale
    const pendingSale = sales.find(
      (s) => s.id === approval.saleId || s._id === approval.saleId,
    );
    if (pendingSale) {
      // Create installment schedule immediately
      const schedule = await addInstallmentSchedule({
        saleId: approval.saleId,
        customerId: approval.customerId,
        totalAmount: approval.requestedAmount,
        scheduleType: "fixed_months",
        fixedMonths: 3, // default, can be overridden
      });

      // Update customer outstanding balance
      const customer = getCustomerById(approval.customerId);
      if (customer) {
        await updateCustomer(approval.customerId, {
          outstandingBalance:
            customer.outstandingBalance + approval.requestedAmount,
        });
      }
    }

    // Mark approval as approved
    storage.updateCreditApproval(approvalId, {
      approvalStatus: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: user?.id || user?._id,
    });

    setCreditApprovals(
      creditApprovals.map((a) =>
        a.id === approvalId || a._id === approvalId
          ? {
              ...a,
              approvalStatus: "approved",
              approvedAt: new Date().toISOString(),
              approvedBy: user?.id || user?._id,
            }
          : a,
      ),
    );

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "PUT",
          `/credit/approval/${approvalId}/approve`,
          {},
          user.token,
        );
      } catch (error) {
        console.warn("Failed to approve:", error);
      }
    }
  },
  [creditApprovals, sales, isOnline, user?.token, user?.id, user?._id],
);

const rejectCreditApproval = useCallback(
  async (approvalId: string, reason: string) => {
    storage.updateCreditApproval(approvalId, {
      approvalStatus: "rejected",
      rejectionReason: reason,
    });

    setCreditApprovals(
      creditApprovals.map((a) =>
        a.id === approvalId || a._id === approvalId
          ? { ...a, approvalStatus: "rejected", rejectionReason: reason }
          : a,
      ),
    );

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "PUT",
          `/credit/approval/${approvalId}/reject`,
          { reason },
          user.token,
        );
      } catch (error) {
        console.warn("Failed to reject:", error);
      }
    }
  },
  [creditApprovals, isOnline, user?.token],
);
```

### 3.4 Extend updateSale() in `context/DataContext.tsx`

```typescript
// Add validation:
if (saleWithBusinessId.isCreditSale) {
  // Don't allow changing payment status directly (only payments update this)
  if (sale.paymentStatus) {
    throw new Error("Cannot manually change payment status on credit sale");
  }

  // Allow: isCreditSale, customerId, dueDate, installmentCount
  // Disallow: paymentStatus (read-only)

  // If installmentCount changes: regenerate schedule
  if (
    sale.installmentCount &&
    sale.installmentCount !== originalSale.installmentCount
  ) {
    // Will implement in Phase 4
  }
}
```

### 3.5 Track payment status helper in `context/DataContext.tsx`

```typescript
const updatePaymentStatus = useCallback(
  (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId || s._id === saleId);
    if (!sale || !sale.isCreditSale) return;

    const salePayments = payments?.filter((p) => p.saleId === saleId) || [];
    const schedule = installmentSchedules?.find(
      (s) => s.saleId === saleId || s._id === saleId,
    );

    if (!schedule) return;

    let newStatus: "pending" | "partial" | "paid" | "overdue" | "defaulted" =
      "pending";

    if (schedule.paidAmount === 0) {
      newStatus = "pending";
    } else if (schedule.paidAmount < schedule.totalAmount) {
      newStatus = "partial";
    } else {
      newStatus = "paid";
    }

    // Check if overdue
    const hasOverduePayment = salePayments.some((p) => p.daysOverdue > 0);
    if (hasOverduePayment) {
      newStatus = "overdue";
    }

    // Update sale
    setSales(
      sales.map((s) =>
        s.id === saleId || s._id === saleId
          ? { ...s, paymentStatus: newStatus }
          : s,
      ),
    );
  },
  [sales, payments, installmentSchedules],
);
```

---

## **Phase 4: Installment Engine**

_Depends on Phases 1, 2, 3; can start parallel to Phase 3_

### 4.1 Create Installment Schedule generation helper - `lib/installmentHelpers.ts`

```typescript
export const generateFixedSchedule = (
  totalAmount: number,
  months: number,
  startDate: Date,
): Array<{ dueDate: string; amount: number }> => {
  const schedule = [];
  const amountPerMonth = totalAmount / months;

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      dueDate: dueDate.toISOString().split("T")[0],
      amount:
        i === months
          ? totalAmount - amountPerMonth * (months - 1)
          : amountPerMonth,
    });
  }

  return schedule;
};

export const generateCustomSchedule = (
  totalAmount: number,
  customDates: Array<{ date: string; amount: number }>,
): Array<{ dueDate: string; amount: number }> => {
  // Validate total matches
  const customTotal = customDates.reduce((sum, d) => sum + d.amount, 0);
  if (Math.abs(customTotal - totalAmount) > 0.01) {
    throw new Error(
      `Custom schedule total (${customTotal}) does not match sale amount (${totalAmount})`,
    );
  }

  return customDates.map((d) => ({
    dueDate: d.date,
    amount: d.amount,
  }));
};

export const calculateDueAmount = (
  schedule: InstallmentSchedule,
  asOfDate: Date = new Date(),
): { due: number; overdue: number; pending: number } => {
  let dueAmount = 0;
  let overdueAmount = 0;
  let pendingAmount = 0;

  // Iterate through each payment in schedule
  // For each: if dueDate < asOfDate and not paid: add to overdue
  // If dueDate <= asOfDate and not paid: add to due
  // If dueDate > asOfDate: add to pending

  return { due: dueAmount, overdue: overdueAmount, pending: pendingAmount };
};
```

### 4.2 Add to DataContext in `context/DataContext.tsx`

```typescript
const [installmentSchedules, setInstallmentSchedules] = useState<
  InstallmentSchedule[]
>([]);
const [payments, setPayments] = useState<Payment[]>([]);

const addInstallmentSchedule = useCallback(
  async (schedule: Partial<InstallmentSchedule>) => {
    // Generate schedule based on type
    let scheduleItems: Array<{ dueDate: string; amount: number }> = [];

    if (schedule.scheduleType === "fixed_months" && schedule.fixedMonths) {
      scheduleItems = generateFixedSchedule(
        schedule.totalAmount!,
        schedule.fixedMonths,
        new Date(schedule.startDate!),
      );
    } else if (schedule.scheduleType === "custom" && schedule.customDates) {
      scheduleItems = generateCustomSchedule(
        schedule.totalAmount!,
        schedule.customDates,
      );
    }

    const scheduleWithDefaults: InstallmentSchedule = {
      ...schedule,
      id: schedule.id || Math.random().toString(36).substr(2, 9),
      businessId: schedule.businessId || user?.businessId,
      customDates: scheduleItems,
      paidAmount: 0,
      remainingAmount: schedule.totalAmount!,
      status: "active",
      createdAt: new Date().toISOString(),
      startDate: schedule.startDate!,
      expectedCompletionDate:
        scheduleItems[scheduleItems.length - 1]?.dueDate || "",
    } as InstallmentSchedule;

    storage.addInstallmentSchedule(scheduleWithDefaults);
    setInstallmentSchedules([...installmentSchedules, scheduleWithDefaults]);

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "POST",
          `/installments`,
          scheduleWithDefaults,
          user.token,
        );
      } catch (error) {
        console.warn("Failed to sync schedule:", error);
      }
    }

    return scheduleWithDefaults;
  },
  [installmentSchedules, isOnline, user?.token, user?.businessId],
);

const getInstallmentSchedule = useCallback(
  (saleId: string) =>
    installmentSchedules.find((s) => s.saleId === saleId || s._id === saleId),
  [installmentSchedules],
);

const recordPayment = useCallback(
  async (installmentId: string, payment: Partial<Payment>) => {
    const schedule = installmentSchedules.find(
      (s) => s.id === installmentId || s._id === installmentId,
    );
    if (!schedule) throw new Error("Schedule not found");

    // Validate payment amount
    if (payment.paymentAmount! > schedule.remainingAmount) {
      throw new Error(
        `Payment (${payment.paymentAmount}) exceeds remaining balance (${schedule.remainingAmount})`,
      );
    }

    const paymentWithDefaults: Payment = {
      ...payment,
      id: payment.id || Math.random().toString(36).substr(2, 9),
      installmentId,
      saleId: schedule.saleId,
      customerId: schedule.customerId,
      businessId: schedule.businessId || user?.businessId,
      paymentStatus: "paid",
      daysOverdue: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || user?._id,
    } as Payment;

    // Update installment schedule
    const newPaidAmount = schedule.paidAmount + payment.paymentAmount!;
    const newRemainingAmount = schedule.totalAmount - newPaidAmount;
    const newStatus = newRemainingAmount === 0 ? "completed" : schedule.status;

    const updatedSchedule: InstallmentSchedule = {
      ...schedule,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
    };

    storage.updateInstallmentSchedule(installmentId, updatedSchedule);
    setInstallmentSchedules(
      installmentSchedules.map((s) =>
        s.id === installmentId || s._id === installmentId ? updatedSchedule : s,
      ),
    );

    // Record payment
    storage.addPayment(paymentWithDefaults);
    setPayments([...payments, paymentWithDefaults]);

    // Update customer outstanding balance
    const customer = getCustomerById(schedule.customerId);
    if (customer) {
      await updateCustomer(schedule.customerId, {
        outstandingBalance: Math.max(
          0,
          customer.outstandingBalance - payment.paymentAmount!,
        ),
      });
    }

    // Recalculate sale payment status
    updatePaymentStatus(schedule.saleId);

    // Sync to API
    if (isOnline && user?.token) {
      try {
        await apiRequest("POST", `/payments`, paymentWithDefaults, user.token);
        queryClient.invalidateQueries({
          queryKey: ["payments", user?.businessId],
        });
      } catch (error) {
        console.warn("Failed to sync payment:", error);
      }
    }

    return paymentWithDefaults;
  },
  [
    installmentSchedules,
    payments,
    isOnline,
    user?.token,
    user?.businessId,
    user?.id,
    user?._id,
    getCustomerById,
    updateCustomer,
    updatePaymentStatus,
  ],
);
```

### 4.3 Add to storage layer in `lib/storage.ts`

```typescript
// Installment schedule storage
addInstallmentSchedule(schedule: InstallmentSchedule) {
  const state = this.getState();
  const schedules = state.installmentSchedules || [];
  state.installmentSchedules = [...schedules, schedule];
  this.saveState(state);
}

updateInstallmentSchedule(id: string, schedule: InstallmentSchedule) {
  const state = this.getState();
  state.installmentSchedules = (state.installmentSchedules || []).map(s =>
    s.id === id || s._id === id ? schedule : s
  );
  this.saveState(state);
}

getInstallmentSchedule(saleId: string) {
  const state = this.getState();
  return (state.installmentSchedules || []).find(s => s.saleId === saleId);
}

// Payment storage
addPayment(payment: Payment) {
  const state = this.getState();
  const payments = state.payments || [];
  state.payments = [...payments, payment];
  this.saveState(state);
}

getPaymentsBySaleId(saleId: string) {
  const state = this.getState();
  return (state.payments || []).filter(p => p.saleId === saleId);
}

getPaymentsByCustomerId(customerId: string) {
  const state = this.getState();
  return (state.payments || []).filter(p => p.customerId === customerId);
}
```

---

## **Phase 5: UI/UX - Forms & Payment Tracking**

_Depends on Phases 1-4_

### 5.1 Create Payment Recording UI - `components/sales/PaymentForm.tsx`

- Form to record individual payments
- Fields: Sale/Customer selector, Amount, Payment Date, Payment Method, Transaction ID, Notes
- Auto-show: Remaining balance, Next due date
- Submit button calls `recordPayment()`

### 5.2 Create Installment Schedule View - `components/sales/InstallmentScheduleView.tsx`

- Display all installments in schedule
- Table: Due Date | Scheduled Amount | Paid Amount | Status | Paid Date
- Summary row: Total | Paid | Remaining | Overdue
- Color coding: Green (paid), Yellow (pending), Red (overdue)
- Action button: "Record Payment" opens PaymentForm

### 5.3 Extend Sales Table - `components/sales/SalesTable.tsx`

- Add columns:
  - `Is Credit?` (Yes/No badge)
  - `Customer` (name from Customer record for credit sales)
  - `Payment Status` (pending/partial/paid/overdue - colored badges)
  - `Outstanding Balance` (amount remaining)
- Add filters: "Credit Sales Only", "Overdue Only"
- Row actions: "View Installments" button (opens InstallmentScheduleView in dialog)

### 5.4 Create Credit Sales Dashboard - `app/dashboard/sales/credit-sales.tsx`

- Summary cards (big numbers):
  - Total Outstanding Balance
  - Total Overdue Amount
  - Pending Credit Approvals (count)
  - At Risk (customers with >60 days overdue)
- List of all credit sales:
  - Columns: Sale# | Customer | Date | Amount | Paid | Remaining | Status | Next Due
  - Filter by: Status, Customer, Date range
  - Action: View Details → see full schedule

### 5.5 Create Payment History view - `components/sales/PaymentHistoryTable.tsx`

- Timeline view of all payments for a sale or customer
- Columns: Date | Amount | Method | Status (paid/pending) | TxnId | Notes
- Shows which installments have been paid
- Sortable by date

---

## **Phase 6: Reporting & Analytics**

_Depends on Phases 1-5_

### 6.1 Outstanding Balance Aging Report - `components/reports/OutstandingBalanceReport.tsx`

Display table:
| Customer | Total Outstanding | 0-30 Days | 31-60 Days | 61-90 Days | 90+ Days |
|----------|------------------|-----------|-----------|-----------|----------|
| (rows for each customer) | | | | | |
| **TOTAL** | **$X** | **$X** | **$X** | **$X** | **$X** |

Features:

- Sortable columns
- Filterable by customer
- Export to CSV
- Date range picker

### 6.2 Credit Scorecard - `components/reports/CreditScorecard.tsx`

Summary metrics:

- Total credit sales count
- Total outstanding amount
- Collection rate (% of sales fully paid)
- Overdue rate (% of outstanding that's >30 days)

Customer table:
| Customer | Credit Limit | Used | Available | On-Time % | Default Risk |
|----------|-------------|------|-----------|-----------|--------------|
| (rows) | | | | | |

Calculation logic:

- On-Time %: (# on-time payments) / (# total payments) × 100
- Default Risk: Qualitative based on daysOverdue (Low/Medium/High)

Trend chart:

- Line graph: Outstanding balance over last 6 months

### 6.3 Credit Analytics page - `app/dashboard/reports/credit-analytics.tsx`

Tabs:

1. **Outstanding Balance Aging** - Aging Report
2. **Credit Scorecard** - Summary metrics + customer table + trend chart
3. **Customer Credit Profiles** - Detailed view per customer with payment history

Date filters, customer filters, export buttons on all

### 6.4 Add dashboard widgets - `app/dashboard/page.tsx`

Add to overview page:

- Card 1: "Credit Outstanding" - displays total outstanding amount + link to aging report
- Card 2: "Overdue Payments" - displays count of overdue + link to list
- Card 3: "Pending Credit Approvals" - count + quick approve/reject actions

---

## **Phase 7: Automation - Reminders, Interest, Overdue Handling**

_Depends on Phases 1-6; includes backend automation_

### 7.1 Interest/Penalty calculation - `lib/creditHelpers.ts`

```typescript
export const calculateLateFee = (
  dueDate: Date,
  asOfDate: Date,
  feeConfig: { type: "fixed" | "percentage"; amount: number },
): number => {
  const daysOverdue = Math.floor(
    (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysOverdue <= 0) return 0;

  if (feeConfig.type === "fixed") {
    return feeConfig.amount;
  } else {
    // Percentage-based: calculate on original amount
    return feeConfig.amount;
  }
};

export const applyInterestRate = (
  principal: number,
  interestRate: number,
  daysOverdue: number,
): number => {
  // Simple interest: (Principal × Rate × Time) / 100
  // Time in years: daysOverdue / 365
  return (principal * interestRate * (daysOverdue / 365)) / 100;
};
```

### 7.2 Automated daily checks (Backend scheduler)

Pseudo-code for scheduled job (runs daily):

```
function updateOverdueStatus() {
  for each installmentSchedule where status !== 'completed':
    for each payment in schedule where dueDate < today and paymentStatus !== 'paid':
      set payment.daysOverdue = today - payment.dueDate
      if daysOverdue > creditConfig.daysDueBeforeOverdue:
        set payment.paymentStatus = 'overdue'
        trigger reminder notification
        update parent sale.paymentStatus = 'overdue'
}
```

### 7.3 Create Reminder System - `components/notifications/CreditReminderNotification.tsx`

Automated triggers:

- **7 days before due**: "Payment due in 1 week"
- **On due date**: "Payment due today"
- **1 day overdue**: "Payment is 1 day overdue"
- **7 days overdue**: "Payment is 7 days overdue - please remit immediately"
- **14 days overdue**: "Account is in arrears - contact required"
- **30+ days overdue**: "Account severely overdue - collections action may apply"

Notification flow:

- Create in Notification context (in-app toast)
- Optional: Add SMS/email integration points
- Store reminder history in notifications table

### 7.4 Overdue Payment Workflow - `context/DataContext.tsx`

```typescript
const markPaymentOverdue = useCallback(
  async (paymentId: string) => {
    const payment = payments.find(
      (p) => p.id === paymentId || p._id === paymentId,
    );
    if (!payment) return;

    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(payment.dueDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    storage.updatePayment(paymentId, {
      paymentStatus: "overdue",
      daysOverdue,
    });

    setPayments(
      payments.map((p) =>
        p.id === paymentId || p._id === paymentId
          ? { ...p, paymentStatus: "overdue", daysOverdue }
          : p,
      ),
    );

    updatePaymentStatus(payment.saleId);
  },
  [payments],
);

const applyLateFee = useCallback(
  async (paymentId: string) => {
    const payment = payments.find(
      (p) => p.id === paymentId || p._id === paymentId,
    );
    if (!payment) return;

    const lateFee = calculateLateFee(new Date(payment.dueDate), new Date(), {
      type: creditConfig?.lateFeeType || "fixed",
      amount: creditConfig?.lateFeeAmount || 0,
    });

    if (lateFee > 0) {
      // Add fee to remaining amount on schedule
      const schedule = getInstallmentSchedule(payment.saleId);
      if (schedule) {
        const updatedSchedule = {
          ...schedule,
          totalAmount: schedule.totalAmount + lateFee,
          remainingAmount: schedule.remainingAmount + lateFee,
        };

        storage.updateInstallmentSchedule(schedule.id!, updatedSchedule);
        setInstallmentSchedules(
          installmentSchedules.map((s) =>
            s.id === schedule.id ? updatedSchedule : s,
          ),
        );
      }
    }
  },
  [payments, creditConfig, getInstallmentSchedule, installmentSchedules],
);

const suspendCreditForCustomer = useCallback(
  async (customerId: string) => {
    // Prevent new credit sales for this customer
    await updateCustomer(customerId, { creditStatus: "suspended" });

    // Notify admins
    notifyError(
      "Customer Suspended",
      `${getCustomerById(customerId)?.name} - Credit suspended due to overdue payments`,
    );
  },
  [updateCustomer, getCustomerById],
);
```

### 7.5 CreditConfig management UI - `components/settings/CreditSettings.tsx`

Form fields:

- Interest Rate (%) - with help text on interest calculation
- Late Fee Type - dropdown: Fixed Amount / Percentage
- Late Fee Amount - input field
- Days Before Overdue - input (default 30)
- Auto-Approval Limit - amount threshold above which manual approval required
- Checkbox: "Require Approval Above Limit"

Submit: Saves to CreditConfig in DataContext

### 7.6 Integration in DataContext - `context/DataContext.tsx`

```typescript
const [creditConfig, setCreditConfig] = useState<CreditConfig>({
  businessId: user?.businessId || "",
  interestRate: 5,
  lateFeeType: "fixed",
  lateFeeAmount: 50,
  daysDueBeforeOverdue: 30,
  autoApprovalLimit: 10000,
  requireApprovalAboveLimit: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const updateCreditConfig = useCallback(
  async (config: Partial<CreditConfig>) => {
    const updatedConfig = { ...creditConfig, ...config };
    storage.saveCreditConfig(updatedConfig);
    setCreditConfig(updatedConfig);

    if (isOnline && user?.token) {
      try {
        await apiRequest(
          "PUT",
          "/business/credit-config",
          updatedConfig,
          user.token,
        );
      } catch (error) {
        console.warn("Failed to update credit config:", error);
      }
    }
  },
  [creditConfig, isOnline, user?.token],
);
```

---

## **Data Model Summary**

### Customer

- Tracks basic profile + contact info
- Manages credit limit and credit status
- Tracks total purchases and outstanding balance

### CreditConfig

- Per-business settings
- Interest/penalty configuration
- Auto-approval thresholds

### Sale (Extended)

- Adds credit-specific fields
- Links to Customer (for credit sales)
- Tracks payment status

### InstallmentSchedule

- Defines payment schedule (fixed or custom)
- Tracks paid amount and status
- Links sale to customer and installments

### Payment

- Records individual installment/payment
- Tracks overdue status
- Links to schedule and sale

### CreditApproval

- Manages approval workflow
- Tracks approval status and approver

---

## **Key Implementation Principles**

1. **Backward Compatibility**: Non-credit sales continue unchanged
2. **Stock Reservation**: Stock movements created immediately on sale (credit or not)
3. **Customer Relationship**: Credit sales require proper customer record
4. **Approval Workflow**: Can be automatic (under limit) or manual (above limit)
5. **Payment History**: All payments recorded with method and amount
6. **Data Integrity**: Validate payment amounts and schedule consistency
7. **Reporting Ready**: Track all necessary data for credit analytics
8. **Notification Ready**: Integration points for reminders (in-app, SMS, email)

---

## **Verification Checklist**

### Phase 1

- [ ] All new types compile without errors
- [ ] Extended Sale type is backward compatible
- [ ] TypeScript strict mode passes

### Phase 2

- [ ] Can add customer with credit limit
- [ ] Customer email unique per business
- [ ] Customer profile page functional
- [ ] Credit eligibility check works correctly
- [ ] Soft delete preserves history

### Phase 3

- [ ] "Credit Sale" toggle in form works
- [ ] Credit sales create proper records
- [ ] Approval workflow triggered for high amounts
- [ ] Non-credit sales still work
- [ ] Stock movements created regardless

### Phase 4

- [ ] Fixed schedules generate correct dates/amounts
- [ ] Custom schedules validate totals
- [ ] Payment recording updates balances
- [ ] Sale payment status auto-updates
- [ ] Customer balance aggregates correctly

### Phase 5

- [ ] Payment form validates amounts
- [ ] Schedule view displays correctly
- [ ] Sales table filters work
- [ ] Credit dashboard shows accurate data
- [ ] Payment history timeline functional

### Phase 6

- [ ] Aging report groups by days correctly
- [ ] Scorecard calculates on-time % accurately
- [ ] Reports filterable and exportable
- [ ] Dashboard widgets update in real-time

### Phase 7

- [ ] Overdue status auto-set correctly
- [ ] Late fees calculated and applied
- [ ] Reminders triggered at proper intervals
- [ ] CreditConfig changes take effect
- [ ] Customer suspension prevents new credit

---

## **Future Enhancements (Not in Scope)**

- Automated SMS/email notifications (integration point ready)
- Loan amortization with declining interest
- Credit bureau integration
- Collections management workflow
- Automated payment processing (auto-debit)
- Multi-currency support
- Business day adjustments for due dates
- Customer-specific terms override
- Chattel mortgage/lien tracking
- Consolidated customer statements

---

## **Rollout Strategy**

1. **Implement Phase 1**: Minimal risk, prepares foundation
2. **Implement Phase 2**: Independent feature, builds customer base
3. **Implement Phase 3**: Core feature, enables credit sales (manual approvals only initially)
4. **Implement Phase 4**: Installment engine (essential for tracking)
5. **Deploy to Staging**: Test credit sales flow end-to-end
6. **Implement Phase 5**: UI/UX improvements
7. **Implement Phase 6**: Reporting for visibility
8. **Implement Phase 7**: Automation for efficiency
9. **Deploy to Production**: Full credit system operational
10. **Monitor**: Track data quality and user adoption

---

## **Notes for Implementation**

- Use existing DataContext patterns for consistency
- Follow existing storage layer approach
- Match component styling and UI patterns
- Test each phase independently
- Maintain offline capability (credit sales can queue for sync)
- Consider performance with large customer/payment lists
- Plan for API endpoints before implementing UI
