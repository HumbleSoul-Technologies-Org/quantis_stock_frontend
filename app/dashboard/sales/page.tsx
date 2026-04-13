"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { ClientOnly } from "@/components/client-only";
import { SalesForm } from "@/components/sales/SalesForm";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesReturnDialog } from "@/components/sales/SalesReturnDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

function SalesPageContent() {
  const { products, sales, addSale, deleteSale, processSaleReturn } = useData();
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const { notifyResourceCreated, notifyResourceDeleted, notifySuccess } =
    useNotificationActions();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeSales = Array.isArray(sales) ? sales : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductName, setFilterProductName] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<any>(null);

  const handleAddSale = async (sale: any) => {
    await addSale(sale);
    notifyResourceCreated("Sale", sale.saleNumber);
    notifySuccess(
      "Sale Completed",
      `${sale.saleNumber} recorded for ${formatCurrency(sale.totalAmount)}`,
    );
  };

  const handleDeleteSale = (id: string) => {
    const sale = safeSales.find((s) => s.id === id || s._id === id);
    if (!sale) return;
    deleteSale(id);
    notifyResourceDeleted("Sale", sale.saleNumber || "Unknown");
  };

  const handleReturnSale = (sale: any) => {
    setSelectedSaleForReturn(sale);
    setReturnDialogOpen(true);
  };

  const handleProcessReturn = async (saleReturn: any) => {
    await processSaleReturn(saleReturn);
    notifySuccess(
      "Return Processed",
      `Return ${saleReturn.reference} recorded for ${formatCurrency(saleReturn.totalAmount)}`,
    );
  };

  const userSales =
    user?.role === "sales"
      ? safeSales.filter((s: any) => s?.createdBy === user.id)
      : safeSales;

  // Calculate today's sales
  const todaysSales = useMemo(() => {
    const today = new Date().toDateString();
    return userSales.filter((s: any) => {
      const saleDate = new Date(s?.date);
      return (
        Number.isFinite(saleDate.getTime()) && saleDate.toDateString() === today
      );
    });
  }, [userSales]);

  // Calculate total sales for today
  const totalSalesToday = useMemo(() => {
    return todaysSales.reduce(
      (sum: number, sale: any) =>
        sum + (Number.isFinite(sale?.totalAmount) ? sale.totalAmount : 0),
      0,
    );
  }, [todaysSales]);

  // Get last sale time
  const lastSaleTime = useMemo(() => {
    if (todaysSales.length === 0) return null;
    const sorted = [...todaysSales]
      .filter((s: any) => s?.createdAt)
      .sort((a: any, b: any) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        if (!Number.isFinite(aDate) || !Number.isFinite(bDate)) return 0;
        return bDate - aDate;
      });
    const lastSale = sorted[0];
    const date = new Date(lastSale?.createdAt);
    return Number.isFinite(date.getTime()) ? date : null;
  }, [todaysSales]);

  // Filter sales based on search and filters
  const filteredSales = useMemo(() => {
    return userSales.filter((sale: any) => {
      // Search by sale number or transaction ID
      const saleNumber = (sale?.saleNumber || "").toString().toLowerCase();
      const txnId = (sale?.txnId || "").toString().toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        saleNumber.includes(searchLower) ||
        txnId.includes(searchLower);

      // Filter by date range
      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const saleDateValue = new Date(sale?.date);
        if (!Number.isFinite(saleDateValue.getTime())) {
          matchesDate = false;
        } else {
          const saleDate = saleDateValue.toDateString();
          if (filterDateFrom) {
            const fromDateValue = new Date(filterDateFrom);
            if (Number.isFinite(fromDateValue.getTime())) {
              matchesDate =
                matchesDate && saleDate >= fromDateValue.toDateString();
            }
          }
          if (filterDateTo) {
            const toDateValue = new Date(filterDateTo);
            if (Number.isFinite(toDateValue.getTime())) {
              matchesDate =
                matchesDate && saleDate <= toDateValue.toDateString();
            }
          }
        }
      }

      // Filter by product name
      let matchesProduct = true;
      if (filterProductName) {
        const lowerFilter = filterProductName.toLowerCase();
        matchesProduct = Array.isArray(sale?.items)
          ? sale.items.some((item: any) => {
              const prod = safeProducts.find(
                (p: any) =>
                  p?.id === item?.productId || p?._id === item?.productId,
              );
              return (
                prod?.name?.toString().toLowerCase().includes(lowerFilter) ||
                false
              );
            })
          : false;
      }

      // Filter by customer name
      const matchesCustomer =
        !filterCustomerName ||
        (sale.customerName &&
          sale.customerName
            .toLowerCase()
            .includes(filterCustomerName.toLowerCase()));

      return matchesSearch && matchesDate && matchesProduct && matchesCustomer;
    });
  }, [
    userSales,
    searchTerm,
    filterDateFrom,
    filterDateTo,
    filterProductName,
    filterCustomerName,
    products,
  ]);

  const hasActiveFilters =
    searchTerm ||
    filterDateFrom ||
    filterDateTo ||
    filterProductName ||
    filterCustomerName;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterProductName("");
    setFilterCustomerName("");
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-800 dark:to-teal-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8" />
          <h1 className="text-3xl sm:text-4xl font-bold">Sales Management</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Create and manage sales transactions
        </p>
      </div>
      {/* Sales Form Card */}
      <Card className="border-2 border-blue-200 dark:border-blue-700 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-gray-900 dark:text-blue-100">
              Record New Sale
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {user && (
            <SalesForm
              products={products}
              onSubmit={handleAddSale}
              onCancel={() => {}}
              currentUserId={user.id}
              currentUsername={user.username}
            />
          )}
        </CardContent>
      </Card>
      {/* Stats Section: Daily Sales & Last Transaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Today's Sales Card */}
        <Card className="border-2 border-blue-200 dark:border-blue-700 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-200 dark:bg-blue-900/40 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-blue-100">
                  Today's Sales
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                  Total Amount
                </p>
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(totalSalesToday)}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 border-t border-blue-200 dark:border-blue-700 pt-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {todaysSales.length}
                </span>{" "}
                transaction{todaysSales.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Last Sale Card */}
        <Card className="border-2 border-teal-200 dark:border-teal-700 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-teal-200 dark:bg-teal-900/40 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-teal-100">
                  Last Transaction
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                  Time
                </p>
                <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                  {lastSaleTime ? format(lastSaleTime, "h:mm a") : "No sales"}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 border-t border-teal-200 dark:border-teal-700 pt-3">
                {lastSaleTime ? format(lastSaleTime, "MMM dd, yyyy") : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card className="border-2 border-gray-200 dark:border-slate-700 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              <CardTitle className="text-gray-900 dark:text-slate-100">
                Search & Filter Sales
              </CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Search by Sale ID / Transaction ID */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Search by Sale ID or Transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Product
              </label>
              <Input
                placeholder="Search product..."
                value={filterProductName}
                onChange={(e) => setFilterProductName(e.target.value)}
                className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Customer
              </label>
              <Input
                placeholder="Search customer..."
                value={filterCustomerName}
                onChange={(e) => setFilterCustomerName(e.target.value)}
                className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Results Info */}
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {filteredSales.length}
              </span>{" "}
              of <span className="font-semibold">{userSales.length}</span> sales
              matching filters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <SalesTable
        sales={filteredSales}
        products={safeProducts}
        onDelete={handleDeleteSale}
        onReturn={handleReturnSale}
      />

      {/* Return Dialog */}
      <SalesReturnDialog
        isOpen={returnDialogOpen}
        onClose={() => {
          setReturnDialogOpen(false);
          setSelectedSaleForReturn(null);
        }}
        onSubmit={handleProcessReturn}
        sale={selectedSaleForReturn}
        products={safeProducts}
      />
    </div>
  );
}

export default function SalesPage() {
  return (
    <ClientOnly>
      <SalesPageContent />
    </ClientOnly>
  );
}
