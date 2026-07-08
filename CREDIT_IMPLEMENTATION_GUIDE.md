# Credit Sales Implementation - Integration Guide

## Overview

The credit sales system has been split into two parts:

1. **Backend (Phase 1)** - Complete ✅
   - 5 MongoDB models (Customer, CreditAccount, Payment, CreditApproval, CreditConfig)
   - Full REST API with 14+ endpoints
   - Transaction-safe payment processing
   - Reporting and analytics

2. **Frontend (Phase 2)** - Foundation Ready ✅
   - API service layer (`lib/creditAPI.ts`)
   - Custom React hook (`hooks/useCredit.ts`)
   - Payment form component (`components/payments/PaymentForm.tsx`)

## How to Use

### 1. Using the Credit Hook

In any React component, import and use the `useCredit` hook:

```typescript
import { useCredit } from '@/hooks/useCredit';

export default function MyComponent() {
  const {
    customers,
    payments,
    creditConfig,
    isLoadingCredit,
    fetchCustomers,
    addCustomer,
    recordPayment,
    getAgingReport,
  } = useCredit();

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      {isLoadingCredit ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {customers.map((c) => (
            <li key={c._id}>{c.name} - KES {c.outstandingBalance}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. Payment Form Component

Use the pre-built payment form:

```typescript
import PaymentForm from '@/components/payments/PaymentForm';

export default function PaymentsPage() {
  return (
    <PaymentForm
      onSuccess={() => {
        // Refresh data after payment
        refetchPayments();
      }}
    />
  );
}
```

### 3. Add Credit Toggle to SalesForm

Modify `components/sales/SalesForm.tsx`:

```typescript
import { useCredit } from '@/hooks/useCredit';

export default function SalesForm() {
  const { customers } = useCredit();
  const [isCreditSale, setIsCreditSale] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  return (
    <form>
      {/* Existing fields... */}

      {/* NEW: Credit Sale Toggle */}
      <label>
        <input
          type="checkbox"
          checked={isCreditSale}
          onChange={(e) => {
            setIsCreditSale(e.target.checked);
            if (!e.target.checked) setSelectedCustomerId('');
          }}
        />
        Sell on Credit?
      </label>

      {/* NEW: Customer Selector (when credit enabled) */}
      {isCreditSale && (
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          required
        >
          <option value="">Select Customer...</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} - Available: KES {c.creditLimit - c.outstandingBalance}
            </option>
          ))}
        </select>
      )}

      {/* Submit with credit data */}
      <button
        onClick={() => {
          const sale = {
            ...formData,
            isCreditSale,
            customerId: isCreditSale ? selectedCustomerId : undefined,
            dueDate: isCreditSale ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
          };
          addSale(sale);
        }}
      >
        Create Sale
      </button>
    </form>
  );
}
```

### 4. Create Customers Management Page

Create `app/dashboard/customers/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useCredit } from '@/hooks/useCredit';
import Button from '@/components/ui/button';

