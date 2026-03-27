"use client";

import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MoreVertical, Edit2, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/context/SettingsContext";

interface ProductTableProps {
  products: Product[];
  suppliers: Supplier[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStockIn: (product: Product) => void;
  searchTerm?: string;
  categoryFilter?: string;
}

export function ProductTable({
  products,
  suppliers,
  onEdit,
  onDelete,
  onStockIn,
  searchTerm = "",
  categoryFilter = "",
}: ProductTableProps) {
  const { formatCurrency } = useSettings();

  let filtered = products;

  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || "Unknown";
  };

  return (
    <Card className="border-green-200 dark:border-teal-700 border-2 mt-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Products ({filtered.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">
            No products found
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const lowStock = product.currentStock <= product.reorderLevel;
              const backgroundImage = product.imageUrl
                ? `url(${product.imageUrl})`
                : "url(https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg)";

              return (
                <div
                  key={product.id}
                  className="relative h-64 overflow-hidden rounded-xl border border-green-200 dark:border-teal-700 shadow-sm bg-slate-100 dark:bg-slate-800 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    backgroundImage,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: product.imageUrl
                      ? "transparent"
                      : "#1f2937",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  {!product.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white/90">
                      No image available
                    </div>
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
                        {product.category || "Uncategorized"}
                      </div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${
                          lowStock ? "bg-red-600/80" : "bg-green-600/80"
                        }`}
                      >
                        {lowStock ? "Low Stock" : "In Stock"}
                      </div>
                    </div>

                    <div className="bg-black/55 rounded-lg p-3 text-white backdrop-blur-sm">
                      <h3 className="font-bold text-lg text-white line-clamp-2">
                        {product.name || "Untitled Product"}
                      </h3>
                      <p className="text-xs text-slate-200 line-clamp-1">
                        SKU: {product.sku}
                      </p>

                      <div className="mt-2 text-sm space-y-1">
                        <p className="line-clamp-1">
                          <span className="font-semibold">Supplier:</span>{" "}
                          {getSupplierName(product.supplierId)}
                        </p>
                        <p className="line-clamp-1">
                          <span className="font-semibold">Price:</span>{" "}
                          {formatCurrency(product.unitPrice)}
                        </p>
                        <p className="line-clamp-1">
                          <span className="font-semibold">Stock:</span>{" "}
                          {product.currentStock} {product.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit(product)}
                        className="bg-white/85 text-slate-900 hover:bg-white"
                      >
                        Edit
                      </Button>
                      <div className="flex gap-1">
                        <Button size="icon" onClick={() => onStockIn(product)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => onDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
