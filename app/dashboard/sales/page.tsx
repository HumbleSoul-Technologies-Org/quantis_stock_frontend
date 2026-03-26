"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { ClientOnly } from "@/components/client-only";
import { SalesDialog } from "@/components/sales/SalesDialog";
import { SalesTable } from "@/components/sales/SalesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SalesPageContent() {
  const { products, sales, addSale, deleteSale } = useData();
  const { user } = useAuth();

  const [showDialog, setShowDialog] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterProductName, setFilterProductName] = useState("");
  const [filterCustomerName, setFilterCustomerName] = useState("");

  const handleAddSale = (sale: any) => {
    addSale(sale);
    setShowDialog(false);
  };

  const userSales =
    user?.role === "sales"
      ? sales.filter((s: any) => s.createdBy === user.id)
      : sales;

  // Filter sales based on search and filters
  const filteredSales = useMemo(() => {
    return userSales.filter((sale: any) => {
      // Search by sale number or transaction ID
      const matchesSearch =
        !searchTerm ||
        sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.txnId &&
          sale.txnId.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by date range
      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const saleDate = new Date(sale.date).toDateString();
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom).toDateString();
          matchesDate = matchesDate && saleDate >= fromDate;
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo).toDateString();
          matchesDate = matchesDate && saleDate <= toDate;
        }
      }

      // Filter by product name
      let matchesProduct = true;
      if (filterProductName) {
        matchesProduct = sale.items.some((item: any) =>
          products
            .find((p: any) => p.id === item.productId)
            ?.name.toLowerCase()
            .includes(filterProductName.toLowerCase()),
        );
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-2">
            Create and manage sales transactions
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {user && (
        <SalesDialog
          isOpen={showDialog}
          products={products}
          onSubmit={handleAddSale}
          onOpenChange={setShowDialog}
          currentUserId={user.id}
          currentUsername={user.username}
        />
      )}

      {/* Search and Filters Section */}
      <div className="space-y-4">
        {/* Search by Sale ID / Transaction ID */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by Sale ID or Transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-200"
          />
        </div>

        {/* Filter Controls */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center justify-between">
            <span>Advanced Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 text-xs"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="border-green-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="border-green-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <Input
                placeholder="Search product..."
                value={filterProductName}
                onChange={(e) => setFilterProductName(e.target.value)}
                className="border-green-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <Input
                placeholder="Search customer..."
                value={filterCustomerName}
                onChange={(e) => setFilterCustomerName(e.target.value)}
                className="border-green-200 text-sm"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {filteredSales.length} of {userSales.length} sales matching filters
          </p>
        </div>
      </div>

      <SalesTable
        sales={filteredSales}
        products={products}
        onDelete={deleteSale}
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
