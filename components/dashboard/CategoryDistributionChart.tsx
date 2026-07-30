"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Doughnut } from "react-chartjs-2";
import {
  getCommonOptions,
  processCategoryDistributionData,
} from "@/lib/chartUtils";
import { PieChart, BarChart3, Package } from "lucide-react";
import { useState, useContext } from "react";
import { ThemeContext } from "@/components/theme-provider";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type MetricType = "count" | "stock_value";

export function CategoryDistributionChart() {
  const [metricType, setMetricType] = useState<MetricType>("count");
  const { products } = useData();
  const { formatCurrency } = useSettings();

  const categoryData = processCategoryDistributionData(products, metricType);
  const { theme } = useContext(ThemeContext) || { theme: "light" };

  const chartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        data: categoryData.map((item) => item.value),
        backgroundColor: [
          "#4F46E5",
          "#22C55E",
          "#F59E0B",
          "#E11D48",
          "#0EA5E9",
          "#8B5CF6",
          "#10B981",
          "#F97316",
          "#EF4444",
          "#06B6D4",
        ].slice(0, categoryData.length),
        borderColor: theme === "dark" ? "#fff" : "#000000",
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    ...getCommonOptions(theme),
    plugins: {
      ...getCommonOptions(theme).plugins,
      legend: {
        ...getCommonOptions(theme).plugins.legend,
        position: "right" as const,
        labels: {
          ...getCommonOptions(theme).plugins.legend.labels,
          padding: 15,
          usePointStyle: true,
        },
      },
      filler: {
        propagate: false,
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
            const value = context.parsed;
            const percentage = category.percentage.toFixed(1);
            return [
              `${category.category}`,
              `${metricType === "count" ? "Products" : "Stock Value"}: ${metricType === "count" ? value.toLocaleString() : formatCurrency(value)}`,
              `Percentage: ${percentage}%`,
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
    cutout: "60%",
  };

  const totalCategories = categoryData.length;
  const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden min-h-[30rem]">
      <CardHeader className="p-5 sm:p-6 pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={metricType === "count" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetricType("count")}
              className="rounded-full"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              By Count
            </Button>
            <Button
              variant={metricType === "stock_value" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetricType("stock_value")}
              className="rounded-full"
            >
              <Package className="h-4 w-4 mr-1" />
              By Value
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <PieChart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalCategories}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total Categories
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {metricType === "count"
                ? totalValue.toLocaleString()
                : formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Total {metricType === "count" ? "Products" : "Stock Value"}
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
            <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {categoryData.length > 0 ? categoryData[0].category : "N/A"}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Top Category
            </div>
          </div>
        </div>

        <div className="relative h-80">
          <Doughnut
            key={theme}
            data={chartData}
            options={chartOptions}
            redraw
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {totalCategories}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Categories
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              >
                <Package className="h-3 w-3" />
                <span>Inventory Overview</span>
              </Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Distribution of all product categories in inventory
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {categoryData.slice(0, 8).map((category, index) => (
              <div
                key={category.category}
                className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      chartData.datasets[0].backgroundColor[index],
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                    {category.category}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
