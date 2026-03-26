"use client";

import { useState, useEffect, useMemo } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { ClientOnly } from "@/components/client-only";
import { StockMovementForm } from "@/components/inventory/StockMovementForm";
import { InventoryStats } from "@/components/inventory/InventoryStats";
import { ProductInventoryCard } from "@/components/inventory/ProductInventoryCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function InventoryPageContent() {
  const { products, stockMovements, addStockMovement } = useData();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      setSelectedProductId(productId);
      setShowDialog(true);
    }
  }, [searchParams]);

  const lowStockItems = products.filter(
    (p) => p.currentStock <= p.reorderLevel,
  );
  const categories = Array.from(new Set(products.map((p) => p.category)));

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
  };

  const handleStockIn = (product: any) => {
    setSelectedProductId(product.id);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage stock levels in real-time
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Stock In
        </Button>
      </div>

      {/* Stats */}
      <InventoryStats products={products} movements={stockMovements} />

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 border-2 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 text-sm">
              {lowStockItems.length} product(s) are running low on stock. Please
              reorder soon.
            </p>
            <div className="mt-3 space-y-1">
              {lowStockItems.map((item) => (
                <p key={item.id} className="text-sm text-amber-700">
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
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Stock In Product</DialogTitle>
              <DialogDescription>
                Record incoming stock for your products with reference numbers
                and movement details.
              </DialogDescription>
            </DialogHeader>
            <StockMovementForm
              products={products}
              onSubmit={(movement) => {
                handleAddMovement(movement);
                setShowDialog(false);
              }}
              onCancel={() => {
                setShowDialog(false);
                setSelectedProductId("");
              }}
              currentUserId={user.id}
              preselectedProductId={selectedProductId}
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
                  key={product.id}
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
