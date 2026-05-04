"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const currencySymbol = getCurrencySymbol();

  // Process real sales data
  const salesData = processSalesTrendData(sales, timePeriod);

  const chartData = {
    labels:
      timePeriod === "monthly"
        ? salesData.map((item) =>
            "month" in item
              ? item.month
              : "period" in item
                ? item.period
                : "dayLabel" in item
                  ? item.dayLabel
                  : "hourLabel" in item
                    ? item.hourLabel
                    : "",
          )
        : timePeriod === "weekly"
          ? salesData.map((item) => ("dayLabel" in item ? item.dayLabel : ""))
          : salesData.map((item) =>
              "hourLabel" in item ? item.hourLabel : "",
            ),
    datasets: [
      {
        label: "Sales Count",
        data: salesData.map((item) => item.sales),
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20, 184, 166, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#14b8a6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Revenue",
        data: salesData.map((item) => item.revenue),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
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
                ? "Day"
                : "Time",
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
          text: `Revenue (${currencySymbol})`,
          color: "var(--foreground)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "var(--foreground)",
          callback: function (value: any) {
            const numericValue = Number(value);
            if (numericValue >= 1_000_000) {
              return `${currencySymbol}${(numericValue / 1_000_000).toFixed(1)}M`;
            }
            if (numericValue >= 1_000) {
              return `${currencySymbol}${(numericValue / 1000).toFixed(0)}k`;
            }
            return `${currencySymbol}${numericValue}`;
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
    <Card className="col-span-full dark:bg-slate-800 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Sales Trend (Jan-Dec)</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-40 py-2">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
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
