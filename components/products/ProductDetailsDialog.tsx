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
                      {product.category === "Other" && product.customCategory
                        ? product.customCategory
                        : product.category || "Uncategorized"}
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

          {(product.productType ||
            product.productStage ||
            product.packagingType ||
            product.productionLeadTime !== undefined ||
            product.expectedYield !== undefined ||
            product.productionCostPerUnit !== undefined ||
            product.batchSize !== undefined ||
            product.machineRequirements ||
            product.labourRequirement ||
            product.productionMethod ||
            product.qualityStandard ||
            product.inspectionRequirements ||
            product.shelfLife ||
            product.storageCondition ||
            product.complianceNotes ||
            product.recipe ||
            product.isFinishedGood ||
            (product.bom && product.bom.length > 0)) && (
            <Card className="border-2 border-green-200 dark:border-teal-700 dark:bg-slate-800">
              <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 dark:from-slate-700 dark:to-slate-600">
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-teal-100">
                  <Settings className="w-5 h-5" />
                  Manufacturing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.productType && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Product Type
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.productType}
                      </p>
                    </div>
                  )}
                  {product.productStage && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Product Stage
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.productStage}
                      </p>
                    </div>
                  )}
                  {product.packagingType && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Packaging Type
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.packagingType}
                      </p>
                    </div>
                  )}
                  {product.productionLeadTime !== undefined && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Production Lead Time
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.productionLeadTime} days
                      </p>
                    </div>
                  )}
                  {product.expectedYield !== undefined && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Expected Yield
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.expectedYield} {product.unit}
                      </p>
                    </div>
                  )}
                  {product.productionCostPerUnit !== undefined && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Production Cost per Unit
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {formatCurrency(product.productionCostPerUnit)}
                      </p>
                    </div>
                  )}
                  {product.batchSize !== undefined && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Batch Size
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.batchSize}
                      </p>
                    </div>
                  )}
                  {product.machineRequirements && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Machine Requirements
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.machineRequirements}
                      </p>
                    </div>
                  )}
                  {product.labourRequirement && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Labour Requirement
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.labourRequirement}
                      </p>
                    </div>
                  )}
                  {product.productionMethod && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Production Method
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.productionMethod}
                      </p>
                    </div>
                  )}
                  {product.qualityStandard && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Quality Standard
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.qualityStandard}
                      </p>
                    </div>
                  )}
                  {product.inspectionRequirements && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Inspection Requirements
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.inspectionRequirements}
                      </p>
                    </div>
                  )}
                  {product.shelfLife && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Shelf Life
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.shelfLife}
                      </p>
                    </div>
                  )}
                  {product.storageCondition && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Storage Condition
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.storageCondition}
                      </p>
                    </div>
                  )}
                  {product.complianceNotes && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Compliance Notes
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100 whitespace-pre-line">
                        {product.complianceNotes}
                      </p>
                    </div>
                  )}
                  {product.recipe && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Recipe / Formula
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100 whitespace-pre-line">
                        {product.recipe}
                      </p>
                    </div>
                  )}
                  {product.isFinishedGood !== undefined && (
                    <div className="space-y-1 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg md:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Finished Good
                      </p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">
                        {product.isFinishedGood ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                  {product.bom && product.bom.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Bill of Materials
                        </p>
                        <div className="space-y-2">
                          {product.bom.map((item, index) => (
                            <div
                              key={`${item.componentId}-${index}`}
                              className="flex flex-col sm:flex-row sm:justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-teal-700"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                  Component
                                </p>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                  {item.componentId || "Unknown"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                  Quantity
                                </p>
                                <p className="text-sm text-gray-600 dark:text-slate-400">
                                  {item.quantity} {item.unit || product.unit}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
