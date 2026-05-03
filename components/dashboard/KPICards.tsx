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
import { formatPercentage, processKPIData } from "@/lib/chartUtils";
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
    <Card className="relative overflow-hidden">
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
              {typeof value === "number" ? formatCurrency(value) : value}
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

  // Generate sparkline data from recent sales (last 7 days)
  const recentSales = sales
    .filter((sale) => {
      const saleDate = new Date(sale.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return saleDate >= weekAgo;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((sale) => sale.totalAmount);

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

  // Generate sparkline data from recent sales counts (last 7 days)
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const sparklineData = recentDays.map((date) => {
    return sales.filter((sale) => sale.date.startsWith(date)).length;
  });

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
  const { sales, products, stockMovements } = useData();
  const { formatCurrency } = useSettings();
  const kpiData = processKPIData(sales, products, stockMovements);

  // Generate sparkline data from recent stock movements (last 7 days)
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const sparklineData = recentDays.map((date) => {
    return stockMovements
      .filter(
        (movement) =>
          movement.createdAt?.startsWith(date) &&
          ["damage", "expiry", "theft"].some((reason) =>
            movement.reason?.toLowerCase().includes(reason),
          ),
      )
      .reduce((sum, movement) => sum + movement.quantity * 10, 0); // Assuming average cost
  });

  return (
    <KPICard
      title="Total Losses"
      value={kpiData.losses.value}
      change={0} // For losses, we don't calculate change the same way
      changeLabel="this month"
      icon={<AlertTriangle className="h-4 w-4" />}
      trend="neutral"
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}

export function InventoryValueKPICard() {
  const { products } = useData();
  const { formatCurrency } = useSettings();

  // Calculate total inventory value
  const totalValue = products.reduce(
    (sum, product) => sum + product.currentStock * product.unitPrice,
    0,
  );

  // Calculate low stock items
  const lowStockCount = products.filter(
    (product) => product.currentStock <= product.reorderLevel,
  ).length;

  // Generate sparkline data (mock for now - could be historical inventory values)
  const sparklineData = Array.from({ length: 7 }, () =>
    Math.floor(totalValue * (0.95 + Math.random() * 0.1)),
  );

  return (
    <KPICard
      title="Inventory Value"
      value={totalValue}
      change={0} // Could calculate vs previous period
      changeLabel={`${lowStockCount} low stock items`}
      icon={<Package className="h-4 w-4" />}
      trend="neutral"
      sparklineData={sparklineData}
      formatCurrency={formatCurrency}
    />
  );
}
