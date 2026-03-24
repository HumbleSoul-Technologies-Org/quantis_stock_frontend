'use client';

import { Product, StockMovement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useSettings } from '@/context/SettingsContext';
import { format } from 'date-fns';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface ProductInventoryCardProps {
  product: Product;
  movements: StockMovement[];
  onStockIn: (product: Product) => void;
}

export function ProductInventoryCard({ product, movements, onStockIn }: ProductInventoryCardProps) {
  const { settings } = useSettings();

  // Get the last stock movement for this product
  const lastMovement = movements
    .filter((m) => m.productId === product.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const lastRestockDate = lastMovement ? format(new Date(lastMovement.createdAt), 'MMM dd, yyyy') : 'Never';

  // Calculate stock percentage
  const stockPercentage = product.currentStock > 0 ? (product.currentStock / (product.reorderLevel * 2)) * 100 : 0;
  const isLowStock = product.currentStock <= product.reorderLevel;

  // Pie chart data
  const pieData = [
    { name: 'In Stock', value: product.currentStock },
    { name: 'Reorder Level', value: Math.max(product.reorderLevel - product.currentStock, 0) },
  ];

  const COLORS = ['#16a34a', '#fbbf24'];

  return (
    <Card className="border border-gray-200 dark:border-teal-700 bg-white dark:bg-slate-800 hover:shadow-lg dark:hover:shadow-teal-900/50 transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-teal-100">{product.name}</CardTitle>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">SKU: {product.sku}</p>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="flex items-center gap-1 bg-red-600 dark:bg-red-700 text-white dark:text-red-100">
              <AlertCircle className="w-3 h-3" />
              Low
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pie Chart */}
        <div className="h-32 -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#64748b'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Product Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Category:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Units Remaining:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {product.currentStock} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Reorder Level:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {product.reorderLevel} {product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Unit Price:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">
              {settings.currencySymbol}
              {product.unitPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-400">Last Restock:</span>
            <span className="font-medium text-gray-900 dark:text-teal-300">{lastRestockDate}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onStockIn(product)}
          className="w-full mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Stock In
        </button>
      </CardContent>
    </Card>
  );
}
