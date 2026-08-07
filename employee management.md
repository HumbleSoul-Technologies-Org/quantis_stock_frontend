# Employee Management Structure

This document captures the final proposed structure for workforce management, including worker profile, attendance, and payment details for both permanent staff and casual labour.

## 1. Worker Profile

```ts
type WorkerProfile = {
  id: string;
  businessId: string;
  userId?: string;
  fullName: string;
  phone?: string;
  idNumber?: string;
  employmentType: "permanent" | "casual" | "temporary";
  department?: "production" | "warehouse" | "dispatch" | "admin" | "support";
  branchId?: string;
  role?: string;
  status: "active" | "inactive" | "suspended";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

## 2. Worker Attendance

```ts
type WorkerAttendance = {
  id: string;
  workerId: string;
  businessId: string;
  month?: string;
  daysPresent?: number;
  daysAbsent?: number;
  halfDays?: number;
  leaves?: Array<{
    date: string;
    period?: "full" | "half" | "morning" | "afternoon";
    status: "approved" | "pending" | "rejected";
  }>;
  createdAt?: string;
  updatedAt?: string;
};
```

## 3. Worker Payments

```ts
type WorkerPayment = {
  id: string;
  workerId: string;
  businessId: string;

  salary?: {
    gross: number;
    net: number;
    tax: {
      enabled: boolean;
      amount: number;
    };
  };

  wage?: {
    payRate: "daily" | "hourly";
    amount: number;
    period: "after 2 weeks" | "after 7 days";
  };

  salaryAdvances?: Array<{
    date: string;
    amount: number;
    status: "paid" | "partialPayment" | "notPaid";
  }>;

  createdAt?: string;
  updatedAt?: string;
};
```

## 4. Recommended Relationship

Use these as separate entities:

- WorkerProfile: identity and assignment
- WorkerAttendance: attendance and leave tracking
- WorkerPayment: compensation and advances

This keeps the module flexible for both permanent staff and casual labour.

## 5. Final Recommendation

The workforce module should be built as a modular system with:

- a worker profile for identity and assignment
- an attendance structure for work tracking
- a payment structure for salary, wage, and advances

## 6. Final Attendance Structure

### 6.1 Attendance Record

```ts
type AttendanceRecord = {
  id: string;
  workerId: string;
  businessId: string;
  branchId?: string;
  department?: string;
  date: string;
  status: "present" | "absent" | "halfDay" | "leave" | "off";
  note?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### 6.2 Attendance Policy

```ts
type AttendancePolicy = {
  id: string;
  businessId: string;
  branchId?: string;
  department?: string;
  name: string;
  isActive: boolean;

  workSchedule: {
    daysOfWork: number;
    workHours: number;
    workingDays?: string[];
  };

  pay: {
    payPerDay: number;
    halfDayPay: number;
    overtimeRate?: number;
    overtimeEnabled?: boolean;
  };

  publicHolidays: {
    working: boolean;
    paymentMode: "normal" | "double" | "none";
    paymentMultiplier?: number;
  };

  leaves: {
    enabled: boolean;
    maxLeaveDays: number;
    paymentEnabled: boolean;
    paymentRules: Array<{
      reason: "sick" | "injured" | "other";
      paymentAmount: number;
      isPaid: boolean;
    }>;
  };

  weekendRules?: {
    working: boolean;
    paymentMode: "normal" | "double" | "none";
  };

  createdAt?: string;
  updatedAt?: string;
};
```

### 6.3 How the Two Work Together

- The attendance record stores what happened on a specific day.
- The attendance policy tells the system how that day should be interpreted for work, leave, holiday handling, and pay.

This gives the module a simple daily tracking structure while still allowing flexible, configurable rules for different manufacturing setups.

## 7. Payroll Structure

### 7.1 Payroll Policy

```ts
type PayrollPolicy = {
  id: string;
  businessId: string;
  branchId?: string;
  department?: string;
  employmentType: "permanent" | "casual" | "temporary";
  payCycle: "weekly" | "biweekly" | "monthly";
  basicPayMode: "salary" | "daily" | "hourly";
  basicRate?: number;
  overtimeRate?: number;
  allowanceRate?: number;
  deductionsRules?: Array<{
    name: string;
    type: "tax" | "loan" | "advance" | "other";
    amount: number;
  }>;
};
```

### 7.2 Payroll Run

```ts
type PayrollRun = {
  id: string;
  businessId: string;
  branchId?: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "approved" | "paid";
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  createdAt?: string;
  updatedAt?: string;
};
```

### 7.3 Payroll Entry

```ts
type PayrollEntry = {
  id: string;
  runId: string;
  workerId: string;
  businessId: string;
  basePay: number;
  overtimePay: number;
  allowances: number;
  deductions: number;
  advances: number;
  netPay: number;
  status: "draft" | "approved" | "paid";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### 7.4 Payslip

```ts
type Payslip = {
  id: string;
  entryId: string;
  pdfUrl?: string;
  issuedAt?: string;
};
```

## 8. Salary Advance Structure

### 8.1 Salary Advance

```ts
type SalaryAdvance = {
  id: string;
  workerId: string;
  businessId: string;
  branchId?: string;
  amount: number;
  outstandingBalance: number;
  requestedAt: string;
  approvedAt?: string;
  status: "pending" | "approved" | "partial" | "completed" | "rejected";
  repaymentMode:
    | "deductFromNextPayroll"
    | "fixedInstallments"
    | "fullRepayment";
  deductionRule?: {
    percentage?: number;
    fixedAmount?: number;
    maxAmount?: number;
  };
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### 8.2 Advance Deduction

```ts
type AdvanceDeduction = {
  id: string;
  advanceId: string;
  entryId: string;
  amountDeducted: number;
  remainingBalanceAfterDeduction: number;
  deductedAt: string;
};
```

### 8.3 How Payroll and Advances Work Together

- Payroll calculates the worker’s pay for the period.
- Approved salary advances are checked during payroll processing.
- A deduction is made from the worker’s net pay when applicable.
- The advance balance is reduced automatically and recorded in the deduction history.

This creates a simple and auditable payroll flow for both permanent staff and casual labour.

## 9. Asset Register Structure

### 9.1 Asset

```ts
type Asset = {
  id: string;
  businessId: string;
  branchId?: string;
  categoryId: string;
  name: string;
  description?: string;
  code?: string;
  assetType:
    | "property"
    | "equipment"
    | "vehicle"
    | "furniture"
    | "tool"
    | "other";
  acquisitionDate: string;
  acquisitionCost: number;
  currentValue?: number;
  depreciationMethod?: "straightLine" | "reducingBalance" | "none";
  usefulLifeYears?: number;
  status: "inUse" | "stored" | "maintenance" | "disposed" | "lost";
  location?: string;
  custodianId?: string;
  purchaseInvoiceRef?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

### 9.2 Asset Category

```ts
type AssetCategory = {
  id: string;
  name: string;
  type: "property" | "equipment" | "vehicle" | "furniture" | "tool" | "other";
};
```

### 9.3 Asset Valuation

```ts
type AssetValuation = {
  id: string;
  assetId: string;
  recordedAt: string;
  bookValue: number;
  depreciationAmount?: number;
  note?: string;
};
```

### 9.4 Asset Maintenance

```ts
type AssetMaintenance = {
  id: string;
  assetId: string;
  maintenanceDate: string;
  description: string;
  cost: number;
  performedBy?: string;
  status: "scheduled" | "completed" | "pending";
};
```

### 9.5 Asset Transfer

```ts
type AssetTransfer = {
  id: string;
  assetId: string;
  fromLocation?: string;
  toLocation?: string;
  transferredAt: string;
  transferredBy?: string;
  note?: string;
};
```

### 9.6 Asset Disposal

```ts
type AssetDisposal = {
  id: string;
  assetId: string;
  disposalDate: string;
  disposalType: "sold" | "scrapped" | "writtenOff" | "transferred";
  amount?: number;
  note?: string;
};
```

### 9.7 Recommended Sub-features

- asset registration
- asset categories
- location and custodian tracking
- valuation and depreciation
- maintenance history
- transfer tracking
- disposal tracking
- reports by branch, category, or status

This gives the business a practical asset lifecycle model for property, equipment, vehicles, and other owned resources.
