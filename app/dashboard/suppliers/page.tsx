"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { Supplier } from "@/lib/types";
import { ClientOnly } from "@/components/client-only";
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SuppliersPageContent() {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } =
    useData();
  const {
    notifyResourceCreated,
    notifyResourceUpdated,
    notifyResourceDeleted,
  } = useNotificationActions();

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    Supplier | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  const filteredSuppliers = safeSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSupplier = (supplier: Supplier) => {
    if (editingSupplier && (editingSupplier.id || editingSupplier._id)) {
      updateSupplier(editingSupplier?.id || editingSupplier?._id, supplier);
      notifyResourceUpdated("Supplier", supplier.name);
    } else {
      addSupplier(supplier);
      notifyResourceCreated("Supplier", supplier.name);
    }
    setShowDialog(false);
    setEditingSupplier(undefined);
  };

  const handleDeleteSupplier = (id: string) => {
    const supplier = safeSuppliers.find((s) => s.id === id || s._id === id);
    if (supplier) {
      deleteSupplier(id);
      notifyResourceDeleted("Supplier", supplier.name);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-teal-100">
            Suppliers
          </h1>
          <p className="text-gray-600 dark:text-teal-200">
            Manage your supplier information and contacts
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2"
          disabled={user?.role === "accountant"}
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
          />
        </div>
      </div>

      <SupplierTable
        suppliers={filteredSuppliers}
        products={safeProducts}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteSupplier}
        searchTerm={searchTerm}
      />

      <SupplierDialog
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleAddSupplier}
        supplier={editingSupplier}
      />
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <ClientOnly>
      <SuppliersPageContent />
    </ClientOnly>
  );
}
