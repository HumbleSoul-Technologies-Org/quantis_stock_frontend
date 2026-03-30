"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Supplier } from "@/lib/types";
import { ClientOnly } from "@/components/client-only";
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

function SuppliersPageContent() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier?.id, supplier);
    } else {
      addSupplier(supplier);
    }
    // setEditingSupplier(undefined);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditingSupplier(supplier);
    setShowDialog(true);
  };

  const handleOpenDialog = () => {
    // setEditingSupplier(undefined);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 px-2 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-teal-100">
            Suppliers
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1 sm:mt-2">
            Manage your supplier contacts and information
          </p>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="bg-green-600 hover:bg-green-700 dark:bg-teal-600 dark:hover:bg-teal-700 gap-2 w-full sm:w-auto"
        >
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
        className="border-green-200 dark:border-teal-700 dark:bg-slate-700 dark:text-slate-50"
      />

      <SupplierTable
        suppliers={suppliers || []}
        onEdit={handleEditSupplier}
        onDelete={deleteSupplier}
        searchTerm={searchTerm}
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
