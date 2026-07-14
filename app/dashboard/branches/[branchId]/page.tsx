"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { apiRequest, extractApiErrorMessage } from "@/lib/queryClient";
import { getApiErrorText, parseUserFormError } from "@/lib/errorParsers";
import { useResourceNotifications } from "@/hooks/useResourceNotifications";

interface BranchPageProps {
  params: Promise<{
    branchId: string;
  }>;
}

export default function BranchDetailsPage({ params }: BranchPageProps) {
  const { branchId } = use(params);
  const { user, business } = useAuth();
  const { userCreated } = useResourceNotifications();
  const [branch, setBranch] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [processingUser, setProcessingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "sales" as "admin" | "sales" | "accountant" | "manager",
  });
  const [createUserErrors, setCreateUserErrors] = useState<
    Record<string, string>
  >({});
  const [createUserFormError, setCreateUserFormError] = useState<string | null>(
    null,
  );
  const [salesSearchQuery, setSalesSearchQuery] = useState("");
  const [salesSortOrder, setSalesSortOrder] = useState<"newest" | "oldest">(
    "newest",
  );
  const [salesDateFilter, setSalesDateFilter] = useState("");
  const [showSalesDatePicker, setShowSalesDatePicker] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<
    "all" | "sales" | "losses"
  >("all");
  const [stockTypeFilter, setStockTypeFilter] = useState<
    "all" | "in" | "out" | "adjustment"
  >("all");
  const [stockDateFilter, setStockDateFilter] = useState("");
  const [showStockDatePicker, setShowStockDatePicker] = useState(false);

  const validateCreateUserForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!createUserForm.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!createUserForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!createUserForm.password) {
      newErrors.password = "Password is required";
    } else if (createUserForm.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (createUserForm.password !== createUserForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setCreateUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCreateUserForm()) {
      return;
    }

    try {
      setProcessingUser(true);
      setCreateUserFormError(null);

      const payLoad = {
        username: createUserForm.name,
        email: createUserForm.email,
        password: createUserForm.password,
        role: createUserForm.role,
        branchId: branchId,
        businessId: business?._id || user?.businessId,
      };

      const res = await apiRequest(
        "POST",
        "/users/register",
        payLoad,
        user?.token,
      );
      if (!res.ok) {
        const errorText = extractApiErrorMessage(res);
        throw new Error(errorText);
      }
      const data = await res.json();

      userCreated(createUserForm.name || "User");
      toast.success("User created successfully");

      // Refresh branch data
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5353/api"}/branches/${branchId}`,
        {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : undefined,
        },
      );
      if (refreshResponse.ok) {
        const updatedBranch = await refreshResponse.json();
        setBranch(updatedBranch);
      }

      setShowCreateUserDialog(false);
      setCreateUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "sales",
      });
      setCreateUserErrors({});
      setCreateUserFormError(null);
    } catch (err) {
      const errorText = getApiErrorText(err);
      const parsedErrors = parseUserFormError(errorText);

      if (Object.keys(parsedErrors).length > 0) {
        setCreateUserErrors(parsedErrors);
      }

      setCreateUserFormError(errorText || "Failed to create user");

      toast.error(`Failed to create user: ${errorText}`);
    } finally {
      setProcessingUser(false);
    }
  };

  useEffect(() => {
    async function loadBranch() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5353/api"}/branches/${branchId}`,
          {
            headers: user?.token
              ? { Authorization: `Bearer ${user.token}` }
              : undefined,
          },
        );
        if (!response.ok) {
          throw new Error("Failed to load branch");
        }
        const data = await response.json();
        setBranch(data);

        console.log("Branch details loaded:", data);
      } catch (fetchError) {
        setError("Unable to load branch details.");
      } finally {
        setLoading(false);
      }
    }

    if (branchId) {
      loadBranch();
    }
  }, [branchId, user?.token]);

  const branchUsers = Array.isArray(branch?.users) ? branch.users : [];

  const salesSearchTerm = salesSearchQuery.trim().toLowerCase();
  const stockSearchTerm = stockSearchQuery.trim().toLowerCase();
  const selectedSalesDate = salesDateFilter ? new Date(salesDateFilter) : null;
  const selectedStockDate = stockDateFilter ? new Date(stockDateFilter) : null;

  const isSameDate = (
    dateValue: string | Date | undefined,
    compareDate: Date,
  ) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    return (
      date.getFullYear() === compareDate.getFullYear() &&
      date.getMonth() === compareDate.getMonth() &&
      date.getDate() === compareDate.getDate()
    );
  };

  const filteredSales = useMemo(() => {
    if (!Array.isArray(branch?.sales)) return [];

    return [...branch.sales]
      .filter((sale: any) => {
        const reference = (sale.reference || sale.saleNumber || "")
          .toString()
          .toLowerCase();
        const customer = (sale.customerName || sale.customer?.name || "")
          .toString()
          .toLowerCase();
        const createdByName = (sale.createdBy?.username || "")
          .toString()
          .toLowerCase();
        const productNames = Array.isArray(sale.items)
          ? sale.items
              .map((item: any) =>
                (item?.productId?.name || item?.productName || "")
                  .toString()
                  .toLowerCase(),
              )
              .join(" ")
          : "";

        const matchesSearch =
          !salesSearchTerm ||
          reference.includes(salesSearchTerm) ||
          customer.includes(salesSearchTerm) ||
          createdByName.includes(salesSearchTerm) ||
          productNames.includes(salesSearchTerm);

        const matchesDate =
          !selectedSalesDate ||
          isSameDate(sale.date || sale.createdAt, selectedSalesDate);

        return matchesSearch && matchesDate;
      })
      .sort((a: any, b: any) => {
        const aDate = new Date(a.date || a.createdAt).getTime();
        const bDate = new Date(b.date || b.createdAt).getTime();
        return salesSortOrder === "newest" ? bDate - aDate : aDate - bDate;
      });
  }, [branch?.sales, salesSearchTerm, salesSortOrder, selectedSalesDate]);

  const filteredStockMovements = useMemo(() => {
    if (!Array.isArray(branch?.stockMovements)) return [];

    return branch.stockMovements.filter((movement: any) => {
      const reference = (movement.reference || "").toString().toLowerCase();
      const product = (
        movement.productName ||
        movement.productId?.name ||
        movement.product?.name ||
        ""
      )
        .toString()
        .toLowerCase();
      const reason = (movement.reason || "").toString().toLowerCase();

      const matchesSearch =
        !stockSearchTerm ||
        reference.includes(stockSearchTerm) ||
        product.includes(stockSearchTerm) ||
        reason.includes(stockSearchTerm);

      let matchesCategory = true;
      if (stockCategoryFilter === "sales") {
        matchesCategory = movement.reason === "Sale";
      } else if (stockCategoryFilter === "losses") {
        matchesCategory =
          movement.reason !== "Sale" && movement.reason !== "Stock Transfer";
      }

      const matchesType =
        stockTypeFilter === "all" || movement.type === stockTypeFilter;
      const matchesDate =
        !selectedStockDate || isSameDate(movement.createdAt, selectedStockDate);

      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [
    branch?.stockMovements,
    stockSearchTerm,
    stockCategoryFilter,
    stockTypeFilter,
    selectedStockDate,
  ]);

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Loading branch details...</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
    );
  }

  if (!branch) {
    return <div className="text-sm text-slate-500">Branch not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
          {branch.branchName || "Branch details"}
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Review branch audit data, users, sales, stock movement, and activity.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 bg-gray-100 dark:bg-slate-700 p-2 rounded-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="stock">Stock Movement</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Branch profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Branch name
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.branchName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Branch code
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.branchCode || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Address
                  </p>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                    {branch.address || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Branch sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pb-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
                  <Input
                    value={salesSearchQuery}
                    onChange={(e) => setSalesSearchQuery(e.target.value)}
                    placeholder="Search reference, customer, created by, product"
                    className="w-full"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={
                        salesSortOrder === "newest" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSalesSortOrder("newest")}
                    >
                      Newest
                    </Button>
                    <Button
                      variant={
                        salesSortOrder === "oldest" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSalesSortOrder("oldest")}
                    >
                      Oldest
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSalesDatePicker((value) => !value)}
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Date
                    </Button>
                  </div>
                </div>
                {showSalesDatePicker && (
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <label className="sr-only" htmlFor="salesDateFilter">
                      Sales date filter
                    </label>
                    <Input
                      id="salesDateFilter"
                      type="date"
                      value={salesDateFilter}
                      onChange={(e) => setSalesDateFilter(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSalesDateFilter("")}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </div>
              {Array.isArray(filteredSales) && filteredSales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Reference
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700 dark:text-slate-300">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300 hidden md:table-cell">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filteredSales.map((sale: any, index: number) => (
                        <tr
                          key={sale._id || sale.id || index}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <td className="px-4 py-2 text-gray-900 dark:text-teal-100">
                            {sale.reference || sale.saleNumber || "—"}
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-slate-300">
                            {sale.customerName ||
                              sale.customer?.name ||
                              "Walk-in"}
                          </td>
                          <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-teal-100">
                            {typeof sale.totalAmount === "number"
                              ? new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                }).format(sale.totalAmount)
                              : sale.totalAmount || "—"}
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              {sale.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-slate-400">
                            {sale.date || sale.createdAt
                              ? format(
                                  new Date(sale.date || sale.createdAt),
                                  "MMM d, yyyy",
                                )
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No sales match the current sales filters.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock movement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pb-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] items-end">
                  <Input
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Search reference, product, reason"
                    className="w-full"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={
                        stockCategoryFilter === "all" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setStockCategoryFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={
                        stockCategoryFilter === "sales" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setStockCategoryFilter("sales")}
                    >
                      Sales
                    </Button>
                    <Button
                      variant={
                        stockCategoryFilter === "losses" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setStockCategoryFilter("losses")}
                    >
                      Losses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStockDatePicker((value) => !value)}
                      className="gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Date
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 items-end">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stockTypeFilter">Type</Label>
                    <Select
                      value={stockTypeFilter}
                      onValueChange={(value) =>
                        setStockTypeFilter(
                          value as "all" | "in" | "out" | "adjustment",
                        )
                      }
                    >
                      <SelectTrigger id="stockTypeFilter" className="w-full">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="in">In</SelectItem>
                        <SelectItem value="out">Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showStockDatePicker && (
                    <div className="flex flex-row gap-2 items-center">
                      <Input
                        id="stockDateFilter"
                        type="date"
                        value={stockDateFilter}
                        onChange={(e) => setStockDateFilter(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStockDateFilter("")}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {Array.isArray(filteredStockMovements) &&
              filteredStockMovements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Reference
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Product
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700 dark:text-slate-300">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300 hidden md:table-cell">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300 hidden lg:table-cell">
                          Reason
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filteredStockMovements.map(
                        (movement: any, index: number) => (
                          <tr
                            key={movement._id || movement.id || index}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            <td className="px-4 py-2 text-gray-900 dark:text-teal-100">
                              {movement.reference || "—"}
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-slate-300">
                              {movement.productName ||
                                movement.productId?.name ||
                                movement.product?.name ||
                                "Unknown Product"}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-teal-100">
                              {movement.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-2 hidden md:table-cell">
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                {movement.type || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-2 hidden lg:table-cell text-gray-600 dark:text-slate-400">
                              {movement.reason || "—"}
                            </td>
                            <td className="px-4 py-2 text-gray-600 dark:text-slate-400">
                              {movement.createdAt
                                ? format(
                                    new Date(movement.createdAt),
                                    "MMM d, yyyy",
                                  )
                                : "—"}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No stock movements match the current filters.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Branch users</CardTitle>
              {user?.role === "admin" ||
                (user?.role === "manager" && (
                  <Button
                    onClick={() => setShowCreateUserDialog(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create User
                  </Button>
                ))}
            </CardHeader>
            <CardContent>
              {branchUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-slate-300">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {branchUsers.map((userEntry: any, index: number) => (
                        <tr
                          key={userEntry?.id || userEntry?.email || index}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <td className="px-4 py-2 dark:text-slate-100">
                            {userEntry?.username || userEntry?.name || "—"}
                          </td>
                          <td className="px-4 py-2 dark:text-slate-300">
                            {userEntry?.email || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                              {userEntry?.role || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No users are assigned to this branch yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Branch activity logs and audits will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={showCreateUserDialog}
        onOpenChange={setShowCreateUserDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Add a new user to {branch?.branchName}. The user will be assigned
              to this branch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {createUserFormError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {createUserFormError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="User name"
                value={createUserForm.name}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    name: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.name && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={createUserForm.email}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    email: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={createUserForm.password}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    password: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={createUserForm.confirmPassword}
                onChange={(e) =>
                  setCreateUserForm({
                    ...createUserForm,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={processingUser}
              />
              {createUserErrors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={createUserForm.role}
                onValueChange={(value) =>
                  setCreateUserForm({
                    ...createUserForm,
                    role: value as "admin" | "sales" | "accountant" | "manager",
                  })
                }
                disabled={processingUser}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  {user?.role === "admin" && (
                    <SelectItem value="manager">Manager</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {createUserErrors.role && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {createUserErrors.role}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUserDialog(false)}
                disabled={processingUser}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processingUser}
                className="flex-1"
              >
                {processingUser ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
