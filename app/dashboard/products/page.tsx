"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/lib/types";
import { ClientOnly } from "@/components/client-only";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ProductDetailsDialog } from "@/components/products/ProductDetailsDialog";
import { ProductTable } from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useAuth } from "@/context/AuthContext";
function ProductsPageContent() {
  const {
    products,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    isInitialLoadingProducts,
    logActivity,
  } = useData();
  const {
    notifyResourceCreated,
    notifyResourceUpdated,
    notifyResourceDeleted,
  } = useNotificationActions();
  const { toast } = useToast();

  const safeProducts = Array.isArray(products) ? products : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { user } = useAuth();

  const openDialogForAction = (_actionType: string, action: () => void) => {
    action();
  };

  const categories = Array.from(
    new Set(safeProducts.map((p) => p?.category || "")),
  ).filter(Boolean);

  const handleAddProduct = async (product: Product) => {
    try {
      if ((product && product.id) || product._id) {
        // Update existing product
        const productId = (product.id as string) || (product._id as string);

        await updateProduct(productId, product);

        // Log activity: product updated
        try {
          await logActivity({
            type: "product",
            action: "update",
            status: "success",
            title: `Product Updated: ${product.name}`,
            description: `Product "${product.name}" (SKU: ${product.sku}) was updated`,
            referenceId: productId,
            entityType: "product",
            entityId: productId,
            metadata: {
              productName: product.name,
              sku: product.sku,
              category: product.category,
            },
            businessId: user?.businessId,
            createdBy: user?.id || user?._id || "",
          });
        } catch (error) {
          console.warn("Failed to log product update activity:", error);
        }

        notifyResourceUpdated("Product", product.name);
        toast({
          title: "Product Updated",
          description: `"${product.name}" has been updated successfully.`,
        });
      } else {
        // Create new product
        await addProduct(product);

        // Log activity: product created
        try {
          await logActivity({
            type: "product",
            action: "create",
            status: "success",
            title: `Product Created: ${product.name}`,
            description: `New product "${product.name}" (SKU: ${product.sku}) was created`,
            referenceId: product.id || product._id,
            entityType: "product",
            entityId: product.id || product._id,
            metadata: {
              productName: product.name,
              sku: product.sku,
              category: product.category,
              unitPrice: product.unitPrice,
              costPrice: product.costPrice,
            },
            businessId: user?.businessId,
            createdBy: user?.id || user?._id || "",
          });
        } catch (error) {
          console.warn("Failed to log product create activity:", error);
        }

        notifyResourceCreated("Product", product.name);
        toast({
          title: "Product Created",
          description: `"${product.name}" has been created successfully.`,
        });
      }
      setShowDialog(false);
      setEditingProduct(undefined);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save product";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = (id: string) => {
    try {
      const product = safeProducts.find((p) => p.id === id || p._id === id);
      if (!product) return;

      deleteProduct(id);

      // Log activity: product deleted
      try {
        logActivity({
          type: "product",
          action: "delete",
          status: "success",
          title: `Product Deleted: ${product.name}`,
          description: `Product "${product.name}" (SKU: ${product.sku}) was deleted`,
          referenceId: id,
          entityType: "product",
          entityId: id,
          metadata: {
            productName: product.name,
            sku: product.sku,
            category: product.category,
          },
          businessId: user?.businessId,
          createdBy: user?.id || user?._id || "",
        });
      } catch (error) {
        console.warn("Failed to log product delete activity:", error);
      }

      notifyResourceDeleted("Product", product.name);
      toast({
        title: "Product Deleted",
        description: `"${product.name}" has been deleted successfully.`,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete product";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      console.error("Error deleting product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    openDialogForAction("update product", () => {
      setEditingProduct(product);
      setShowDialog(true);
    });
  };

  const handleStockIn = (product: Product) => {
    // Redirect to inventory page - will implement stock in dialog there
    window.location.href = `/dashboard/inventory?productId=${product.id || product._id}`;
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setShowViewDialog(true);
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
            onClick={() =>
              openDialogForAction("create product", () => setShowDialog(true))
            }
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

      <ProductDetailsDialog
        isOpen={showViewDialog}
        product={viewingProduct}
        suppliers={safeSuppliers}
        onOpenChange={(open) => {
          setShowViewDialog(open);
          if (!open) {
            setViewingProduct(undefined);
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

      {isInitialLoadingProducts ? (
        <TableSkeleton rows={7} />
      ) : (
        <ProductTable
          products={products}
          suppliers={suppliers}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onStockIn={handleStockIn}
          onView={handleViewProduct}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
        />
      )}
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
