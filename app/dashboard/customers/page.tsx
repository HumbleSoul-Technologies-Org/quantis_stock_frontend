"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCredit, Customer } from "@/hooks/useCredit";
import { useDataContext } from "@/context/DataContext";
import { SalesDialog } from "@/components/sales/SalesDialog";
import PaymentForm from "@/components/payments/PaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2 } from "lucide-react";

interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  creditLimit: number;
  creditStatus: "approved" | "pending" | "rejected" | "suspended";
  creditScore: number;
}

const defaultCustomerForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
  creditLimit: 0,
  creditStatus: "approved",
  creditScore: 0,
};

export default function CustomersPage() {
  const { user, business } = useAuth();
  const {
    customers,
    fetchCustomers,
    isLoadingCredit,
    creditError,
    addCustomer,
    updateCustomer,
  } = useCredit();

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [salesDialogOpen, setSalesDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [customerForm, setCustomerForm] =
    useState<CustomerFormData>(defaultCustomerForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (business && !fetchAttempted) {
      setFetchAttempted(true);
      void fetchCustomers();
    }
  }, [business, fetchCustomers, fetchAttempted]);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerForm({
        name: selectedCustomer.name,
        email: selectedCustomer.email || "",
        phone: selectedCustomer.phone || "",
        address: selectedCustomer.address || "",
        city: selectedCustomer.city || "",
        state: selectedCustomer.state || "",
        zipcode: selectedCustomer.zipcode || "",
        creditLimit: selectedCustomer.creditLimit || 0,
        creditStatus: selectedCustomer.creditStatus || "approved",
        creditScore: selectedCustomer.creditScore || 0,
      });
    } else {
      setCustomerForm(defaultCustomerForm);
    }
  }, [selectedCustomer]);

  const resetDialog = () => {
    setSelectedCustomer(null);
    setCustomerForm(defaultCustomerForm);
    setFormErrors({});
    setCustomerDialogOpen(false);
  };

  const openCreateCustomerDialog = () => {
    setSelectedCustomer(null);
    setCustomerDialogOpen(true);
  };

  const openEditCustomerDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!customerForm.name.trim()) {
      errors.name = "Customer name is required";
    }

    if (!customerForm.email.trim()) {
      errors.email = "Customer email is required";
    }

    if (customerForm.creditLimit < 0) {
      errors.creditLimit = "Credit limit cannot be negative";
    }

    return errors;
  };

  const handleSaveCustomer = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      if (selectedCustomer) {
        const id = selectedCustomer._id || selectedCustomer.id || "";
        if (id) {
          await updateCustomer(id, {
            ...customerForm,
          });
        }
      } else {
        await addCustomer({
          ...customerForm,
        });
      }

      resetDialog();
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
            Customers
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-teal-300 mt-1">
            Manage customer credit profiles and contact details.
          </p>
        </div>
        <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="inline-flex items-center gap-2"
              variant="secondary"
              onClick={openCreateCustomerDialog}
            >
              <Plus className="w-4 h-4" />
              Add customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? "Edit Customer" : "Add Customer"}
              </DialogTitle>
              <DialogDescription>
                {selectedCustomer
                  ? "Update customer credit profile and contact details."
                  : "Create a new customer profile for credit sales and CRM tracking."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        name: e.target.value,
                      })
                    }
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="customerCreditLimit">Credit Limit</Label>
                  <Input
                    id="customerCreditLimit"
                    type="number"
                    min={0}
                    value={customerForm.creditLimit}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        creditLimit: Number(e.target.value),
                      })
                    }
                  />
                  {formErrors.creditLimit && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.creditLimit}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerStatus">Credit Status</Label>
                  <Select
                    value={customerForm.creditStatus}
                    onValueChange={(value) =>
                      setCustomerForm({
                        ...customerForm,
                        creditStatus: value as CustomerFormData["creditStatus"],
                      })
                    }
                  >
                    <SelectTrigger id="customerStatus" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerCreditScore">Credit Score</Label>
                  <Input
                    id="customerCreditScore"
                    type="number"
                    min={0}
                    value={customerForm.creditScore}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        creditScore: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        address: e.target.value,
                      })
                    }
                    className="min-h-24"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="customerCity">City</Label>
                    <Input
                      id="customerCity"
                      value={customerForm.city}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerState">State</Label>
                    <Input
                      id="customerState"
                      value={customerForm.state}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerZipcode">Zip code</Label>
                    <Input
                      id="customerZipcode"
                      value={customerForm.zipcode}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          zipcode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={resetDialog}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCustomer} disabled={isSaving}>
                {isSaving
                  ? selectedCustomer
                    ? "Updating..."
                    : "Saving..."
                  : selectedCustomer
                    ? "Update customer"
                    : "Create customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer list</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCredit && fetchAttempted ? (
            <TableSkeleton />
          ) : creditError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {creditError}
            </p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-slate-400">
              No customers found yet. Add customers to enable credit sales and
              CRM tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Outstanding
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {customers.map((customer) => (
                    <tr
                      key={
                        customer._id ||
                        customer.id ||
                        customer.email ||
                        customer.name
                      }
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {customer.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {customer.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-300">
                        {customer.creditStatus || "unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900 dark:text-slate-100">
                        ₦{customer.outstandingBalance?.toFixed(2) ?? "0.00"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setDetailDialogOpen(true);
                            }}
                          >
                            View
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setSalesDialogOpen(true);
                            }}
                          >
                            Create Sale
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setPaymentDialogOpen(true);
                            }}
                          >
                            Record Payment
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center gap-2"
                            onClick={() => openEditCustomerDialog(customer)}
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedCustomer ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {selectedCustomer.name}
                </h3>
                <p className="text-sm">Email: {selectedCustomer.email}</p>
                <p className="text-sm">
                  Phone: {selectedCustomer.phone || "—"}
                </p>
                <p className="text-sm">
                  Credit Limit: ₦{selectedCustomer.creditLimit}
                </p>
                <p className="text-sm">
                  Outstanding: ₦
                  {selectedCustomer.outstandingBalance?.toFixed(2) ?? "0.00"}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSalesDialogOpen(true);
                      setDetailDialogOpen(false);
                    }}
                  >
                    Create Sale
                  </Button>
                  <Button
                    onClick={() => {
                      setPaymentDialogOpen(true);
                      setDetailDialogOpen(false);
                    }}
                  >
                    Record Payment
                  </Button>
                </div>
              </div>
            ) : (
              <p>No customer selected</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sales Dialog */}
      <SalesDialog
        isOpen={salesDialogOpen}
        products={useDataContext().products}
        currentUserId={user.id || user._id || ""}
        currentUsername={user.username || ""}
        onOpenChange={(open) => setSalesDialogOpen(open)}
        onSubmit={async (sale) => {
          try {
            await useDataContext().addSale(sale);
          } catch (err) {
            // noop
          }
        }}
      />

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <PaymentForm
              initialCustomerId={
                selectedCustomer?._id || selectedCustomer?.id || ""
              }
              onSuccess={() => setPaymentDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
