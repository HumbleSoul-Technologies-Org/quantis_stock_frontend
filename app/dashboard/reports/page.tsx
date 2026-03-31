"use client";

import { useData } from "@/context/DataContext";
import { useSettings } from "@/context/SettingsContext";
import { ClientOnly } from "@/components/client-only";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, TrendingUp } from "lucide-react";
import { useState } from "react";

function ReportsPageContent() {
  const { products, sales, stockMovements } = useData();
  const { formatCurrency } = useSettings();
  const [selectedReport, setSelectedReport] = useState("inventory");

  // Inventory Summary
  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.currentStock <= p.reorderLevel,
  );
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.unitPrice,
    0,
  );
  const averageStockLevel =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + p.currentStock, 0) /
            products.length,
        )
      : 0;

  // Sales Summary
  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce(
    (sum, s) => sum + s.totalAmount,
    0,
  );
  const avgOrderValue =
    completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

  // Top Products (based on sales and stock movements)
  const topProducts = products
    .map((p) => {
      // Calculate volume from completed sales
      const salesVolume = completedSales.reduce((sum, s) => {
        const saleItem = s.items.find(
          (item) => item.productId === p.id || item.productId === p._id,
        );
        return sum + (saleItem?.quantity || 0);
      }, 0);

      // Calculate volume from stock movements (out movements indicate usage/sales)
      const stockMovementVolume = stockMovements
        .filter(
          (m) =>
            (m.productId === p.id || m.productId === p._id) && m.type === "out",
        )
        .reduce((sum, m) => sum + m.quantity, 0);

      // Total volume = sales + stock movements
      const totalVolume = salesVolume + stockMovementVolume;

      return { ...p, salesVolume, stockMovementVolume, totalVolume };
    })
    .filter((p) => p.totalVolume > 0) // Only show products with some activity
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 5);

  // Stock Movements Summary
  const inMovements = stockMovements.filter((m) => m.type === "in").length;
  const outMovements = stockMovements.filter((m) => m.type === "out").length;

  const exportCSV = () => {
    let csv = "";
    if (selectedReport === "inventory") {
      csv =
        "ID,_ID,Name,SKU,Category,Unit Price,Cost Price,Unit,Supplier ID,Reorder Level,Current Stock,Created At,Updated At,Description,Status,Retail SubType,Base UoM,Tracking Config,Reorder Strategy\n";
      products.forEach((p) => {
        csv += `"${p.id || ""}","${p._id || ""}","${p.name}","${p.sku}","${p.category}",${p.unitPrice},${p.costPrice},"${p.unit}","${p.supplierId}",${p.reorderLevel},${p.currentStock},"${p.createdAt}","${p.updatedAt}","${p.description || ""}","${p.status || "active"}","${p.retailSubType || ""}","${p.baseUoM || ""}","${JSON.stringify(p.tracking || {}).replace(/"/g, '""')}","${JSON.stringify(p.reorderStrategy || {}).replace(/"/g, '""')}"\n`;
      });
    } else if (selectedReport === "sales") {
      csv =
        "ID,_ID,Sale Number,Date,Customer Name,Payment Type,Transaction ID,Total Amount,Status,Notes,Created By,Created At,Items (JSON)\n";
      sales.forEach((s) => {
        csv += `"${s.id || ""}","${s._id || ""}","${s.saleNumber}","${s.date}","${s.customerName || ""}","${s.paymentType || ""}","${s.txnId || ""}",${s.totalAmount},"${s.status}","${s.notes}","${s.createdBy}","${s.createdAt}","${JSON.stringify(s.items).replace(/"/g, '""')}"\n`;
      });
    } else if (selectedReport === "stock_movements") {
      csv =
        "ID,Product ID,Type,Quantity,Reason,Reference,Created By,Created At\n";
      stockMovements.forEach((m) => {
        const createdBy =
          typeof m.createdBy === "object"
            ? m.createdBy?.username || m.createdBy?.id || ""
            : m.createdBy || "";
        csv += `"${m.id}","${m.productId}","${m.type}",${m.quantity},"${m.reason}","${m.reference}","${createdBy}","${m.createdAt}"\n`;
      });
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csv),
    );
    element.setAttribute(
      "download",
      `${selectedReport}-report-${new Date().toISOString().split("T")[0]}.csv`,
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
            Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
            View insights and generate reports
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setSelectedReport("inventory")}
          variant={selectedReport === "inventory" ? "default" : "outline"}
          className={
            selectedReport === "inventory"
              ? "bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
              : "dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
          }
        >
          Inventory Report
        </Button>
        <Button
          onClick={() => setSelectedReport("sales")}
          variant={selectedReport === "sales" ? "default" : "outline"}
          className={
            selectedReport === "sales"
              ? "bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
              : "dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
          }
        >
          Sales Report
        </Button>
        <Button
          onClick={() => setSelectedReport("stock_movements")}
          variant={selectedReport === "stock_movements" ? "default" : "outline"}
          className={
            selectedReport === "stock_movements"
              ? "bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
              : "dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
          }
        >
          Stock Movements Report
        </Button>
        {/* <Button
              onClick={() => setSelectedReport("summary")}
              variant={selectedReport === "summary" ? "default" : "outline"}
              className={
                selectedReport === "summary"
                  ? "bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                  : "dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
              }
            >
              Summary
            </Button> */}
        <Button
          onClick={exportCSV}
          variant="outline"
          className="ml-auto gap-2 dark:border-teal-700 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {selectedReport === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {formatCurrency(totalInventoryValue)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Avg Stock Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {averageStockLevel}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {completedSales.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-teal-100">
                {formatCurrency(avgOrderValue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === "inventory" && (
        <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
          <CardHeader>
            <CardTitle className="dark:text-teal-100">
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm text-blue-600 font-medium dark:text-blue-300">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {totalProducts}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700">
                <p className="text-sm text-purple-600 font-medium dark:text-purple-300">
                  Inventory Value
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatCurrency(totalInventoryValue)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-700">
                <p className="text-sm text-red-600 font-medium dark:text-red-300">
                  Low Stock Items
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {lowStockItems.length}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                Top 5 Most Active Products
              </h3>
              {topProducts.length === 0 ? (
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  No product activity yet
                </p>
              ) : (
                <div className="space-y-2">
                  {topProducts.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-teal-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 text-green-700 dark:bg-teal-900 dark:text-teal-200 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-slate-100">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            {p.sku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-teal-100">
                          {p.totalVolume} total units
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          {p.salesVolume} sold + {p.stockMovementVolume} moved
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lowStockItems.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-700">
                <p className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Low Stock Items Need Reordering
                </p>
                <div className="space-y-1">
                  {lowStockItems.map((item) => (
                    <p
                      key={item.id}
                      className="text-sm text-amber-800 dark:text-amber-300"
                    >
                      • {item.name}: {item.currentStock} {item.unit} (Reorder
                      at: {item.reorderLevel})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedReport === "sales" && (
        <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
          <CardHeader>
            <CardTitle className="dark:text-teal-100">Sales Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
                <p className="text-sm text-green-600 font-medium dark:text-green-300">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {completedSales.length}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm text-blue-600 font-medium dark:text-blue-300">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 dark:bg-purple-900/20 dark:border-purple-700">
                <p className="text-sm text-purple-600 font-medium dark:text-purple-300">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {formatCurrency(avgOrderValue)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                Recent Sales
              </h3>
              {completedSales.length === 0 ? (
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  No sales recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-teal-700 bg-gray-50 dark:bg-slate-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                          Sale #
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                          Date
                        </th>
                        <th className="text-center p-3 font-semibold text-gray-700 dark:text-slate-300">
                          Items
                        </th>
                        <th className="text-right p-3 font-semibold text-gray-700 dark:text-slate-300">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSales.slice(0, 10).map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-gray-200 dark:border-teal-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <td className="p-3 font-medium text-gray-900 dark:text-slate-100">
                            {s.saleNumber}
                          </td>
                          <td className="p-3 text-gray-600 dark:text-slate-400">
                            {new Date(s.date).toLocaleDateString()}{" "}
                          </td>
                          <td className="p-3 text-center text-gray-600 dark:text-slate-400">
                            {s.items.length}
                          </td>
                          <td className="p-3 text-right font-medium text-gray-900 dark:text-teal-100">
                            {formatCurrency(s.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedReport === "stock_movements" && (
        <Card className="border-green-200 border-2 dark:bg-slate-800 dark:border-teal-700">
          <CardHeader>
            <CardTitle className="dark:text-teal-100">
              Stock Movements Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                <p className="text-sm text-blue-600 font-medium dark:text-blue-300">
                  Total Movements
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {stockMovements.length}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
                <p className="text-sm text-green-600 font-medium dark:text-green-300">
                  Stock In
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {inMovements}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-700">
                <p className="text-sm text-red-600 font-medium dark:text-red-300">
                  Stock Out
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {outMovements}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-teal-100 mb-3">
                Recent Stock Movements
              </h3>
              {stockMovements.length === 0 ? (
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  No stock movements yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-teal-700 bg-gray-50 dark:bg-slate-700">
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Product
                        </th>
                        <th className="text-center p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Type
                        </th>
                        <th className="text-right p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Quantity
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Reason
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Reference
                        </th>
                        <th className="text-left p-3 font-semibold text-gray-700 dark:text-teal-300">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockMovements.slice(0, 10).map((m) => {
                        const product = products.find(
                          (p) => p.id === m.productId || p._id === m.productId,
                        );
                        return (
                          <tr
                            key={m.id}
                            className="border-b border-gray-200 dark:border-teal-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            <td className="p-3 font-medium text-gray-900 dark:text-slate-100">
                              {product?.name || "Unknown Product"}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  m.type === "in"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : m.type === "out"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                }`}
                              >
                                {m.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right font-medium text-gray-900 dark:text-slate-100">
                              {m.quantity}
                            </td>
                            <td className="p-3 text-gray-600 dark:text-slate-400">
                              {m.reason}
                            </td>
                            <td className="p-3 text-gray-600 dark:text-slate-400">
                              {m.reference}
                            </td>
                            <td className="p-3 text-gray-600 dark:text-slate-400">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ClientOnly>
      <ReportsPageContent />
    </ClientOnly>
  );
}
