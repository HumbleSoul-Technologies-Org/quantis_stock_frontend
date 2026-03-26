"use client";

import { Product, StockMovement } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertCircle, Package } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface InventoryStatsProps {
  products: Product[];
  movements: StockMovement[];
}

export function InventoryStats({ products, movements }: InventoryStatsProps) {
  const { settings, getCurrencySymbol } = useSettings();

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

  // Calculate total storage capacity
  const totalCapacity = products.reduce((sum, p) => sum + p.currentStock, 0);

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-green-50 dark:from-teal-900 to-green-100 dark:to-slate-800 border-green-200 dark:border-teal-700">
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

      <Card className="bg-gradient-to-br from-amber-50 dark:from-slate-800 to-amber-100 dark:to-slate-900 border-amber-200 dark:border-cyan-600">
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

      <Card className="bg-gradient-to-br from-blue-50 dark:from-slate-800 to-blue-100 dark:to-teal-900 border-blue-200 dark:border-teal-700">
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
