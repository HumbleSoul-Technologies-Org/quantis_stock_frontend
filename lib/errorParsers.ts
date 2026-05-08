/**
 * Utility for parsing server error responses and mapping them to form fields
 */

const normalize = (text: string) => text.trim().toLowerCase();

export interface ParsedApiError {
  message: string;
  code?: string;
  correlationId?: string;
  timestamp?: string;
  fields: Record<string, FieldError>;
  general?: string;
}

export interface FieldError {
  messages: string[];
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  receivedValue?: any;
}

/**
 * Parse a structured API error response from the server
 * Handles the new AppError format with detailed field information
 */
export function parseApiError(error: unknown): ParsedApiError {
  const result: ParsedApiError = {
    message: "An unexpected error occurred",
    fields: {},
  };

  if (!error || typeof error !== "object") {
    return result;
  }

  const apiError = error as Record<string, unknown>;

  // Extract basic error information
  result.message = getApiErrorText(error);
  result.code = typeof apiError.code === "string" ? apiError.code : undefined;
  result.correlationId = typeof apiError.correlationId === "string" ? apiError.correlationId : undefined;
  result.timestamp = typeof apiError.timestamp === "string" ? apiError.timestamp : undefined;

  // Extract field-level errors from details
  const details = apiError.details as Record<string, unknown>;
  if (details && typeof details === "object") {
    Object.entries(details).forEach(([field, fieldData]) => {
      if (fieldData && typeof fieldData === "object") {
        const fieldInfo = fieldData as Record<string, unknown>;

        // Handle new structured format
        if (fieldInfo.messages) {
          result.fields[field] = {
            messages: Array.isArray(fieldInfo.messages) ? fieldInfo.messages as string[] : [String(fieldInfo.messages)],
            severity: (fieldInfo.severity as FieldError['severity']) || 'error',
            suggestion: typeof fieldInfo.suggestion === "string" ? fieldInfo.suggestion : undefined,
            receivedValue: fieldInfo.receivedValue,
          };
        }
        // Handle legacy format (string or array)
        else if (typeof fieldInfo === "string") {
          result.fields[field] = {
            messages: [fieldInfo],
            severity: 'error',
          };
        } else if (Array.isArray(fieldInfo)) {
          result.fields[field] = {
            messages: fieldInfo.filter(m => typeof m === "string") as string[],
            severity: 'error',
          };
        }
      }
    });
  }

  // If no field errors but we have a message, put it in general
  if (Object.keys(result.fields).length === 0 && result.message !== "An unexpected error occurred") {
    result.general = result.message;
  }

  return result;
}

export function getApiErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message.trim() || "An unexpected error occurred.";
  }

  if (error && typeof error === "object") {
    const apiError = error as Record<string, unknown>;

    // Try structured error format first
    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message.trim();
    }

    // Fall back to legacy error field
    if (typeof apiError.error === "string" && apiError.error.trim()) {
      return apiError.error.trim();
    }
  }

  return String(error ?? "An unexpected error occurred.");
}

export function extractApiErrorFields(error: unknown): Record<string, string> {
  const parsed = parseApiError(error);

  // Convert structured field errors to simple string format for backward compatibility
  const result: Record<string, string> = {};

  Object.entries(parsed.fields).forEach(([field, fieldError]) => {
    result[field] = fieldError.messages.join('. ');
  });

  return result;
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
