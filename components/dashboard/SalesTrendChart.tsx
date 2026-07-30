"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Line } from "react-chartjs-2";
import { getCommonOptions, processSalesTrendData } from "@/lib/chartUtils";
import {
  CalendarDays,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Calendar,
  Clock,
} from "lucide-react";
import { useState, useContext } from "react";
import { ThemeContext } from "@/components/theme-provider";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type TimePeriod = "daily" | "weekly" | "monthly";

export function SalesTrendChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const { sales } = useData();
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const currencySymbol = getCurrencySymbol();
  const { theme } = useContext(ThemeContext) || { theme: "light" };
  const commonOptions = getCommonOptions(theme);
  const axisLabelColor = commonOptions.color;

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
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(20, 184, 166, 0.15)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, "rgba(20, 184, 166, 0.3)");
          gradient.addColorStop(1, "rgba(20, 184, 166, 0.05)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#14b8a6",
        pointBorderColor: theme === "dark" ? "#fff" : "#000000",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        shadowColor: "rgba(20, 184, 166, 0.5)",
        shadowBlur: 10,
      },
      {
        label: "Revenue",
        data: salesData.map((item) => item.revenue),
        borderColor: "#3b82f6",
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(59, 130, 246, 0.15)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.05)");
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: theme === "dark" ? "#fff" : "#000000",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        shadowColor: "rgba(59, 130, 246, 0.5)",
        shadowBlur: 10,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    ...getCommonOptions(theme),
    animation: {
      duration: 1200,
      easing: "easeOutQuart" as const,
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        labels: {
          ...commonOptions.plugins.legend.labels,
          color: axisLabelColor,
        },
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        backgroundColor:
          theme === "dark"
            ? "rgba(15, 23, 42, 0.95)"
            : commonOptions.plugins.tooltip.backgroundColor,
        titleColor: axisLabelColor,
        bodyColor: axisLabelColor,
        labelTextColor: axisLabelColor,
        borderColor: commonOptions.plugins.tooltip.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function (context: any) {
            return context[0].label;
          },
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `Sales Count: ${context.parsed.y.toLocaleString()}`;
            } else {
              return `Revenue: ${formatCurrency(context.parsed.y)}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        ...getCommonOptions(theme).scales.x,
        title: {
          display: true,
          text:
            timePeriod === "monthly"
              ? "Month"
              : timePeriod === "weekly"
                ? "Day"
                : "Time",
          color: axisLabelColor,
        },
      },
      y: {
        ...getCommonOptions(theme).scales.y,
        title: {
          display: true,
          text: "Sales Count",
          color: axisLabelColor,
        },
        ticks: {
          color: axisLabelColor,
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
          color: axisLabelColor,
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: axisLabelColor,
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
    <Card className="dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden min-h-[30rem]">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Sales Trend (Jan-Dec)</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={timePeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("monthly")}
              className="rounded-full"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Monthly
            </Button>
            <Button
              variant={timePeriod === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("weekly")}
              className="rounded-full"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Weekly
            </Button>
            <Button
              variant={timePeriod === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("daily")}
              className="rounded-full"
            >
              <Clock className="h-4 w-4 mr-1" />
              Daily
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-linear-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {totalSales.toLocaleString()}
            </div>
            <div className="text-sm text-teal-600 dark:text-teal-400">
              Total Sales
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total Revenue
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(avgPeriodRevenue)}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
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

        <div className="h-64 md:h-80 lg:h-96">
          <Line key={theme} data={chartData} options={chartOptions} redraw />
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            >
              <CalendarDays className="h-3 w-3" />
              <span>2026 YTD</span>
            </Badge>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Showing sales performance across all months
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
