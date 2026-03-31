"use client";

import { StockMovement, Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, RefreshCw, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface StockHistoryTableProps {
  movements: StockMovement[];
  products: Product[];
  selectedProductId?: string;
  onEdit?: (movement: StockMovement) => void;
  onDelete?: (id: string) => void;
}

export function StockHistoryTable({
  movements,
  products,
  selectedProductId,
  onEdit,
  onDelete,
}: StockHistoryTableProps) {
  let filtered = movements;
  if (selectedProductId) {
    filtered = filtered.filter((m) => m.productId === selectedProductId);
  }

  const sorted = filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getProductName = (productId: string) => {
    return (
      products.find((p) => p.id === productId || (p as any)._id === productId)
        ?.name || "Unknown Product"
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === "in") return <ArrowUp className="w-4 h-4" />;
    if (type === "out") return <ArrowDown className="w-4 h-4" />;
    return <RefreshCw className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    if (type === "in")
      return "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
    if (type === "out")
      return "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    return "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  };

  return (
    <Card className="border-green-200 dark:border-teal-700 border-2 mt-4 sm:mt-6 bg-white dark:bg-slate-800">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl dark:text-teal-100">
          Stock Movement History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {sorted.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-6 sm:py-8 text-sm">
            No stock movements
          </p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-green-200 dark:border-teal-700 bg-green-50 dark:bg-teal-900">
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300">
                    Product
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300">
                    Type
                  </th>
                  <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300">
                    Qty
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300 hidden sm:table-cell">
                    Reason
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300 hidden lg:table-cell">
                    Reference
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300">
                    Date
                  </th>
                  <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300 hidden md:table-cell">
                    Created By
                  </th>
                  <th className="text-center p-2 sm:p-3 font-semibold text-gray-700 dark:text-teal-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((movement, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="p-2 sm:p-3 font-medium text-gray-900 dark:text-teal-100 truncate">
                      {getProductName(movement.productId)}
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getTypeColor(movement.type)}`}
                      >
                        {getTypeIcon(movement.type)}
                        <span className="hidden sm:inline capitalize">
                          {movement.type}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 text-right font-medium text-gray-900 dark:text-teal-100">
                      {movement.quantity}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 hidden sm:table-cell text-xs">
                      {movement.reason}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 hidden lg:table-cell text-xs">
                      {movement.reference}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      {format(new Date(movement.createdAt), "MMM d yyyy")}
                    </td>
                    <td className="p-2 sm:p-3 text-gray-600 dark:text-slate-400 text-xs hidden md:table-cell">
                      {typeof movement.createdBy === "object"
                        ? movement.createdBy?.username || "Unknown User"
                        : movement.createdBy || "Unknown User"}
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <div className="inline-flex gap-2 justify-center">
                        <button
                          disabled={true}
                          type="button"
                          onClick={() => onEdit?.(movement)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          disabled={true}
                          type="button"
                          onClick={() => movement.id && onDelete?.(movement.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
