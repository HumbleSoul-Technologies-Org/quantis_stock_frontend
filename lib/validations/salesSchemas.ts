import { z } from "zod";

// Sale Item Schema
export const saleItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .min(1, "Quantity must be at least 1")
    .max(9999, "Quantity cannot exceed 9,999"),
  unitPrice: z
    .number({
      required_error: "Unit price is required",
      invalid_type_error: "Unit price must be a number",
    })
    .min(0, "Unit price cannot be negative")
    .max(999999.99, "Unit price cannot exceed 999,999.99"),
  discount: z
    .number({
      invalid_type_error: "Discount must be a number",
    })
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .default(0),
});

// Sales Schema
export const salesSchema = z.object({
  customerId: z.string().optional(),
  customerName: z
    .string()
    .max(100, "Customer name must be less than 100 characters")
    .optional(),
  customerEmail: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  customerPhone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  items: z
    .array(saleItemSchema)
    .min(1, "At least one item is required")
    .max(100, "Cannot have more than 100 items"),
  paymentMethod: z.enum(
    ["cash", "card", "transfer", "cheque", "credit", "other"],
    {
      required_error: "Payment method is required",
      invalid_type_error: "Invalid payment method",
    },
  ),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  discount: z
    .number({
      invalid_type_error: "Discount must be a number",
    })
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .default(0),
  taxRate: z
    .number({
      invalid_type_error: "Tax rate must be a number",
    })
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .default(0),
});

export type SaleItemFormData = z.infer<typeof saleItemSchema>;
export type SalesFormData = z.infer<typeof salesSchema>;
