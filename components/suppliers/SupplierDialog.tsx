"use client";

import { Supplier } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SupplierForm } from "./SupplierForm";

interface SupplierDialogProps {
  isOpen: boolean;
  supplier?: Supplier;
  onSubmit: (supplier: Supplier) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
}

export function SupplierDialog({
  isOpen,
  supplier,
  onSubmit,
  onOpenChange,
}: SupplierDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Update supplier details and contact information."
              : "Add a new supplier with contact details and products supplied."}
          </DialogDescription>
        </DialogHeader>
        <SupplierForm
          supplier={supplier}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
