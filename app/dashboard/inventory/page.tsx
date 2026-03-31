"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
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
import { Plus, AlertTriangle, Search, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InventoryPageContent() {
  const { products, stockMovements, addStockMovement } = useData();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const {
    notifyLowStock,
    notifyStockOut,
    notifyResourceCreated,

    notifyResourceUpdated,
    notifyResourceDeleted,
    notifyDataSync,
  } = useNotificationActions();
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

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      setSelectedProductId(productId);
      setShowDialog(true);
    }
  }, [searchParams]);

  const lowStockItems = products.filter(
    (p: Product) => p.currentStock <= p.reorderLevel,
  );
  const categories = Array.from(
    new Set(products.map((p: Product) => p.category)),
  );

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      let matchesStockFilter = true;
      if (stockFilter === "low") {
        matchesStockFilter = product.currentStock <= product.reorderLevel;
      } else if (stockFilter === "out") {
        matchesStockFilter = product.currentStock === 0;
      }

      return matchesSearch && matchesCategory && matchesStockFilter;
    });
  }, [products, searchTerm, categoryFilter, stockFilter]);

  const handleAddMovement = (movement: any) => {
    addStockMovement(movement);

    const product = products.find(
      (p) => p._id === movement.productId || p.id === movement.productId,
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

      const updatedProduct = products.find((p) => p._id === movement.productId);
      if (updatedProduct) {
        if (updatedProduct.currentStock === 0) {
          notifyStockOut(productName);
        } else if (updatedProduct.currentStock <= updatedProduct.reorderLevel) {
          notifyLowStock(productName);
        }
      }
    }
  };

  const handleStockIn = (product: any) => {
    setSelectedMovement(null);
    setSelectedProductId(product._id || product.id);
    setShowDialog(true);
  };

  const handleEditMovement = (movement: StockMovement) => {
    setSelectedMovement(movement);
    setShowDialog(true);
  };

  // Sort stock movement history so recent events appear first
  const sortedMovements = useMemo(() => {
    return [...stockMovements].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [stockMovements]);

  // Filter movement history (currently showing all types, include stock out and adjustments)
  const filteredStockInHistory = useMemo(() => {
    return sortedMovements.filter((movement: StockMovement) => {
      const matchesProduct =
        !historyProductFilter || movement.productId === historyProductFilter;

      let matchesDateRange = true;
      if (historyDateFrom || historyDateTo) {
        const movementDate = new Date(movement.createdAt).toDateString();
        if (historyDateFrom) {
          const fromDate = new Date(historyDateFrom).toDateString();
          matchesDateRange = matchesDateRange && movementDate >= fromDate;
        }
        if (historyDateTo) {
          const toDate = new Date(historyDateTo).toDateString();
          matchesDateRange = matchesDateRange && movementDate <= toDate;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
            Inventory Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
            Track and manage stock levels in real-time
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Stock In
        </Button>
      </div>

      {/* Stats */}
      <InventoryStats products={products} movements={stockMovements} />

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-700 border-2 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-900 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              {lowStockItems.length} product(s) are running low on stock. Please
              reorder soon.
            </p>
            <div className="mt-3 space-y-1">
              {lowStockItems.map((item) => (
                <p
                  key={item.id}
                  className="text-sm text-amber-700 dark:text-amber-400"
                >
                  • {item.name}: {item.currentStock} {item.unit} (Reorder at:{" "}
                  {item.reorderLevel})
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by product name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-200"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-50">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-green-200 rounded-md text-sm"
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Dialog */}
      {user && (
        <Dialog
          open={showDialog}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedMovement(null);
              setSelectedProductId("");
            }
            setShowDialog(open);
          }}
        >
          <DialogContent className="max-w-2xl">
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
              onSubmit={(movement) => {
                handleAddMovement(movement);
                setShowDialog(false);
                setSelectedMovement(null);
                setSelectedProductId("");
              }}
              onCancel={() => {
                setShowDialog(false);
                setSelectedMovement(null);
                setSelectedProductId("");
              }}
              currentUserId={user.id}
              preselectedProductId={selectedProductId}
              initialMovement={selectedMovement || undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Products Grid */}
      <div className="space-y-4">
        {filteredProducts.length > 0 ? (
          <>
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductInventoryCard
                  key={product.id || product._id}
                  product={product}
                  movements={stockMovements}
                  onStockIn={handleStockIn}
                />
              ))}
            </div>
          </>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                No products found matching your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stock In History Section */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Stock In History
            </h2>
            <p className="text-gray-600 mt-1">
              Track all incoming stock movements
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 border-2 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">
                Total Units Stocked In
              </p>
              <p className="text-3xl font-bold text-green-700">
                {totalUnitsStockedIn}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on current filters
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 border-2 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 mb-1">
                Stock In Transactions
              </p>
              <p className="text-3xl font-bold text-blue-700">
                {totalStockInTransactions}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Number of stock in records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-900">
            Filter Stock In History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </label>
              <select
                value={historyProductFilter}
                onChange={(e) => setHistoryProductFilter(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option
                    key={product.id || product._id}
                    value={product.id || product._id}
                  >
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={historyDateFrom}
                onChange={(e) => setHistoryDateFrom(e.target.value)}
                className="border-green-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={historyDateTo}
                onChange={(e) => setHistoryDateTo(e.target.value)}
                className="border-green-200"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHistoryProductFilter("");
                setHistoryDateFrom("");
                setHistoryDateTo("");
              }}
              className="text-gray-700"
            >
              Clear Filters
            </Button>
            <p className="text-xs text-gray-500 self-center ml-auto">
              {filteredStockInHistory.length} record(s) found
            </p>
          </div>
        </div>

        {/* Stock History Table */}
        <StockHistoryTable
          movements={filteredStockInHistory}
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
function notifySuccess(arg0: string, arg1: string) {
  throw new Error("Function not implemented.");
}
