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
  accentColor?: string;
  theme?: "blue" | "teal" | "red" | "purple";
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
  accentColor = "from-slate-400 to-slate-500",
  theme = "blue",
}: KPICardProps) {
  const themeMap: Record<
    string,
    { accent: string; line: string; fill: string }
  > = {
    blue: {
      accent: "from-blue-400 to-sky-500",
      line: "rgba(59, 130, 246, 0.95)",
      fill: "rgba(59, 130, 246, 0.18)",
    },
    teal: {
      accent: "from-emerald-400 to-teal-500",
      line: "rgba(16, 185, 129, 0.95)",
      fill: "rgba(16, 185, 129, 0.18)",
    },
    red: {
      accent: "from-rose-400 to-red-500",
      line: "rgba(244, 63, 94, 0.95)",
      fill: "rgba(244, 63, 94, 0.18)",
    },
    purple: {
      accent: "from-violet-500 to-fuchsia-500",
      line: "rgba(168, 85, 247, 0.95)",
      fill: "rgba(168, 85, 247, 0.18)",
    },
  };

  const themeConfig = themeMap[theme] ?? {
    accent: accentColor,
    line: "rgba(56, 189, 248, 0.95)",
    fill: "rgba(56, 189, 248, 0.16)",
  };

  const accentClasses = themeConfig.accent;
  const sparklineColor = themeConfig.line;
  const sparklineFill = themeConfig.fill;

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
    layout: {
      padding: 0,
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
        borderWidth: 3,
        borderColor: sparklineColor,
      },
    },
  };

  const sparklineChartData = {
    labels: sparklineData?.map((_, i) => i.toString()) || [],
    datasets: [
      {
        data: sparklineData || [],
        fill: true,
        tension: 0.35,
        backgroundColor: sparklineFill,
        borderColor: sparklineColor,
      },
    ],
  };

  const trendBadgeVariant =
    trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary";

  const displayValue =
    typeof value === "number" && title !== "Total Sales"
      ? formatCurrency(value)
      : value;

  return (
    <Card className="flex h-full flex-col min-h-[18rem] relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/95 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.18)] transition hover:shadow-[0_24px_70px_-24px_rgba(15,23,42,0.25)] dark:border-slate-700/70 dark:bg-slate-950/80">
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${accentClasses}`}
      />
      <CardHeader className="flex flex-col justify-between gap-4 px-6 pt-5 pb-3 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            {title}
          </CardTitle>
          {changeLabel && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {changeLabel}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {displayValue}
            </div>
            {change !== undefined && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={trendBadgeVariant}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : trend === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {formatPercentage(change)}
                </Badge>
                {changeLabel && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {sparklineData && (
            <div className="relative h-20 w-full sm:w-36 sm:max-w-[10rem]">
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
      theme="blue"
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
      theme="teal"
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
      theme="red"
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
      theme="purple"
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}
