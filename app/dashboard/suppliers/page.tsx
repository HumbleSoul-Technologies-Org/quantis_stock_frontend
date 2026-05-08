"use client";

import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "@/lib/types";
import { ClientOnly } from "@/components/client-only";
import { SupplierDialog } from "@/components/suppliers/SupplierDialog";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useAuth } from "@/context/AuthContext";

function SuppliersPageContent() {
  const {
    suppliers,
    products,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    isInitialLoadingSuppliers,
    logActivity,
  } = useData();
  const {
    notifyResourceCreated,
    notifyResourceUpdated,
    notifyResourceDeleted,
  } = useNotificationActions();
  const { toast } = useToast();

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    Supplier | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFormError, setSupplierFormError] = useState<string>("");

  const { user } = useAuth();

  const openDialogForAction = (_actionType: string, action: () => void) => {
    action();
  };

  const filteredSuppliers = safeSuppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSaveSupplier = async (supplier: Supplier) => {
    // Clear any previous errors when attempting to save again
    setSupplierFormError("");

    try {
      const supplierId = supplier.id ?? supplier._id;
      if (supplierId) {
        // Update existing supplier

        await updateSupplier(supplierId, supplier);

        // Log activity: supplier updated
        try {
          await logActivity({
            type: "supplier",
            action: "update",
            status: "success",
            title: `Supplier Updated: ${supplier.name}`,
            description: `Supplier "${supplier.name}" was updated`,
            referenceId: supplierId,
            entityType: "supplier",
            entityId: supplierId,
            metadata: {
              supplierName: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
            },
            businessId: user?.businessId,
            createdBy: user?.id || user?._id || "",
          });
        } catch (error) {
          console.warn("Failed to log supplier update activity:", error);
        }

        notifyResourceUpdated("Supplier", supplier.name);
        toast({
          title: "Supplier Updated",
          description: `"${supplier.name}" has been updated successfully.`,
        });
        // Only close dialog on successful update
        setShowDialog(false);
        setEditingSupplier(undefined);
      } else {
        // Create new supplier
        await addSupplier(supplier);

        // Log activity: supplier created
        try {
          await logActivity({
            type: "supplier",
            action: "create",
            status: "success",
            title: `Supplier Created: ${supplier.name}`,
            description: `New supplier "${supplier.name}" was created`,
            referenceId: supplier.id || supplier._id,
            entityType: "supplier",
            entityId: supplier.id || supplier._id,
            metadata: {
              supplierName: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
            },
            businessId: user?.businessId,
            createdBy: user?.id || user?._id || "",
          });
        } catch (error) {
          console.warn("Failed to log supplier create activity:", error);
        }

        notifyResourceCreated("Supplier", supplier.name);
        toast({
          title: "Supplier Created",
          description: `"${supplier.name}" has been created successfully.`,
        });
        // Only close dialog on successful create
        setShowDialog(false);
        setEditingSupplier(undefined);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save supplier";
      // Set error state in form instead of closing it
      setSupplierFormError(errorMsg);
      console.error("Failed to save supplier:", error);
    }
  };

  const handleDeleteSupplier = (id: string) => {
    try {
      const supplier = safeSuppliers.find((s) => s.id === id || s._id === id);
      if (supplier) {
        deleteSupplier(id);

        // Log activity: supplier deleted
        try {
          logActivity({
            type: "supplier",
            action: "delete",
            status: "success",
            title: `Supplier Deleted: ${supplier.name}`,
            description: `Supplier "${supplier.name}" was deleted`,
            referenceId: id,
            entityType: "supplier",
            entityId: id,
            metadata: {
              supplierName: supplier.name,
              email: supplier.email,
              phone: supplier.phone,
            },
            businessId: user?.businessId,
            createdBy: user?.id || user?._id || "",
          });
        } catch (error) {
          console.warn("Failed to log supplier delete activity:", error);
        }

        notifyResourceDeleted("Supplier", supplier.name);
        toast({
          title: "Supplier Deleted",
          description: `"${supplier.name}" has been deleted successfully.`,
        });
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete supplier";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      console.error("Failed to delete supplier:", error);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    openDialogForAction("update supplier", () => {
      setEditingSupplier(supplier);
      setShowDialog(true);
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setShowDialog(open);
    if (!open) {
      setEditingSupplier(undefined);
      setSupplierFormError("");
    }
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
          onClick={() =>
            openDialogForAction("create supplier", () => {
              setEditingSupplier(undefined);
              setShowDialog(true);
            })
          }
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

      {isInitialLoadingSuppliers ? (
        <TableSkeleton rows={7} />
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
          products={safeProducts}
          onEdit={handleEditSupplier}
          onDelete={handleDeleteSupplier}
          searchTerm={searchTerm}
        />
      )}

      <SupplierDialog
        key={editingSupplier?.id || editingSupplier?._id || "new"}
        isOpen={showDialog}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSaveSupplier}
        supplier={editingSupplier}
        serverError={supplierFormError}
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
