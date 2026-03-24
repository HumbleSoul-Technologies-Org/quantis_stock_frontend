'use client';

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Supplier } from '@/lib/types';
import { SupplierDialog } from '@/components/suppliers/SupplierDialog';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplier);
    } else {
      addSupplier(supplier);
    }
    setEditingSupplier(undefined);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowDialog(true);
  };

  const handleOpenDialog = () => {
    setEditingSupplier(undefined);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-2">Manage your supplier contacts and information</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      <SupplierDialog
        isOpen={showDialog}
        supplier={editingSupplier}
        onSubmit={handleAddSupplier}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingSupplier(undefined);
          }
        }}
      />

      <Input
        placeholder="Search by name, email, or city..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-green-200"
      />

      <SupplierTable suppliers={suppliers} onEdit={handleEditSupplier} onDelete={deleteSupplier} searchTerm={searchTerm} />
    </div>
  );
}
