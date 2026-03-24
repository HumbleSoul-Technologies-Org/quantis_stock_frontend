'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { SalesDialog } from '@/components/sales/SalesDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SalesPage() {
  const { products, sales, addSale, deleteSale, refresh } = useData();
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  const handleAddSale = (sale: any) => {
    addSale(sale);
    refresh();
  };

  const userSales = user?.role === 'sales' ? sales.filter((s) => s.createdBy === user.id) : sales;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-2">Create and manage sales transactions</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {user && (
        <SalesDialog
          isOpen={showDialog}
          products={products}
          onSubmit={handleAddSale}
          onOpenChange={setShowDialog}
          currentUserId={user.id}
          currentUsername={user.username}
        />
      )}

      <SalesTable sales={userSales} products={products} onDelete={deleteSale} />
    </div>
  );
}
