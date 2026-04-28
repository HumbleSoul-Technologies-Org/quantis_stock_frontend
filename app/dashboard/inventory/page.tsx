"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { ClientOnly } from "@/components/client-only";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { ProductInventoryCard } from "@/components/inventory/ProductInventoryCard";
import { StockHistoryTable } from "@/components/inventory/StockHistoryTable";
import { Product, StockMovement } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  AlertTriangle,
  Search,
  TrendingUp,
  Package,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InventoryPageContent() {
  const { products, stockMovements, addStockMovement, openNoInternetModal } =
    useData();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    notifyLowStock,
    notifyStockOut,
    notifyResourceCreated,
    notifyResourceUpdated,
    notifyResourceDeleted,
    notifyDataSync,
    notifySuccess,
    notifyError,
  } = useNotificationActions();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeStockMovements = Array.isArray(stockMovements)
    ? stockMovements
    : [];

  const [showDialog, setShowDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedMovement, setSelectedMovement] =
    useState<StockMovement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Stock in history filters
  const [historyProductFilter, setHistoryProductFilter] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");

  // Clear productId from URL to prevent re-selection on refresh
  const clearProductIdFromUrl = () => {
    router.push("/dashboard/inventory", { scroll: false });
  };

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      setSelectedProductId(productId);
      setShowDialog(true);
    }
  }, [searchParams]);

  const lowStockItems = safeProducts.filter(
    (p: Product) =>
      Number.isFinite(p?.currentStock) &&
      Number.isFinite(p?.reorderLevel) &&
      p.currentStock <= p.reorderLevel,
  );
  const categories = Array.from(
    new Set(safeProducts.map((p: Product) => p?.category || "")),
  ).filter(Boolean);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      const name = (product?.name || "").toString().toLowerCase();
      const sku = (product?.sku || "").toString().toLowerCase();
      const category = (product?.category || "").toString().toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(query) || sku.includes(query) || category.includes(query);

      const matchesCategory =
        !categoryFilter || product?.category === categoryFilter;

      let matchesStockFilter = true;
      if (stockFilter === "low") {
        matchesStockFilter =
          Number.isFinite(product?.currentStock) &&
          Number.isFinite(product?.reorderLevel) &&
          product.currentStock <= product.reorderLevel;
      } else if (stockFilter === "out") {
        matchesStockFilter =
          Number.isFinite(product?.currentStock) && product.currentStock === 0;
      }

      return matchesSearch && matchesCategory && matchesStockFilter;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const openDialogForAction = (actionType: string, action: () => void) => {
    if (openNoInternetModal(actionType, action)) {
      return;
    }
    action();
  };

  const handleAddMovement = async (movement: any) => {
    await addStockMovement(movement);

    const product = safeProducts.find(
      (p) => p?._id === movement.productId || p?.id === movement.productId,
    );
    const productName = product?.name || "Unknown Product";

    notifyResourceCreated(
      "Inventory movement",
      `${movement.type} for ${productName}`,
    );

    if (movement.type === "in") {
      notifySuccess(
        "Stock In",
        `${movement.quantity} units of ${productName} stocked in.`,
      );
    } else {
      notifySuccess(
        "Stock Out",
        `${movement.quantity} units of ${productName} stocked out.`,
      );

      const updatedProduct = safeProducts.find(
        (p) => p?._id === movement.productId,
      );
      if (updatedProduct) {
        if (updatedProduct.currentStock === 0) {
          notifyStockOut(productName);
        } else if (
          Number.isFinite(updatedProduct.currentStock) &&
          Number.isFinite(updatedProduct.reorderLevel) &&
          updatedProduct.currentStock <= updatedProduct.reorderLevel
        ) {
          notifyLowStock(productName);
        }
      }
    }
  };

  const handleStockIn = (product: any) => {
    openDialogForAction("create stock movement", () => {
      setSelectedMovement(null);
      setSelectedProductId(product._id || product.id);
      setShowDialog(true);
    });
  };

  const handleEditMovement = (movement: StockMovement) => {
    openDialogForAction("update stock movement", () => {
      setSelectedMovement(movement);
      setShowDialog(true);
    });
  };

  // Sort stock movement history so recent events appear first
  const sortedMovements = useMemo(() => {
    return [...safeStockMovements]
      .filter((m) => m?.createdAt)
      .sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        if (!Number.isFinite(aDate) || !Number.isFinite(bDate)) return 0;
        return bDate - aDate;
      });
  }, [safeStockMovements]);

  // Filter movement history (only stock in movements)
  const filteredStockInHistory = useMemo(() => {
    return sortedMovements.filter((movement: StockMovement) => {
      // Only include stock in movements
      if (movement.type !== "in") return false;

      const matchesProduct =
        !historyProductFilter || movement.productId === historyProductFilter;

      let matchesDateRange = true;
      if (historyDateFrom || historyDateTo) {
        const movementDateValue = new Date(movement.createdAt);
        const movementDate = Number.isFinite(movementDateValue.getTime())
          ? movementDateValue.toDateString()
          : null;

        if (!movementDate) return false;

        if (historyDateFrom) {
          const fromDateValue = new Date(historyDateFrom);
          const fromDate = Number.isFinite(fromDateValue.getTime())
            ? fromDateValue.toDateString()
            : null;
          if (fromDate) {
            matchesDateRange = matchesDateRange && movementDate >= fromDate;
          }
        }
        if (historyDateTo) {
          const toDateValue = new Date(historyDateTo);
          const toDate = Number.isFinite(toDateValue.getTime())
            ? toDateValue.toDateString()
            : null;
          if (toDate) {
            matchesDateRange = matchesDateRange && movementDate <= toDate;
          }
        }
      }

      return matchesProduct && matchesDateRange;
    });
  }, [sortedMovements, historyProductFilter, historyDateFrom, historyDateTo]);

  // Filter ALL movement history (stock in, out, and adjustments)
  const filteredAllHistory = useMemo(() => {
    return sortedMovements.filter((movement: StockMovement) => {
      const matchesProduct =
        !historyProductFilter || movement.productId === historyProductFilter;

      let matchesDateRange = true;
      if (historyDateFrom || historyDateTo) {
        const movementDateValue = new Date(movement.createdAt);
        const movementDate = Number.isFinite(movementDateValue.getTime())
          ? movementDateValue.toDateString()
          : null;

        if (!movementDate) return false;

        if (historyDateFrom) {
          const fromDateValue = new Date(historyDateFrom);
          const fromDate = Number.isFinite(fromDateValue.getTime())
            ? fromDateValue.toDateString()
            : null;
          if (fromDate) {
            matchesDateRange = matchesDateRange && movementDate >= fromDate;
          }
        }
        if (historyDateTo) {
          const toDateValue = new Date(historyDateTo);
          const toDate = Number.isFinite(toDateValue.getTime())
            ? toDateValue.toDateString()
            : null;
          if (toDate) {
            matchesDateRange = matchesDateRange && movementDate <= toDate;
          }
        }
      }

      return matchesProduct && matchesDateRange;
    });
  }, [sortedMovements, historyProductFilter, historyDateFrom, historyDateTo]);

  // Calculate stock in summary stats
  const totalUnitsStockedIn = filteredStockInHistory.reduce(
    (sum: number, m: any) => sum + m.quantity,
    0,
  );
  const totalStockInTransactions = filteredStockInHistory.length;

  // Calculate stock out summary stats
  const stockOutMovements = useMemo(() => {
    return sortedMovements.filter((m: StockMovement) => m.type === "out");
  }, [sortedMovements]);

  const totalUnitsStockedOut = stockOutMovements.reduce(
    (sum: number, m: any) => sum + (m.quantity || 0),
    0,
  );

  const lastStockOut =
    stockOutMovements.length > 0 ? stockOutMovements[0] : null;
  const lastStockOutDate = lastStockOut
    ? new Date(lastStockOut.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
  const lastStockOutReason = lastStockOut?.reason || "No reason provided";

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8" />
              <h1 className="text-3xl sm:text-4xl font-bold">
                Inventory Management
              </h1>
            </div>
            <p className="text-emerald-100 text-lg">
              Track and manage stock levels in real-time
            </p>
          </div>
          {((user && user?.role === "manager") || user?.role === "admin") && (
            <Button
              onClick={() =>
                openDialogForAction("create stock movement", () => {
                  setSelectedMovement(null);
                  setSelectedProductId("");
                  setShowDialog(true);
                })
              }
              className="bg-white text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-100 gap-2 w-full sm:w-auto font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Stock In
            </Button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <InventoryStats products={safeProducts} movements={safeStockMovements} />

      {/* Low Stock Alert - Redesigned */}
      {lowStockItems.length > 0 && (
        <Card className="border-2 border-amber-200 dark:border-amber-700 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-amber-900/20 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-900 dark:text-amber-300 flex items-center gap-3">
              <div className="bg-amber-200 dark:bg-amber-700 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-200" />
              </div>
              Low Stock Alert ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium mb-4">
              {lowStockItems.length} product(s) are running low on stock
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-amber-200 dark:border-amber-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    Current:{" "}
                    <span className="font-semibold">
                      {item.currentStock} {item.unit}
                    </span>{" "}
                    | Reorder at:{" "}
                    <span className="font-semibold">{item.reorderLevel}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Section */}
      <Card className="border-2 dark:bg-slate-800 border-teal-200 dark:border-teal-700 shadow-md">
        <CardHeader className="bg-linear-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-gray-900 dark:text-teal-100">
              Search & Filter
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-teal-200 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-200 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                Stock Status
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-teal-200 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Items</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Dialog */}
      {user && (
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedMovement(null);
              setSelectedProductId("");
              clearProductIdFromUrl();
            }
            setShowDialog(open);
          }}
        >
          <DialogContent className="max-w-2xl dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle>
                {selectedMovement ? "Edit Stock Movement" : "Stock In Product"}
              </DialogTitle>
              <DialogDescription>
                {selectedMovement
                  ? "Update the stock movement record details."
                  : "Record incoming stock for your products with reference numbers and movement details."}
              </DialogDescription>
            </DialogHeader>
            <StockMovementForm
              products={products}
              onSubmit={async (movement) => {
                await handleAddMovement(movement);
                setShowDialog(false);
                setSelectedMovement(null);
                setSelectedProductId("");
                clearProductIdFromUrl();
              }}
              onCancel={() => {
                setShowDialog(false);
                setSelectedMovement(null);
                setSelectedProductId("");
                clearProductIdFromUrl();
              }}
              currentUserId={user.id}
              preselectedProductId={selectedProductId}
              initialMovement={selectedMovement || undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-600">
              Products
            </h2>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
            {filteredProducts.length} of {safeProducts.length} products
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductInventoryCard
                key={product.id || product._id}
                product={product}
                movements={stockMovements}
                onStockIn={handleStockIn}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-slate-400 font-medium">
                No products found matching your filters
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stock In History Section */}
      <div className="space-y-6 pt-8 border-t-2 border-gray-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-br from-teal-600 to-emerald-600 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
              Stock In History
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Track all incoming stock movements
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="border-2 dark:bg-slate-800 border-teal-200 dark:border-teal-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Total Units Stocked In
                  </p>
                  <p className="text-4xl font-bold text-teal-700 dark:text-teal-300">
                    {totalUnitsStockedIn.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                    Based on current filters
                  </p>
                </div>
                <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Stock In Transactions
                  </p>
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                    {totalStockInTransactions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                    Number of records
                  </p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Outs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-gray-200 dark:border-slate-700 mt-6">
          <Card className="border-2 dark:bg-red/10 border-red-200 dark:border-red-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Total Units Stocked Out
                  </p>
                  <p className="text-4xl font-bold text-red-700 dark:text-red-300">
                    {totalUnitsStockedOut.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                    Total outgoing stock
                  </p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 dark:border-orange-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Last Stock Out Date
                  </p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {lastStockOutDate}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                    Most recent outgoing
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-rose-200 dark:border-rose-700 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                    Last Stock Out Reason
                  </p>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 line-clamp-3">
                    {lastStockOutReason}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                    Reason for last outgoing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 dark:bg-slate-800 border-gray-200 dark:border-teal-700 shadow-md">
          <CardHeader className="bg-linear-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              <CardTitle className="text-gray-900 dark:text-slate-100">
                Filter History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  Product
                </label>
                <select
                  value={historyProductFilter}
                  onChange={(e) => setHistoryProductFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Products</option>
                  {safeProducts.map((product) => (
                    <option
                      key={product?.id || product?._id || "unknown-product"}
                      value={product?.id || product?._id || ""}
                    >
                      {(product?.name || "Unnamed Product") +
                        " (" +
                        (product?.sku || "No SKU") +
                        ")"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  From Date
                </label>
                <Input
                  type="date"
                  value={historyDateFrom}
                  onChange={(e) => setHistoryDateFrom(e.target.value)}
                  className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                  To Date
                </label>
                <Input
                  type="date"
                  value={historyDateTo}
                  onChange={(e) => setHistoryDateTo(e.target.value)}
                  className="border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setHistoryProductFilter("");
                  setHistoryDateFrom("");
                  setHistoryDateTo("");
                }}
                className="border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                Clear Filters
              </Button>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-400">
                {filteredAllHistory.length} record(s) found
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stock History Table */}
        <StockHistoryTable
          movements={filteredAllHistory}
          products={products}
          onEdit={handleEditMovement}
        />
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ClientOnly>
      <InventoryPageContent />
    </ClientOnly>
  );
}
