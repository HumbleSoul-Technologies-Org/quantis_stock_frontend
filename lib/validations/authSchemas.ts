import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Username or email is required")
    .refine(
      (val) => {
        // Check if it's a valid email or valid username format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
        return emailRegex.test(val) || usernameRegex.test(val);
      },
      "Please enter a valid username (3-50 characters, alphanumeric + underscore) or email address"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptLegal: z.boolean().refine((val) => val === true, {
      message: "You must accept the Privacy Policy and Terms & Conditions to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const productKeySchema = z.object({
  productKey: z
    .string()
    .min(1, "Product key is required")
    .regex(
      /^(?:([a-f0-9]{4}-){7}[a-f0-9]{4}|(?=.*demo)[A-Za-z0-9-]+)$/i,
      "Product key must be either the standard 8-group hex format or a demo key containing the word 'demo'",
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProductKeyFormData = z.infer<typeof productKeySchema>;