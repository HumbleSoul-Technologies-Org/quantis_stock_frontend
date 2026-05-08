"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, Pie } from "react-chartjs-2";
import { commonOptions, processLossAnalysisData } from "@/lib/chartUtils";
import {
  AlertTriangle,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Target,
} from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type ChartType = "bar" | "pie";

export function LossAnalysisChart() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const { stockMovements, saleReturns, products } = useData();
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const currencySymbol = getCurrencySymbol();

  // Process real loss data from stock movements and returns
  const lossesData = processLossAnalysisData(
    stockMovements,
    saleReturns,
    products,
  );

  const lossColors = [
    "red", // Damage
    "crimson", // Expiry
    "orange", // Theft
    "yellow", // Other
  ];

  const barChartData = {
    labels: lossesData.map((item) => item.reason),
    datasets: [
      {
        label: `Loss Value (${currencySymbol})`,
        data: lossesData.map((item) => item.value),
        backgroundColor: lossColors,
        borderColor: lossColors,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const pieChartData = {
    labels: lossesData.map((item) => `${item.reason} (${item.percentage}%)`),
    datasets: [
      {
        data: lossesData.map((item) => item.value),
        backgroundColor: lossColors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const barChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const percentage = lossesData[context.dataIndex].percentage;
            return [
              `Value: ${formatCurrency(value)}`,
              `Percentage: ${percentage}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ...commonOptions.scales.x,
        title: {
          display: true,
          text: "Loss Reason",
          color: "var(--foreground)",
        },
      },
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: `Loss Value (${currencySymbol})`,
          color: "var(--foreground)",
        },
        ticks: {
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

  const pieChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: "right" as const,
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const percentage = lossesData[context.dataIndex].percentage;
            return [
              `${context.label}`,
              `Value: ${formatCurrency(value)}`,
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
  };

  const totalLosses = lossesData.reduce((sum, item) => sum + item.value, 0);
  const highestLossReason =
    lossesData.length > 0
      ? lossesData.reduce((max, item) => (item.value > max.value ? item : max))
      : { reason: "N/A", value: 0, percentage: 0 };

  return (
    <Card className=" dark:bg-slate-800 ">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Loss Analysis</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="rounded-full"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Bar Chart
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
              className="rounded-full"
            >
              <PieChart className="h-4 w-4 mr-1" />
              Pie Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(totalLosses)}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              Total Losses
            </div>
          </div>
          <div className="text-center p-4 bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
            <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {highestLossReason.reason}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Highest Loss Category ({highestLossReason.percentage}%)
            </div>
          </div>
        </div>

        <div className="h-80">
          {chartType === "bar" ? (
            <Bar data={barChartData} options={barChartOptions} />
          ) : (
            <Pie data={pieChartData} options={pieChartOptions} />
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              >
                <TrendingDown className="h-3 w-3" />
                <span>Stock Damage Tracking</span>
              </Badge>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Losses calculated from stock movements with damage reason
              </span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lossesData.map((item, index) => (
              <div key={item.reason} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: lossColors[index],
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {item.reason}: {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
