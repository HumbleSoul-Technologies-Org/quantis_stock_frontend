"use client";

import { Product, StockMovement } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle, Package, AlertTriangle } from "lucide-react";

interface InventoryStatsProps {
  products: Product[];
  movements: StockMovement[];
}

export function InventoryStats({ products, movements }: InventoryStatsProps) {
  // Calculate recent restocks (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRestocks = movements.filter(
    (m) => m.type === "in" && new Date(m.createdAt) > thirtyDaysAgo,
  ).length;

  // Calculate restocks needed
  const restocksNeeded = products.filter(
    (p) => p.currentStock <= p.reorderLevel,
  ).length;

  // Calculate total stock outs (amount of stock issued/removed)
  const totalStockOuts = movements
    .filter((m) => m.type === "out")
    .reduce((sum, m) => sum + m.quantity, 0);

  // Calculate total storage capacity
  const totalCapacity = products.reduce((sum, p) => sum + p.currentStock, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-green-50 dark:bg-slate-800 border-green-200 dark:border-teal-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-teal-300">
                Recent Restocks
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-teal-100 mt-2">
                {recentRestocks}
              </p>
              <p className="text-xs text-green-600 dark:text-teal-400 mt-1">
                Last 30 days
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 dark:text-teal-400 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-cyan-600">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-cyan-300">
                Restocks Needed
              </p>
              <p className="text-3xl font-bold text-amber-900 dark:text-cyan-100 mt-2">
                {restocksNeeded}
              </p>
              <p className="text-xs text-amber-600 dark:text-cyan-400 mt-1">
                Low stock items
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-amber-600 dark:text-cyan-400 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-slate-800 border-red-200 dark:border-red-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Stock Outs
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                {totalStockOuts}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Units issued
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-teal-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-teal-300">
                Total Storage
              </p>
              <p className="text-3xl font-bold text-blue-900 dark:text-teal-100 mt-2">
                {totalCapacity}
              </p>
              <p className="text-xs text-blue-600 dark:text-teal-400 mt-1">
                Units in stock
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-600 dark:text-teal-400 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
