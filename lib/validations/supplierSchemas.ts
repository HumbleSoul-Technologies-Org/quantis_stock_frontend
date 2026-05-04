import { z } from "zod";

// Supplier Schema
export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, "Supplier name is required")
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  contactPerson: z
    .string()
    .max(100, "Contact person name must be less than 100 characters")
    .optional(),
  paymentTerms: z
    .enum(["net_15", "net_30", "net_45", "net_60", "cod", "prepaid"], {
      invalid_type_error: "Invalid payment terms",
    })
    .optional(),
  taxId: z
    .string()
    .max(50, "Tax ID must be less than 50 characters")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  isActive: z.boolean().default(true),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;