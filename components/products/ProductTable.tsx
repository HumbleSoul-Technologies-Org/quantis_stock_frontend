"use client";

import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MoreVertical, Edit2, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/context/SettingsContext";

interface ProductTableProps {
  products: Product[];
  suppliers: Supplier[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onStockIn: (product: Product) => void;
  searchTerm?: string;
  categoryFilter?: string;
}

export function ProductTable({
  products,
  suppliers,
  onEdit,
  onDelete,
  onStockIn,
  searchTerm = "",
  categoryFilter = "",
}: ProductTableProps) {
  const { formatCurrency } = useSettings();

  let filtered = products;

  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter((p) => p.category === categoryFilter);
  }

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || "Unknown";
  };

  return (
    <Card className="border-green-200 dark:border-teal-700 border-2 mt-6 bg-white dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-teal-100">
          Products ({filtered.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">
            No products found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200 dark:border-teal-700 bg-green-50 dark:bg-slate-700">
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Name
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    SKU
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Category
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Supplier
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Unit Price
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Stock
                  </th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="text-center p-3 font-semibold text-gray-700 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="p-3 font-medium text-gray-900 dark:text-teal-100">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {product.sku}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {product.category}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-400">
                      {getSupplierName(product.supplierId)}
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-teal-100 font-medium">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-teal-100">
                      <span className="font-medium">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-600 dark:text-slate-400 ml-1">
                        {product.unit}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {product.currentStock <= product.reorderLevel ? (
                        <div className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs font-medium w-fit mx-auto">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs font-medium w-fit mx-auto">
                          In Stock
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEdit(product)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStockIn(product)}
                            className="cursor-pointer gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Stock In
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(product.id)}
                            variant="destructive"
                            className="cursor-pointer gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
