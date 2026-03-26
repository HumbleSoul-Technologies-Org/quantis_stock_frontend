"use client";

import { Product, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, AlertCircle, Plus } from "lucide-react";
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
    <Card className="border-green-200 border-2 mt-6 h-screen">
      <CardHeader>
        <CardTitle>Products ({filtered.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-200 bg-green-50">
                  <th className="text-left p-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700">
                    SKU
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left p-3 font-semibold text-gray-700">
                    Supplier
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-700">
                    Stock
                  </th>
                  <th className="text-center p-3 font-semibold text-gray-700">
                    Status
                  </th>
                  <th
                    className="text-center p-3 font-semibold text-gray-700"
                    colSpan={2}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-600">{product.sku}</td>
                    <td className="p-3 text-gray-600">{product.category}</td>
                    <td className="p-3 text-gray-600">
                      {getSupplierName(product.supplierId)}
                    </td>
                    <td className="p-3 text-right text-gray-900 font-medium">
                      {formatCurrency(product.unitPrice)}
                    </td>
                    <td className="p-3 text-right text-gray-900">
                      <span className="font-medium">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-600 ml-1">{product.unit}</span>
                    </td>
                    <td className="p-3 text-center">
                      {product.currentStock <= product.reorderLevel ? (
                        <div className="flex items-center justify-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium w-fit mx-auto">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </div>
                      ) : (
                        <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-medium w-fit mx-auto">
                          In Stock
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStockIn(product)}
                        className="text-green-600 hover:bg-green-50 gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Stock In
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(product)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(product.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
