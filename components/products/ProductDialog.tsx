"use client";

import { Product, Supplier } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { ManufacturerProductForm } from "./ManufacturerProductForm";
import { useAuth } from "@/context/AuthContext";

interface ProductDialogProps {
  isOpen: boolean;
  product?: Product;
  suppliers: Supplier[];
  categories?: string[];
  onSubmit: (product: Product) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  serverError?: string;
}

export function ProductDialog({
  isOpen,
  product,
  suppliers,
  categories,
  onSubmit,
  onOpenChange,
  serverError = "",
}: ProductDialogProps) {
  const { business } = useAuth();
  const isManufacturer = business?.businessType === "manufacturer";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        disableOutsideClick
        disableEscape
        className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-slate-800"
      >
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product details and pricing information."
              : "Add a new product to your stock catalog."}
          </DialogDescription>
        </DialogHeader>
        {isManufacturer ? (
          <ManufacturerProductForm
            product={product}
            suppliers={suppliers}
            categories={categories}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            serverError={serverError}
          />
        ) : (
          <ProductForm
            product={product}
            suppliers={suppliers}
            categories={categories}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            serverError={serverError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
