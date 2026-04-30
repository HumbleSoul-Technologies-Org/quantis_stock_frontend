"use client";

import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  MoreVertical,
  Edit2,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useFormatCurrencyShort } from "@/hooks/useFormatCurrencyShort";

interface ProductTableProps {
  products: Product[];
  suppliers: Supplier[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStockIn: (product: Product) => void;
  onView: (product: Product) => void;
  searchTerm?: string;
  categoryFilter?: string;
}

export function ProductTable({
  products,
  suppliers,
  onEdit,
  onDelete,
  onStockIn,
  onView,
  searchTerm = "",
  categoryFilter = "",
}: ProductTableProps) {
  const { formatCurrency } = useSettings();
  const formatCurrencyShort = useFormatCurrencyShort();

  let filtered = products;

  const { user } = useAuth();

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

  const getSupplierName = (supplierId?: string) => {
    return (
      suppliers.find(
        (s) =>
          s._id === supplierId ||
          s.id === supplierId ||
          s.offline_id === supplierId,
      )?.name || "Unknown"
    );
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
              const backgroundImage =
                product.image?.url || product.imageUrl
                  ? `url(${product.image?.url || product.imageUrl})`
                  : "url(/no-image.png)";

              return (
                <div
                  key={product.id || product._id} // Handle both id and _id for backward compatibility
                  className="group relative h-96 overflow-hidden rounded-2xl border border-green-200 dark:border-teal-700 shadow-lg bg-slate-50 dark:bg-slate-800 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 dark:hover:shadow-teal-500/10 cursor-pointer"
                  style={{
                    backgroundImage,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor:
                      product.image?.url || product.imageUrl
                        ? "transparent"
                        : "#1f2937",
                  }}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/10 transition-all duration-300" />
                  {!product.image?.url ||
                    (product.imageUrl === "" && (
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                          </div>
                          No image available
                        </div>
                      </div>
                    ))}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white border border-white/20">
                        {product.category || "Uncategorized"}
                      </div>
                      <div
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white border backdrop-blur-sm ${
                          lowStock
                            ? "bg-red-500/90 border-red-400/50"
                            : "bg-emerald-500/90 border-emerald-400/50"
                        }`}
                      >
                        {lowStock ? "Low Stock" : "In Stock"}
                      </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 text-white border border-white/10 group-hover:bg-black/50 transition-all duration-300">
                      <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 leading-tight">
                        {product.name || "Untitled Product"}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-1 mb-3 font-medium">
                        SKU: {product.sku}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-300">
                            Supplier:
                          </span>
                          <span className="text-white line-clamp-1 text-right">
                            {getSupplierName(product.supplierId)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-300">
                            Price:
                          </span>
                          <span className="text-white font-semibold">
                            {formatCurrencyShort(product.unitPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-300">
                            Stock:
                          </span>
                          <span
                            className={`font-semibold ${
                              lowStock ? "text-red-300" : "text-emerald-300"
                            }`}
                          >
                            {product.currentStock} {product.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user &&
                      (user.role === "admin" || user.role === "manager") && (
                        <div className="flex justify-between items-center gap-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(product);
                            }}
                            className="bg-white/90 text-slate-900 hover:bg-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex-1"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(product);
                              }}
                              className="bg-green-600/90 cursor-pointer hover:bg-green-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStockIn(product);
                              }}
                              className="bg-green-600/90 cursor-pointer hover:bg-green-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(product.id || product._id || ""); // Handle both id and _id
                              }}
                              className="bg-red-600/90 cursor-pointer hover:bg-red-500 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