export default function CustomersPage() {
  const { customers, fetchCustomers, addCustomer, updateCustomer } = useCredit();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Customer'}
        </Button>
      </div>

      {showForm && (
        <CustomerForm
          onSubmit={addCustomer}
          onCancel={() => setShowForm(false)}
        />
      )}

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-right">Credit Limit</th>
            <th className="border p-2 text-right">Outstanding</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((customer) => (
            <tr key={customer._id} className="border-b hover:bg-gray-50">
              <td className="border p-2">{customer.name}</td>
              <td className="border p-2">{customer.email}</td>
              <td className="border p-2 text-right">
                KES {customer.creditLimit.toLocaleString()}
              </td>
              <td className="border p-2 text-right font-bold">
                KES {customer.outstandingBalance.toLocaleString()}
              </td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    customer.creditStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : customer.creditStatus === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {customer.creditStatus}
                </span>
              </td>
              <td className="border p-2 text-center">
                <button className="text-blue-600 hover:underline mr-2">
                  Edit
                </button>
                <button className="text-gray-600 hover:underline">
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Create Payments Dashboard Page

Create `app/dashboard/payments/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useCredit } from '@/hooks/useCredit';
import PaymentForm from '@/components/payments/PaymentForm';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

export default function PaymentsPage() {
  const { fetchPayments, payments } = useCredit();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Record Payment'}
        </Button>
      </div>

      {showForm && (
        <PaymentForm
          onSuccess={() => {
            setShowForm(false);
            fetchPayments();
          }}
        />
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>

          {payments.length === 0 ? (
            <p className="text-gray-500">No payments recorded yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Customer</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-left">Method</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b">
                    <td className="p-2">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="p-2">Customer {payment.customerId}</td>
                    <td className="p-2 text-right">
                      KES {payment.amount.toLocaleString()}
                    </td>
                    <td className="p-2 capitalize">{payment.paymentMethod}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          payment.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
```

## Key Concepts

### Optimistic Updates

The `useCredit` hook uses optimistic updates for better UX:

```typescript
// 1. Update UI immediately (optimistic)
setCustomers([...customers, newCustomer]);

// 2. Save to localStorage
storage.saveState({ customers: [...customers, newCustomer] });

// 3. Sync to server in background (if online)
// 4. If error, user is notified but data persists locally
```

### Offline Support

- When offline, operations are saved to localStorage
- Toast notification shows "Will sync when online"
- When connection restored, data syncs automatically
- No data loss

### Types

All interfaces are exported from `hooks/useCredit.ts`:

```typescript
import {
  Customer,
  Payment,
  CreditConfig,
  AgingReport,
  CreditMetrics,
} from "@/hooks/useCredit";
```

## API Endpoints Reference

### Customers

- `POST /api/credit/customers` - Create
- `GET /api/credit/customers` - List
- `GET /api/credit/customers/:id` - Get details
- `PUT /api/credit/customers/:id` - Update

### Payments

- `POST /api/credit/payments` - Record payment
- `GET /api/credit/payments` - List payments

### Approvals

- `POST /api/credit/approvals` - Create approval request
- `GET /api/credit/approvals/pending` - List pending
- `PUT /api/credit/approvals/:id/approve` - Approve
- `PUT /api/credit/approvals/:id/reject` - Reject

### Config

- `GET /api/credit/config` - Get business config
- `PUT /api/credit/config` - Update config

### Reports

- `GET /api/credit/reports/aging` - Aging report
- `GET /api/credit/reports/metrics` - Credit metrics

## Common Patterns

### Fetch Data on Mount

```typescript
useEffect(() => {
  fetchCustomers();
  fetchCreditConfig();
}, []);
```

### Handle Errors

```typescript
try {
  await addCustomer(data);
} catch (error) {
  showNotification({
    type: "error",
    message: error.message,
  });
}
```

### Update State After Action

```typescript
const handleSuccess = async () => {
  await recordPayment(data);
  await fetchPayments(); // Refresh list
};
```

## Environment Setup

Make sure your `.env.local` has:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Next Steps

1. Integrate the payment form into your payments page
2. Add credit toggle to SalesForm
3. Create customers management page
4. Add credit metrics dashboard
5. Test end-to-end: Create customer → Create credit sale → Record payment

## Troubleshooting

### "Customer not found" error

- Ensure customer was created first via customers page
- Check that customer is associated with correct business

### "Cannot record payment - sale not found"

- Ensure the sale was created with `isCreditSale: true`
- Verify sale and customer match

### Offline sync not working

- Check localStorage for cached data
- Verify `isOnline` flag from auth context
- Check network tab for API errors

## Support

For issues or questions:

1. Check the error messages in toast notifications
2. Review browser console for detailed errors
3. Verify backend is running and accessible
4. Check that JWT token is valid and not expired
