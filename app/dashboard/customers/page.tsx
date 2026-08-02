"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  useCredit,
  Customer,
  getCreditSummaryMetrics,
} from "@/hooks/useCredit";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit2,
  Eye,
  ShoppingCartIcon,
  NotebookPen,
  MoreVertical,
  Download,
  Banknote,
  Users,
} from "lucide-react";
import { exportCustomerPaymentHistoryToCSV } from "@/lib/exportUtils";

interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  district?: string;
  creditLimit: string | number;
  creditStatus: "approved" | "pending" | "rejected" | "suspended";
  creditScore: string | number;
}

const defaultCustomerForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  district: "",
  creditLimit: 0,
  creditStatus: "approved",
  creditScore: 0,
};

export default function CustomersPage() {
  const { user, business } = useAuth();
  const { getCurrencySymbol } = useSettings();
  const currencySymbol = getCurrencySymbol();
  const {
    customers,
    payments,
    fetchCustomers,
    isLoadingCredit,
    creditError,
    addCustomer,
    updateCustomer,
    fetchPayments,
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
        district: selectedCustomer.district || "",
        country: selectedCustomer.country || "",
        creditLimit: selectedCustomer.creditLimit || 0,
        creditStatus: selectedCustomer.creditStatus || "approved",
        creditScore: selectedCustomer.creditScore || 0,
      });
    } else {
      setCustomerForm(defaultCustomerForm);
    }
  }, [selectedCustomer]);

  const normalizeId = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number")
      return String(value);
    if (typeof value === "object") {
      const maybe = value as Record<string, unknown>;
      return String(
        maybe._id || maybe.id || maybe.offline_id || maybe.customerId || "",
      );
    }
    return "";
  };

  const selectedCustomerId = normalizeId(
    selectedCustomer?._id ||
      selectedCustomer?.id ||
      selectedCustomer?.offline_id,
  );

  const creditSummary = getCreditSummaryMetrics(customers);

  const paymentHistory = payments.filter((payment) => {
    const paymentCustomerId = normalizeId(
      payment.customerId ||
        (payment as any).customer ||
        (payment as any).customerId ||
        (payment as any).customer?._id ||
        (payment as any).customer?.id ||
        (payment as any).customer?.offline_id,
    );

    return paymentCustomerId === selectedCustomerId;
  });

  const totalPaidOnDebt = paymentHistory.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0,
  );

  useEffect(() => {
    if (selectedCustomer && detailDialogOpen) {
      void fetchPayments({ customerId: selectedCustomerId });
    }
  }, [selectedCustomer, selectedCustomerId, detailDialogOpen, fetchPayments]);

  const handleExportCustomerCSV = () => {
    if (!selectedCustomer) return;

    exportCustomerPaymentHistoryToCSV(selectedCustomer, paymentHistory, {
      filename: `customer-${selectedCustomer.name
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase()}-payments-${format(new Date(), "yyyy-MM-dd")}.csv`,
    });
  };

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

    if (Number(customerForm.creditLimit) < 0) {
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
            creditLimit: Number(customerForm.creditLimit),
            creditScore: Number(customerForm.creditScore),
          });
        }
      } else {
        await addCustomer({
          ...customerForm,
          creditLimit: Number(customerForm.creditLimit),
          creditScore: Number(customerForm.creditScore),
        });
      }

      resetDialog();
    } catch (error) {
      console.error("Error saving customer:", error);
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

        {/* customer profile form dialog */}
        <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="inline-flex items-center gap-2"
              variant="default"
              onClick={openCreateCustomerDialog}
            >
              <Plus className="w-4 h-4" />
              Quick add customer
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
                    type="text"
                    value={customerForm.creditLimit?.toLocaleString()}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        creditLimit: e.target.value || 0,
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
                    type="text"
                    value={customerForm.creditScore}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        creditScore: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="customerAddress">Address (physical)</Label>
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
                    <Label htmlFor="customerDistrict">District</Label>
                    <Input
                      id="customerDistrict"
                      value={customerForm.district}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          district: e.target.value,
                        })
                      }
                    />
                  </div>
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
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={customerForm.country}
                      onChange={(e) =>
                        setCustomerForm({
                          ...customerForm,
                          country: e.target.value,
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Total in credit
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                  Outstanding balance across credit customers
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {currencySymbol}{" "}
              {creditSummary.totalOutstandingBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-200 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                  Customers with outstanding payments
                </p>
                <p className="text-xs text-sky-600/80 dark:text-sky-400/80">
                  Customers still carrying unpaid credit balances
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm dark:bg-slate-900 dark:text-sky-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {creditSummary.outstandingCustomersCount}
            </div>
          </CardContent>
        </Card>
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
                      Total Purchases
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
                        {currencySymbol}{" "}
                        {Number(
                          customer.outstandingBalance ?? 0,
                        ).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-900 dark:text-slate-100">
                        {Number(customer.totalPurchases ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-44 dark:bg-slate-800 dark:border-slate-700"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setDetailDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setSalesDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <ShoppingCartIcon className="mr-2 h-4 w-4" />
                              Create sale
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setPaymentDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <NotebookPen className="mr-2 h-4 w-4" />
                              Record payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditCustomerDialog(customer)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <DialogContent className="!sm:max-w-none max-w-[min(100vw-2rem,90rem)]! w-full dark:bg-slate-900 max-h-[calc(100vh-4rem)] overflow-hidden">
          <DialogHeader className="px-4 pt-4 sm:px-6">
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View profile, outstanding credit, and payment history for the
              selected customer.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="max-h-[calc(100vh-18rem)] overflow-y-auto p-6">
                {selectedCustomer ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                      <div className="rounded-3xl bg-slate-50 p-6 text-center dark:bg-slate-900">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl font-bold dark:text-white text-black">
                          {selectedCustomer.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {selectedCustomer.name}
                        </p>
                        <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          {selectedCustomer.creditStatus || "No status"}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          <p>{selectedCustomer.email}</p>
                          <p>
                            {selectedCustomer.phone || "No phone available"}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Outstanding debt
                            </p>
                            <p className="mt-3 text-2xl font-semibold text-red-600 dark:text-red-400">
                              {currencySymbol}{" "}
                              {Number(
                                selectedCustomer.outstandingBalance ?? 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Paid to date
                            </p>
                            <p className="mt-3 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                              {currencySymbol}{" "}
                              {Number(totalPaidOnDebt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Credit limit
                            </p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                              {currencySymbol}{" "}
                              {Number(
                                selectedCustomer.creditLimit ?? 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Total purchases
                            </p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                              {Number(
                                selectedCustomer.totalPurchases ?? 0,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Contact details
                          </p>
                          <div className="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Email</span>
                              <span>{selectedCustomer.email || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Phone</span>
                              <span>{selectedCustomer.phone || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>City</span>
                              <span>{selectedCustomer.city || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>District</span>
                              <span>{selectedCustomer.district || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Payment History
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Recent payments made against this customer’s credit
                            sales.
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleExportCustomerCSV}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                      </div>

                      {paymentHistory.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                          No payment history available for this customer.
                        </div>
                      ) : (
                        <div className="mt-6 overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              <tr>
                                <th className="px-3 py-3">Date</th>
                                <th className="px-3 py-3 text-right">Amount</th>
                                <th className="px-3 py-3">Method</th>
                                <th className="px-3 py-3">Reference</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentHistory.map((payment) => (
                                <tr
                                  key={
                                    payment._id ||
                                    payment.id ||
                                    `${payment.paymentDate}-${payment.amount}`
                                  }
                                  className="border-b border-slate-200 odd:bg-slate-50 dark:border-slate-700 dark:odd:bg-slate-900"
                                >
                                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                                    {format(
                                      new Date(payment.paymentDate),
                                      "yyyy-MM-dd",
                                    )}
                                  </td>
                                  <td className="px-3 py-3 text-right text-slate-900 dark:text-slate-100">
                                    {currencySymbol}{" "}
                                    {Number(payment.amount).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                                    {payment.paymentMethod}
                                  </td>
                                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                                    {payment.reference || "—"}
                                  </td>
                                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                                    {payment.paymentStatus}
                                  </td>
                                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                                    {payment.notes || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No customer selected
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Quick actions
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSalesDialogOpen(true);
                    setDetailDialogOpen(false);
                  }}
                >
                  Create Sale
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setPaymentDialogOpen(true);
                    setDetailDialogOpen(false);
                  }}
                >
                  Record Payment
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
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
          await useDataContext().addSale(sale);
        }}
      />

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl dark:bg-slate-800 max-h-175 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <PaymentForm
              key={
                selectedCustomer?._id || selectedCustomer?.id || "payment-form"
              }
              initialCustomer={selectedCustomer}
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
