"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { Product } from "@/lib/types";
import { ClientOnly } from "@/components/client-only";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ProductTable } from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
function ProductsPageContent() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } =
    useData();
  const {
    notifyResourceCreated,
    notifyResourceUpdated,
    notifyResourceDeleted,
    notifySuccess,
  } = useNotificationActions();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { user } = useAuth();

  const categories = Array.from(
    new Set(safeProducts.map((p) => p?.category || "")),
  ).filter(Boolean);

  const handleAddProduct = async (product: Product) => {
    if (editingProduct) {
      await updateProduct(
        (editingProduct.id as string) || (editingProduct._id as string),
        product,
      );
      notifyResourceUpdated("Product", product.name);
    } else {
      await addProduct(product);
      notifyResourceCreated("Product", product.name);
    }
    setShowDialog(false);
    setEditingProduct(undefined);
  };

  const handleDeleteProduct = (id: string) => {
    const product = safeProducts.find((p) => p.id === id || p._id === id);
    if (!product) return;

    deleteProduct(id);
    notifyResourceDeleted("Product", product.name);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };

  const handleStockIn = (product: Product) => {
    // Redirect to inventory page - will implement stock in dialog there
    window.location.href = `/dashboard/inventory?productId=${product.id || product._id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
            Products
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
            Manage your product inventory
          </p>
        </div>
        {user && (user.role === "admin" || user.role === "manager") && (
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        )}
      </div>

      <ProductDialog
        isOpen={showDialog}
        product={editingProduct}
        suppliers={safeSuppliers}
        categories={categories}
        onSubmit={handleAddProduct}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingProduct(undefined);
          }
        }}
      />

      <div className="flex gap-4 flex-col sm:flex-row">
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50 flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50 rounded-md text-sm w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <ProductTable
        products={products}
        suppliers={suppliers}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onStockIn={handleStockIn}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ClientOnly>
      <ProductsPageContent />
    </ClientOnly>
  );
}
