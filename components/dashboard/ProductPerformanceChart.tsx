"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pie } from "react-chartjs-2";
import {
  getCommonOptions,
  processCategoryPerformanceData,
} from "@/lib/chartUtils";
import {
  Trophy,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Target,
} from "lucide-react";
import { useState, useContext } from "react";
import { ThemeContext } from "@/components/theme-provider";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type MetricType = "sales" | "revenue";
type TimePeriod = "daily" | "weekly" | "monthly";

export function ProductPerformanceChart() {
  const [metricType, setMetricType] = useState<MetricType>("sales");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  const { sales, products } = useData();
  const { formatCurrency } = useSettings();

  const categoryData = processCategoryPerformanceData(
    sales,
    products,
    metricType,
    timePeriod,
  );
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const chartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: metricType === "sales" ? "Units Sold" : "Revenue",
        data: categoryData.map((item) =>
          metricType === "sales" ? item.sales : item.revenue,
        ),
        backgroundColor: [
          "#4F46E5",
          "#22C55E",
          "#F59E0B",
          "#E11D48",
          "#0EA5E9",
        ].slice(0, categoryData.length),
        borderColor: [
          "#4338CA",
          "#16A34A",
          "#CA8A04",
          "#BE123C",
          "#0284C7",
        ].slice(0, categoryData.length),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    ...getCommonOptions(theme),
    plugins: {
      ...getCommonOptions(theme).plugins,
      legend: {
        ...getCommonOptions(theme).plugins.legend,
        labels: {
          ...getCommonOptions(theme).plugins.legend.labels,
          color: getCommonOptions(theme).color,
        },
      },
      tooltip: {
        ...getCommonOptions(theme).plugins.tooltip,
        backgroundColor:
          theme === "dark"
            ? "rgba(15, 23, 42, 0.95)"
            : getCommonOptions(theme).plugins.tooltip.backgroundColor,
        titleColor: getCommonOptions(theme).plugins.tooltip.titleColor,
        bodyColor: getCommonOptions(theme).plugins.tooltip.bodyColor,
        labelTextColor: getCommonOptions(theme).plugins.tooltip.bodyColor,
        borderColor: getCommonOptions(theme).plugins.tooltip.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            const category = categoryData[context.dataIndex];
            const value = context.parsed || 0;
            return [
              `${category.category}`,
              `${metricType === "sales" ? "Units Sold" : "Revenue"}: ${metricType === "sales" ? value.toLocaleString() : formatCurrency(value)}`,
            ];
          },
        },
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
  };

  const totalUnits = categoryData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = categoryData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  return (
    <Card className="dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden min-h-[30rem]">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={metricType === "sales" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetricType("sales")}
              className="rounded-full"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              By Sales
            </Button>
            <Button
              variant={metricType === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetricType("revenue")}
              className="rounded-full"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              By Revenue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalUnits.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Units Sold ({timePeriod})
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Revenue ({timePeriod})
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {topCategory ? topCategory.category : "No Sales Data"}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Top Category
            </div>
          </div>
        </div>

        <div className="h-80">
          <Pie key={theme} data={chartData} options={chartOptions} redraw />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Category Performance</span>
              </Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Top 5 categories by{" "}
                {metricType === "sales" ? "units sold" : "revenue generated"}{" "}
                for {timePeriod}
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-2">
            {categoryData.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 p-0 flex items-center justify-center text-xs bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {category.category}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {category.sales} units •{" "}
                      {formatCurrency(category.revenue)}
                    </div>
                  </div>
                </div>
                <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
