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

interface ProductDialogProps {
  isOpen: boolean;
  product?: Product;
  suppliers: Supplier[];
  categories?: string[];
  onSubmit: (product: Product) => void;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({
  isOpen,
  product,
  suppliers,
  categories,
  onSubmit,
  onOpenChange,
}: ProductDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product details and pricing information."
              : "Add a new product to your inventory catalog."}
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product}
          suppliers={suppliers}
          categories={categories}
          onSubmit={(newProduct) => {
            onSubmit(newProduct);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
