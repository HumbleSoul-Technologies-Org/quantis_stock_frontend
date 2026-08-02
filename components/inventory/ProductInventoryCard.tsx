"use client";

import { Product, StockMovement } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSettings } from "@/context/SettingsContext";
import { format } from "date-fns";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProductInventoryCardProps {
  product: Product;
  movements: StockMovement[];
  onStockIn: (product: Product) => void;
}

export function ProductInventoryCard({
  product,
  movements,
  onStockIn,
}: ProductInventoryCardProps) {
  const { settings, getDecimalPlaces } = useSettings();
  const { user } = useAuth();

  const lastMovement = movements
    .filter(
      (m) => m.productId === product.id || m.productId === (product as any)._id,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )[0];

  const lastRestockDate = lastMovement
    ? format(new Date(lastMovement.createdAt!), "MMM dd, yyyy")
    : "Never";

  const safeReorderLevel = Math.max(0, product.reorderLevel || 0);
  const maxStock =
    safeReorderLevel > 0
      ? safeReorderLevel
      : Math.max(1, product.currentStock, 1);
  const rawPercentage =
    maxStock > 0 ? (product.currentStock / maxStock) * 100 : 0;
  const stockPercentage = Math.max(
    0,
    Math.min(Number.isNaN(rawPercentage) ? 0 : rawPercentage, 100),
  );

  const isLowStock = product.currentStock <= safeReorderLevel;

  // ✅ Pie chart now behaves like a progress ring
  const pieData = [
    { name: "Stock", value: stockPercentage },
    { name: "Remaining", value: 100 - stockPercentage },
  ];

  // ✅ Dynamic color based on stock level
  const getStockColor = (percentage: number) => {
    if (percentage < 15) return "#dc2626"; // red
    if (percentage < 30) return "#f97316"; // orange
    if (percentage < 50) return "#eab308"; // yellow
    return "#16a34a"; // green
  };

  const stockColor = getStockColor(stockPercentage);

  return (
    <Card className="border border-gray-200 dark:border-teal-700 bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-teal-900/50 transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-teal-100">
              {product.name}
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              SKU: {product.sku}
            </p>
          </div>
          {isLowStock && (
            <Badge className="flex items-center gap-1 bg-red-600 text-white">
              <AlertCircle className="w-3 h-3" /> Low
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ✅ Animated Progress Pie */}
        <div className="h-36 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
              >
                <Cell fill={stockColor} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* ✅ Percentage Label in Center */}
          <div className="absolute text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-teal-200">
              {Math.round(stockPercentage)}%
            </p>
            <p className="text-xs text-gray-500">Stock</p>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Category:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {product.category === "Other" && product.customCategory
                ? product.customCategory
                : product.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">
              Units Remaining:
            </span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {product.currentStock} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">
              Reorder Level:
            </span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {product.reorderLevel} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">
              Unit Price:
            </span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {settings?.currency?.symbol} {product.unitPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">
              Last Restock:
            </span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {lastRestockDate}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {/* {user && (user.role === "admin" || user.role === "manager") && (
          <button
            onClick={() => onStockIn(product)}
            className="w-full mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Stock In
          </button>
        )} */}
      </CardContent>
    </Card>
  );
}
