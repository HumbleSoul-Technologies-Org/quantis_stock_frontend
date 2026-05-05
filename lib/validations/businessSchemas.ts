import { z } from "zod";

// Business Email Schema
export const businessEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Business email is required")
    .email("Please enter a valid email address"),
  activated: z.boolean().default(false),
});

// Business Phone Schema
export const businessPhoneSchema = z.object({
  contact: z.string({
    required_error: "Business phone is required",
    invalid_type_error: "Business phone must be a number",
  })
    .regex(/^[0-9]+$/, "Phone number must contain only digits")
    .min(9, "Phone number must be at least 9 digits")
    .max(15, "Phone number is too long"),
  activated: z.boolean().default(false),
});

// Business Setup Schema
export const businessSetupSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  businessEmail: businessEmailSchema,
  businessPhone: businessPhoneSchema,
  businessAddress: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  businessType: z.enum(["retail", "other"]),
  currency: z.string().min(1, "Currency is required"),
  lowStockThreshold: z
    .number()
    .min(1, "Threshold must be at least 1")
    .max(100, "Threshold must be at most 100"),
  notifications: z
    .object({
      resourceChanges: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      salesAlert: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      loginFailAttempts: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      systemUpdate: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      returns: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      lowStock: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
      userProfileChanges: z.object({ email: z.boolean(), sms: z.boolean() }).optional(),
    })
    .optional(),
  setupCompletedAt: z.string(),
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  businessType: z.enum(["retail", "other"]),
  businessEmail: businessEmailSchema,
  businessPhone: businessPhoneSchema,
  businessAddress: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
});

export type BusinessEmail = z.infer<typeof businessEmailSchema>;
export type BusinessPhone = z.infer<typeof businessPhoneSchema>;
export type BusinessSetupFormData = z.infer<typeof businessSetupSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;