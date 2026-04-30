"use client";

import { Product, Supplier } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/context/SettingsContext";
import { useFormatCurrencyShort } from "@/hooks/useFormatCurrencyShort";
import {
  Package,
  DollarSign,
  TrendingUp,
  User,
  FileText,
  Settings,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ProductDetailsDialogProps {
  isOpen: boolean;
  product?: Product;
  suppliers: Supplier[];
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsDialog({
  isOpen,
  product,
  suppliers,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const { formatCurrency } = useSettings();
  const formatCurrencyShort = useFormatCurrencyShort();

  if (!product) return null;

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

  const lowStock = product.currentStock <= product.reorderLevel;
  const imageUrl = product.image?.url || product.imageUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]  overflow-y-auto dark:bg-slate-900">
        <DialogHeader className="relative mt-10">
          <div
            className="absolute inset-0 bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-800 rounded-t-lg -z-10"
            style={{
              backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "overlay",
            }}
          />
          <div className="flex items-center gap-4 text-white bg-black/50 backdrop-blur-sm p-6  border border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {product.name}
              </DialogTitle>
              <p className="text-emerald-100">SKU: {product.sku}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
            <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Category
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {product.category || "Uncategorized"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Unit
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {product.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Status
                    </label>
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                      className="ml-2"
                    >
                      {product.status || "Active"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      SKU
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-slate-100 font-mono">
                      {product.sku}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Reorder Level
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {product.reorderLevel} {product.unit}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
            <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                <DollarSign className="w-5 h-5" />
                Pricing & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-slate-700 rounded-lg">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-teal-400" />
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Unit Price
                  </p>
                  <p className="text-2xl font-bold text-green-800 dark:text-teal-100">
                    {formatCurrency(product.unitPrice)}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Cost Price
                  </p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                    {formatCurrency(product.costPrice)}
                  </p>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${lowStock ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"}`}
                >
                  <Package className="w-8 h-8 mx-auto mb-2 text-current" />
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Current Stock
                  </p>
                  <p
                    className={`text-2xl font-bold ${lowStock ? "text-red-800 dark:text-red-300" : "text-emerald-800 dark:text-emerald-300"}`}
                  >
                    {product.currentStock} {product.unit}
                  </p>
                  {lowStock && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Low Stock</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
            <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                <User className="w-5 h-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-teal-900 flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    {getSupplierName(product.supplierId)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Supplier ID: {product.supplierId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
              <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                  <FileText className="w-5 h-5" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Product Image */}
          {imageUrl && (
            <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
              <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                  <ImageIcon className="w-5 h-5" />
                  Product Image
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-64 rounded-lg shadow-lg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Attributes */}
          {product.customAttributes &&
            Object.keys(product.customAttributes).length > 0 && (
              <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
                <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
                  <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                    <Settings className="w-5 h-5" />
                    Custom Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.customAttributes).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                        >
                          <span className="font-medium text-gray-700 dark:text-slate-300 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-gray-900 dark:text-slate-100">
                            {typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
