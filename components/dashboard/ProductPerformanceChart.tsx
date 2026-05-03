"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bar } from "react-chartjs-2";
import { commonOptions, processProductPerformanceData } from "@/lib/chartUtils";
import { Trophy, TrendingUp, Package } from "lucide-react";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";

type MetricType = "sales" | "revenue";

export function ProductPerformanceChart() {
  const [metricType, setMetricType] = useState<MetricType>("sales");
  const { sales, products } = useData();
  const { formatCurrency } = useSettings();

  // Process real product performance data
  const productsData = processProductPerformanceData(sales, products);

  const chartData = {
    labels: productsData.map((item) =>
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
    ),
    datasets: [
      {
        label: metricType === "sales" ? "Units Sold" : "Revenue ($)",
        data: productsData.map((item) =>
          metricType === "sales" ? item.sales : item.revenue,
        ),
        backgroundColor: productsData.map((_, index) => {
          const colors = [
            "var(--chart-1)",
            "var(--chart-2)",
            "var(--chart-3)",
            "var(--chart-4)",
            "var(--chart-5)",
          ];
          return colors[index % colors.length];
        }),
        borderColor: productsData.map((_, index) => {
          const colors = [
            "var(--chart-1)",
            "var(--chart-2)",
            "var(--chart-3)",
            "var(--chart-4)",
            "var(--chart-5)",
          ];
          return colors[index % colors.length];
        }),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    ...commonOptions,
    indexAxis: "y" as const, // Horizontal bar chart
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            const product = productsData[context.dataIndex];
            const value = context.parsed.x;
            return [
              `${product.name}`,
              `${metricType === "sales" ? "Units Sold" : "Revenue"}: ${metricType === "sales" ? value.toLocaleString() : formatCurrency(value)}`,
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
          text: metricType === "sales" ? "Units Sold" : "Revenue ($)",
          color: "var(--foreground)",
        },
        ticks: {
          callback: function (value: any) {
            return metricType === "sales"
              ? value.toLocaleString()
              : `$${(value / 1000).toFixed(0)}k`;
          },
        },
      },
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: "Products",
          color: "var(--foreground)",
        },
      },
    },
  };

  const totalUnits = productsData.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = productsData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const topProduct = productsData.length > 0 ? productsData[0] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg">Top Products</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
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
              Total Units Sold
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {topProduct
                ? topProduct.name.length > 12
                  ? topProduct.name.substring(0, 12) + "..."
                  : topProduct.name
                : "No Sales Data"}
            </div>
            <div className="text-sm text-muted-foreground">Best Seller</div>
          </div>
        </div>

        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>Product Performance</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                Top 5 products by{" "}
                {metricType === "sales" ? "units sold" : "revenue generated"}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {productsData.slice(0, 3).map((product, index) => (
              <div
                key={product.name}
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
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {product.sales} units • {formatCurrency(product.revenue)}
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
