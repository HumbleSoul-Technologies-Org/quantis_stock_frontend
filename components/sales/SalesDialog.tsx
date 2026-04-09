"use client";

import { Sale, Product } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SalesForm } from "./SalesForm";

interface SalesDialogProps {
  isOpen: boolean;
  products: Product[];
  onSubmit: (sale: Sale) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  currentUsername: string;
}

export function SalesDialog({
  isOpen,
  products,
  onSubmit,
  onOpenChange,
  currentUserId,
  currentUsername,
}: SalesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Sale</DialogTitle>
          <DialogDescription>
            Record a new sales transaction with customer details and payment
            information.
          </DialogDescription>
        </DialogHeader>
        <SalesForm
          products={products}
          onSubmit={async (sale) => {
            await onSubmit(sale);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
        />
      </DialogContent>
    </Dialog>
  );
}
