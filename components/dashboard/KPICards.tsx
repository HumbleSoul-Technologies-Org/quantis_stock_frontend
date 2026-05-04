"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  formatPercentage,
  processKPIData,
  getStockMovementLossValue,
  getDailyRevenueTrend,
  getDailySalesCountTrend,
  getDailyLossTrend,
  getDailyInventoryValueTrend,
} from "@/lib/chartUtils";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  formatCurrency: (value: number) => string;
}

function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  sparklineData,
  formatCurrency,
}: KPICardProps) {
  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
      line: {
        borderWidth: 2,
        borderColor:
          trend === "up"
            ? "var(--chart-1)"
            : trend === "down"
              ? "var(--chart-3)"
              : "var(--chart-2)",
      },
    },
  };

  const sparklineChartData = {
    labels: sparklineData?.map((_, i) => i.toString()) || [],
    datasets: [
      {
        data: sparklineData || [],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  return (
    <Card className="relative dark:bg-slate-800 dark:border-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {typeof value === "number" && title !== "Total Sales"
                ? formatCurrency(value)
                : value}
            </div>
            {change !== undefined && (
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    trend === "up"
                      ? "default"
                      : trend === "down"
                        ? "destructive"
                        : "secondary"
                  }
                  className="flex items-center space-x-1"
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  <span className="text-xs">{formatPercentage(change)}</span>
                </Badge>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {sparklineData && (
            <div className="h-12 w-24">
              <Line data={sparklineChartData} options={sparklineOptions} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueKPICard() {
  const { sales, products, stockMovements } = useData();
  const { formatCurrency } = useSettings();
  const kpiData = processKPIData(sales, products, stockMovements);

  // Generate sparkline data from recent sales (last 7 days) using real sales history
  const recentSales = getDailyRevenueTrend(sales, 7);

  return (
    <KPICard
      title="Total Revenue"
      value={kpiData.revenue.value}
      change={kpiData.revenue.change}
      changeLabel="vs last month"
      icon={<DollarSign className="h-4 w-4" />}
      trend={kpiData.revenue.change >= 0 ? "up" : "down"}
      sparklineData={recentSales.length > 0 ? recentSales : undefined}
      formatCurrency={formatCurrency}
    />
  );
}

export function SalesKPICard() {
  const { sales, products, stockMovements } = useData();
  const { formatCurrency } = useSettings();
  const kpiData = processKPIData(sales, products, stockMovements);

  // Generate sparkline data from recent sales counts (last 7 days) using real sales history
  const sparklineData = getDailySalesCountTrend(sales, 7);

  return (
    <KPICard
      title="Total Sales"
      value={kpiData.sales.value}
      change={kpiData.sales.change}
      changeLabel="vs last month"
      icon={<ShoppingCart className="h-4 w-4" />}
      trend={kpiData.sales.change >= 0 ? "up" : "down"}
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}

export function LossesKPICard() {
  const { sales, products, stockMovements, saleReturns } = useData();
  const { formatCurrency } = useSettings();
  const kpiData = processKPIData(sales, products, stockMovements);

  // Generate sparkline data from recent loss activity (last 7 days) using real movement and return history
  const sparklineData = getDailyLossTrend(
    stockMovements,
    saleReturns,
    products,
    7,
  );

  return (
    <KPICard
      title="Total Losses"
      value={kpiData.losses.value}
      change={kpiData.losses.change}
      changeLabel="this month"
      icon={<AlertTriangle className="h-4 w-4" />}
      trend={kpiData.losses.change >= 0 ? "down" : "up"}
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}

export function InventoryValueKPICard() {
  const { sales, products, stockMovements } = useData();
  const { formatCurrency } = useSettings();
  const kpiData = processKPIData(sales, products, stockMovements);

  // Calculate low stock items
  const lowStockCount = products.filter(
    (product) => product.currentStock <= product.reorderLevel,
  ).length;

  // Generate sparkline data from recent inventory value history (last 7 days)
  const sparklineData = getDailyInventoryValueTrend(
    products,
    stockMovements,
    7,
  );

  return (
    <KPICard
      title="Inventory Value"
      value={kpiData.inventory.value}
      change={kpiData.inventory.change}
      changeLabel={`${lowStockCount} low stock items`}
      icon={<Package className="h-4 w-4" />}
      trend={kpiData.inventory.change >= 0 ? "up" : "down"}
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}
