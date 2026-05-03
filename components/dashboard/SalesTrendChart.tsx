"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Line } from "react-chartjs-2";
import { commonOptions, processSalesTrendData } from "@/lib/chartUtils";
import { CalendarDays, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type TimePeriod = "daily" | "weekly" | "monthly";

export function SalesTrendChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const { sales } = useData();
  const { formatCurrency } = useSettings();

  // Process real sales data
  const salesData = processSalesTrendData(sales, timePeriod);

  const chartData = {
    labels:
      timePeriod === "monthly"
        ? salesData.map((item) => ("month" in item ? item.month : item.period))
        : salesData.map((item) => ("period" in item ? item.period : "")),
    datasets: [
      {
        label: "Sales Count",
        data: salesData.map((item) => item.sales),
        borderColor: "var(--chart-1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "var(--chart-1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Revenue",
        data: salesData.map((item) => item.revenue),
        borderColor: "var(--chart-2)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "var(--chart-2)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    ...commonOptions,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `Sales: ${context.parsed.y.toLocaleString()}`;
            } else {
              return `Revenue: ${formatCurrency(context.parsed.y)}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        ...commonOptions.scales.x,
        title: {
          display: true,
          text:
            timePeriod === "monthly"
              ? "Month"
              : timePeriod === "weekly"
                ? "Week"
                : "Date",
          color: "var(--foreground)",
        },
      },
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: "Sales Count",
          color: "var(--foreground)",
        },
        ticks: {
          callback: function (value: any) {
            return value.toLocaleString();
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Revenue ($)",
          color: "var(--foreground)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "var(--foreground)",
          callback: function (value: any) {
            return `$${(value / 1000).toFixed(0)}k`;
          },
        },
      },
    },
  };

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const avgPeriodSales =
    salesData.length > 0 ? Math.round(totalSales / salesData.length) : 0;
  const avgPeriodRevenue =
    salesData.length > 0 ? Math.round(totalRevenue / salesData.length) : 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Sales Trend (Jan-Dec)</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={timePeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={timePeriod === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={timePeriod === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("daily")}
            >
              Daily
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Sales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(avgPeriodRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Avg{" "}
              {timePeriod === "monthly"
                ? "Monthly"
                : timePeriod === "weekly"
                  ? "Weekly"
                  : "Daily"}{" "}
              Revenue
            </div>
          </div>
        </div>

        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CalendarDays className="h-3 w-3" />
              <span>2026 YTD</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Showing sales performance across all months
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
