"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar, Pie } from "react-chartjs-2";
import { commonOptions, processLossAnalysisData } from "@/lib/chartUtils";
import { AlertTriangle, TrendingDown, PieChart } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type ChartType = "bar" | "pie";

export function LossAnalysisChart() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const { stockMovements, saleReturns } = useData();
  const { formatCurrency } = useSettings();

  // Process real loss data from stock movements and returns
  const lossesData = processLossAnalysisData(stockMovements, saleReturns);

  const barChartData = {
    labels: lossesData.map((item) => item.reason),
    datasets: [
      {
        label: "Loss Value ($)",
        data: lossesData.map((item) => item.value),
        backgroundColor: [
          "var(--chart-3)", // Damage - red
          "var(--chart-4)", // Expiry - orange
          "var(--chart-5)", // Theft - yellow
          "var(--chart-2)", // Other - green
        ],
        borderColor: [
          "var(--chart-3)",
          "var(--chart-4)",
          "var(--chart-5)",
          "var(--chart-2)",
        ],
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
        backgroundColor: [
          "var(--chart-3)", // Damage - red
          "var(--chart-4)", // Expiry - orange
          "var(--chart-5)", // Theft - yellow
          "var(--chart-2)", // Other - green
        ],
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
          text: "Loss Value ($)",
          color: "var(--foreground)",
        },
        ticks: {
          callback: function (value: any) {
            return `$${(value / 1000).toFixed(0)}k`;
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
  };

  const totalLosses = lossesData.reduce((sum, item) => sum + item.value, 0);
  const highestLossReason =
    lossesData.length > 0
      ? lossesData.reduce((max, item) => (item.value > max.value ? item : max))
      : { reason: "N/A", value: 0, percentage: 0 };

  return (
    <Card>
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
            >
              Bar Chart
            </Button>
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
            >
              <PieChart className="h-4 w-4 mr-1" />
              Pie Chart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLosses)}
            </div>
            <div className="text-sm text-muted-foreground">Total Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {highestLossReason.reason}
            </div>
            <div className="text-sm text-muted-foreground">
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

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <TrendingDown className="h-3 w-3" />
                <span>Stock Damage Tracking</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Losses calculated from stock movements with damage reason
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {lossesData.map((item, index) => (
              <div key={item.reason} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: [
                      "var(--chart-3)",
                      "var(--chart-4)",
                      "var(--chart-5)",
                      "var(--chart-2)",
                    ][index],
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
