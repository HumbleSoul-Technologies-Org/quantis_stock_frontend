import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(1, "Product name cannot be empty")
    .max(200, "Product name must be less than 200 characters"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU must be less than 50 characters")
    .regex(/^[A-Za-z0-9-_]+$/, "SKU can only contain letters, numbers, hyphens, and underscores"),
  category: z.string().min(1, "Category is required"),
  customCategory: z
    .string()
    .max(100, "Custom category must be less than 100 characters")
    .optional(),
  unitPrice: z
    .number({
      required_error: "Unit price is required",
      invalid_type_error: "Unit price must be a number",
    })
    .min(0, "Unit price cannot be negative")
    .max(999999.99, "Unit price cannot exceed 999,999.99"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  stockLevel: z
    .number({
      required_error: "Stock level is required",
      invalid_type_error: "Stock level must be a number",
    })
    .min(0, "Stock level cannot be negative")
    .max(999999, "Stock level cannot exceed 999,999"),
  reorderPoint: z
    .number({
      invalid_type_error: "Reorder point must be a number",
    })
    .min(0, "Reorder point cannot be negative")
    .max(999999, "Reorder point cannot exceed 999,999")
    .optional(),
  supplierId: z.string().optional(),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  isActive: z.boolean().default(true),
  expiryDate: z.date().optional(),
  batchNumber: z
    .string()
    .max(50, "Batch number must be less than 50 characters")
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;