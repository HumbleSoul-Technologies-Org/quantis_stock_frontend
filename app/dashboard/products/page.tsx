'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Product } from '@/lib/types';
import { ProductDialog } from '@/components/products/ProductDialog';
import { ProductTable } from '@/components/products/ProductTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleAddProduct = (product: Product) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, product);
    } else {
      addProduct(product);
    }
    setShowDialog(false);
    setEditingProduct(undefined);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };

  const handleStockIn = (product: Product) => {
    // Redirect to inventory page - will implement stock in dialog there
    window.location.href = `/dashboard/inventory?productId=${product.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <ProductDialog
        isOpen={showDialog}
        product={editingProduct}
        suppliers={suppliers}
        onSubmit={handleAddProduct}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingProduct(undefined);
          }
        }}
      />

      <div className="flex gap-4 flex-col sm:flex-row">
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-green-200 flex-1"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-green-200 rounded-md text-sm w-full sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <ProductTable
        products={products}
        suppliers={suppliers}
        onEdit={handleEditProduct}
        onDelete={deleteProduct}
        onStockIn={handleStockIn}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
      />
    </div>
  );
}
