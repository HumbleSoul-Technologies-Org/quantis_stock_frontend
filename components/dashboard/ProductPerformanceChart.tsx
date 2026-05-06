"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pie } from "react-chartjs-2";
import {
  commonOptions,
  processCategoryPerformanceData,
} from "@/lib/chartUtils";
import { Trophy, TrendingUp, Package } from "lucide-react";
import { useState } from "react";
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
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        labels: {
          ...commonOptions.plugins.legend.labels,
          color: "var(--foreground)",
        },
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        titleColor: "var(--foreground)",
        bodyColor: "var(--foreground)",
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
  };

  const totalUnits = categoryData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = categoryData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  return (
    <Card className="dark:bg-slate-800 max-h-175 overflow-y-auto">
      <CardHeader>
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
            >
              By Sales
            </Button>
            <Button
              variant={metricType === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setMetricType("revenue")}
            >
              By Revenue
            </Button>
            <Button
              variant={timePeriod === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("daily")}
            >
              Daily
            </Button>
            <Button
              variant={timePeriod === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={timePeriod === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimePeriod("monthly")}
            >
              Monthly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalUnits.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Units Sold ({timePeriod})
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Revenue ({timePeriod})
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {topCategory ? topCategory.category : "No Sales Data"}
            </div>
            <div className="text-sm text-muted-foreground">Top Category</div>
          </div>
        </div>

        <div className="h-80">
          <Pie data={chartData} options={chartOptions} />
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>Category Performance</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Top 5 categories by{" "}
                {metricType === "sales" ? "units sold" : "revenue generated"}{" "}
                for {timePeriod}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {categoryData.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <div className="flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">
                      {category.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {category.sales} units •{" "}
                      {formatCurrency(category.revenue)}
                    </div>
                  </div>
                </div>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
