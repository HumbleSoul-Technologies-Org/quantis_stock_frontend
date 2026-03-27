"use client";

import { Sale, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { useSettings } from "@/context/SettingsContext";

interface SalesTableProps {
  sales: Sale[];
  products: Product[];
  onDelete: (id: string) => void;
}

export function SalesTable({ sales, products, onDelete }: SalesTableProps) {
  const { formatCurrency } = useSettings();
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

  const toggleExpand = (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedSales(newExpanded);
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Unknown Product";
  };

  const getTotalQuantity = (sale: Sale) => {
    return sale.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePrint = (sale: Sale) => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    const totalQty = getTotalQuantity(sale);
    const itemsHTML = sale.items
      .map(
        (item) =>
          `<tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">${getProductName(item.productId)}</td>
            <td style="padding: 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
            <td style="padding: 8px; text-align: right;">${formatCurrency(item.total)}</td>
          </tr>`,
      )
      .join("");

    const paymentInfo = sale.paymentType
      ? `<p><strong>Payment Method:</strong> ${sale.paymentType}${
          sale.txnId ? ` | TXN ID: ${sale.txnId}` : ""
        }</p>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Receipt - ${sale.saleNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .sale-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-block { }
            .info-block strong { display: block; margin-bottom: 2px; }
            .info-block span { color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
            .summary { display: flex; justify-content: flex-end; margin-bottom: 20px; }
            .summary-box { text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; color: #333; margin-top: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            @media print { body { margin: 0; padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES RECEIPT</h1>
            <p>Sale Number: <strong>${sale.saleNumber}</strong></p>
          </div>

          <div class="sale-info">
            <div class="info-block">
              <strong>Customer:</strong>
              <span>${sale.customerName || "N/A"}</span>
            </div>
            <div class="info-block">
              <strong>Date:</strong>
              <span>${format(new Date(sale.date), "MMM dd, yyyy")}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center; width: 80px;">Qty</th>
                <th style="text-align: right; width: 100px;">Unit Price</th>
                <th style="text-align: right; width: 100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div>Total Items: <strong>${totalQty}</strong></div>
              <div class="total-row">Amount: ${formatCurrency(sale.totalAmount)}</div>
            </div>
          </div>

          ${paymentInfo}

          ${sale.notes ? `<p><strong>Notes:</strong> ${sale.notes}</p>` : ""}

          <div class="footer">
            <p>Printed on ${format(new Date(), "MMM dd, yyyy HH:mm:ss")}</p>
            <p style="margin-top: 10px;">Thank you for your purchase!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const sorted = sales.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card className="border-green-200 dark:border-teal-700 border-2 mt-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Sales ({sorted.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">
            No sales recorded
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((sale) => (
              <div
                key={sale.id}
                className="border border-gray-200 dark:border-slate-700 dark:bg-slate-700 rounded-lg"
              >
                <div
                  className="p-3 hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(sale.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {expandedSales.has(sale.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <p className="font-medium text-gray-900 dark:text-teal-100">
                        {sale.saleNumber}
                      </p>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-medium capitalize">
                        {sale.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400 ml-6">
                      Customer:{" "}
                      <strong className="dark:text-teal-100">
                        {sale.customerName || "Anonymous"}
                      </strong>{" "}
                      | Items: {sale.items.length} | Qty:{" "}
                      {getTotalQuantity(sale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(sale.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {expandedSales.has(sale.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
                    {/* Sale Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Sale Date</p>
                        <p className="text-gray-600">
                          {format(new Date(sale.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                      {sale.paymentType && (
                        <div>
                          <p className="font-medium text-gray-700">Payment</p>
                          <p className="text-gray-600 capitalize">
                            {sale.paymentType}
                            {sale.txnId && ` (${sale.txnId})`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items Table */}
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Items:</p>
                      <div className="bg-white rounded border border-gray-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-100">
                              <th className="text-left p-2">Product</th>
                              <th className="text-center p-2 w-12">Qty</th>
                              <th className="text-right p-2 w-20">
                                Unit Price
                              </th>
                              <th className="text-right p-2 w-24">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <td className="p-2">
                                  {getProductName(item.productId)}
                                </td>
                                <td className="p-2 text-center font-medium">
                                  {item.quantity}
                                </td>
                                <td className="p-2 text-right">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="p-2 text-right font-medium">
                                  {formatCurrency(item.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end bg-white rounded p-2 border border-gray-200">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Total Items: <strong>{getTotalQuantity(sale)}</strong>
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {sale.notes && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-700">Notes:</p>
                        <p className="text-gray-600">{sale.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrint(sale)}
                        className="text-blue-600 hover:bg-blue-50 gap-1"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(sale.id)}
                        className="text-red-600 hover:bg-red-50 gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
