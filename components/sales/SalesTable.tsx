'use client';

import { Sale, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { useSettings } from '@/context/SettingsContext';

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
    return products.find((p) => p.id === productId)?.name || 'Unknown Product';
  };

  const sorted = sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Card className="border-green-200 border-2 mt-6">
      <CardHeader>
        <CardTitle>Sales ({sorted.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales recorded</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((sale) => (
              <div key={sale.id} className="border border-gray-200 rounded-lg">
                <div
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleExpand(sale.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {expandedSales.has(sale.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      <p className="font-medium text-gray-900">{sale.saleNumber}</p>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium capitalize">
                        {sale.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{sale.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(sale.totalAmount)}</p>
                    <p className="text-xs text-gray-600">{format(new Date(sale.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {expandedSales.has(sale.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                    <div className="text-sm">
                      <p className="font-medium text-gray-700 mb-2">Items:</p>
                      {sale.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 py-1">
                          <span>{getProductName(item.productId)}</span>
                          <span>
                            {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {sale.notes && (
                      <div className="text-sm mt-2">
                        <p className="font-medium text-gray-700">Notes:</p>
                        <p className="text-xs text-gray-600">{sale.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                      <Button size="sm" variant="ghost" onClick={() => onDelete(sale.id)} className="text-red-600 hover:bg-red-50 text-xs">
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
