/**
 * Utility for parsing server error responses and mapping them to form fields
 */

const normalize = (text: string) => text.trim().toLowerCase();

export function getApiErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message.replace(/^\d+:\s*/, "").trim() || "An unexpected error occurred.";
  }
  return String(error ?? "An unexpected error occurred.");
}

export function parseUserFormError(errorText: string): Record<string, string> {
  const lowerError = normalize(errorText);

  // Email validation errors
  if (
    lowerError.includes("email") &&
    (lowerError.includes("already") || lowerError.includes("exists"))
  ) {
    return { email: "Email already in use" };
  }
  if (lowerError.includes("email") && lowerError.includes("invalid")) {
    return { email: "Invalid email format" };
  }

  // Password validation errors
  if (
    lowerError.includes("password") &&
    lowerError.includes("must be at least")
  ) {
    return { password: "Password must be at least 8 characters" };
  }
  if (
    lowerError.includes("password") &&
    (lowerError.includes("match") ||
      lowerError.includes("confirm") ||
      lowerError.includes("do not"))
  ) {
    return { confirmPassword: "Passwords do not match" };
  }
  if (lowerError.includes("password") && lowerError.includes("required")) {
    return { password: "Password is required" };
  }

  // Name/Username validation errors
  if (
    (lowerError.includes("name") || lowerError.includes("username")) &&
    lowerError.includes("required")
  ) {
    return { name: "Name is required" };
  }

  // Generic field errors
  if (lowerError.includes("name") || lowerError.includes("username")) {
    return { name: errorText };
  }

  return {};
}

export function parseFormError(errorText: string): Record<string, string> {
  const lowerError = normalize(errorText);
  const errors: Record<string, string> = {};

  if (lowerError.includes("email")) {
    if (lowerError.includes("already") || lowerError.includes("exists")) {
      errors.email = "Email is already in use";
    } else if (lowerError.includes("invalid")) {
      errors.email = "Invalid email format";
    } else {
      errors.email = errorText;
    }
  }

  if (
    lowerError.includes("phone") &&
    (lowerError.includes("required") || lowerError.includes("invalid"))
  ) {
    errors.phone = "Phone number is required";
  }

  if (lowerError.includes("name") && lowerError.includes("required")) {
    errors.name = "Name is required";
  }

  if (lowerError.includes("sku")) {
    errors.sku = "SKU is required";
  }

  if (lowerError.includes("category")) {
    errors.category = "Category is required";
  }

  if (lowerError.includes("supplier")) {
    errors.supplierId = "Supplier is required";
    errors.supplier = "Supplier is required";
  }

  if (lowerError.includes("product")) {
    errors.product = "Product is required";
    errors.productId = "Product is required";
  }

  if (lowerError.includes("unit price") || lowerError.includes("unitprice")) {
    errors.unitPrice = "Unit price must be greater than 0";
  }

  if (lowerError.includes("quantity")) {
    errors.quantity = "Quantity is required";
  }

  if (lowerError.includes("transaction") || lowerError.includes("txn")) {
    errors.txnId = "Transaction ID is required";
  }

  if (lowerError.includes("address")) {
    errors.address = "Address is required";
  }

  if (lowerError.includes("payment terms") || lowerError.includes("payment type")) {
    errors.paymentTerms = "Payment information is required";
  }

  if (lowerError.includes("reason") && lowerError.includes("required")) {
    errors.reason = "Reason is required";
  }

  if (lowerError.includes("refund") && lowerError.includes("amount")) {
    errors.refundAmount = "Refund amount is invalid";
  }

  return errors;
}

export function parseResetPasswordError(
  errorText: string,
): Record<string, string> {
  const lowerError = normalize(errorText);

  if (
    lowerError.includes("password") &&
    lowerError.includes("must be at least")
  ) {
    return { newPassword: "Password must be at least 8 characters" };
  }
  if (
    lowerError.includes("password") &&
    (lowerError.includes("match") || lowerError.includes("confirm"))
  ) {
    return { confirmPassword: "Passwords do not match" };
  }
  if (lowerError.includes("password") && lowerError.includes("required")) {
    return { newPassword: "Password is required" };
  }

  return {};
}
