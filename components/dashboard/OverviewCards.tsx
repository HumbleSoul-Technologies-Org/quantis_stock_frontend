"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertCircle, TrendingUp } from "lucide-react";

function OverviewCardsContent() {
  const { products, sales } = useData();
  const { formatCurrency } = useSettings();

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.unitPrice,
    0,
  );
  const totalSales = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const lowStockItems = products.filter(
    (p) => p.currentStock <= p.reorderLevel,
  );
  const totalProducts = products.length;

  const cards = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Sales",
      value: formatCurrency(totalSales),
      icon: ShoppingCart,
      color: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Inventory Value",
      value: formatCurrency(totalInventoryValue),
      icon: TrendingUp,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length.toString(),
      icon: AlertCircle,
      color: "bg-red-50",
      iconColor: lowStockItems.length > 0 ? "text-red-600" : "text-gray-600",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`${card.borderColor} border-2 bg-white dark:bg-slate-800`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">
                {card.title}
              </CardTitle>
              <div
                className={`${card.color} dark:bg-opacity-20 p-2 rounded-lg`}
              >
                <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-teal-100 break-words">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function OverviewCards() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <OverviewCardsContent />;
}
