import { z } from "zod";

// Stock Movement Schema
export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product selection is required"),
  type: z.enum(["in", "out", "adjustment"], {
    required_error: "Movement type is required",
    invalid_type_error: "Invalid movement type",
  }),
  quantity: z
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .min(1, "Quantity must be at least 1")
    .max(999999, "Quantity cannot exceed 999,999"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .min(5, "Reason must be at least 5 characters")
    .max(200, "Reason must be less than 200 characters"),
  reference: z
    .string()
    .min(1, "Reference is required")
    .max(50, "Reference must be less than 50 characters"),
});

export type StockMovementFormData = z.infer<typeof stockMovementSchema>;