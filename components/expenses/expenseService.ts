import { apiRequest } from "@/lib/queryClient";
import type {
  Expense,
  ExpenseCategory,
  ExpensePayment,
  ExpenseApproval,
  ExpenseAttachment,
  ExpensePaymentPayload,
  ExpenseApprovalPayload,
} from "@/lib/types";

export async function fetchExpenseCategories(
  token?: string,
  businessId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/expenses/categories",
    { businessId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load expense categories");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data)
    ? (payload.data as ExpenseCategory[])
    : [];
}

export async function createExpenseCategory(
  payload: Partial<ExpenseCategory>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/expenses/categories",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create expense category");
  }

  const data = await response.json();
  return data?.data as ExpenseCategory;
}

export async function updateExpenseCategory(
  id: string,
  payload: Partial<ExpenseCategory>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/expenses/categories/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update expense category");
  }

  const data = await response.json();
  return data?.data as ExpenseCategory;
}

export async function deleteExpenseCategory(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/expenses/categories/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete expense category");
  }

  const data = await response.json();
  return data?.data as ExpenseCategory;
}

export async function fetchExpenses(
  token?: string,
  businessId?: string,
  branchId?: string | null,
  supplierId?: string,
  employeeId?: string,
  productionOrderId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/expenses",
    {
      businessId,
      branchId,
      supplierId,
      employeeId,
      productionOrderId,
    },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load expenses");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? (payload.data as Expense[]) : [];
}

export async function createExpense(payload: Partial<Expense>, token?: string) {
  const response = await apiRequest(
    "POST",
    "/expenses",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create expense");
  }

  const data = await response.json();
  return data?.data as Expense;
}

export async function updateExpense(
  id: string,
  payload: Partial<Expense>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/expenses/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update expense");
  }

  const data = await response.json();
  return data?.data as Expense;
}

export async function deleteExpense(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/expenses/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete expense");
  }

  const data = await response.json();
  return data?.data as Expense;
}

export async function fetchExpensePayments(token?: string, expenseId?: string) {
  const response = await apiRequest(
    "GET",
    "/expenses/payments",
    { expenseId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load expense payments");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? (payload.data as ExpensePayment[]) : [];
}

export async function createExpensePayment(
  payload: ExpensePaymentPayload,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/expenses/payments",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create expense payment");
  }

  const data = await response.json();
  return data?.data as ExpensePayment;
}

export async function updateExpensePayment(
  id: string,
  payload: Partial<ExpensePayment>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/expenses/payments/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update expense payment");
  }

  const data = await response.json();
  return data?.data as ExpensePayment;
}

export async function deleteExpensePayment(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/expenses/payments/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete expense payment");
  }

  const data = await response.json();
  return data?.data as ExpensePayment;
}

export async function fetchExpenseApprovals(
  token?: string,
  expenseId?: string,
  status?: string,
) {
  const response = await apiRequest(
    "GET",
    "/expenses/approvals",
    { expenseId, status },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load expense approvals");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data)
    ? (payload.data as ExpenseApproval[])
    : [];
}

export async function createExpenseApproval(
  payload: ExpenseApprovalPayload,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/expenses/approvals",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create expense approval");
  }

  const data = await response.json();
  return data?.data as ExpenseApproval;
}

export async function updateExpenseApproval(
  id: string,
  payload: Partial<ExpenseApproval>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/expenses/approvals/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update expense approval");
  }

  const data = await response.json();
  return data?.data as ExpenseApproval;
}

export async function deleteExpenseApproval(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/expenses/approvals/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete expense approval");
  }

  const data = await response.json();
  return data?.data as ExpenseApproval;
}

export async function fetchExpenseAttachments(
  token?: string,
  expenseId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/expenses/attachments",
    { expenseId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load expense attachments");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data)
    ? (payload.data as ExpenseAttachment[])
    : [];
}

export async function createExpenseAttachment(
  payload: Partial<ExpenseAttachment>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/expenses/attachments",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create expense attachment");
  }

  const data = await response.json();
  return data?.data as ExpenseAttachment;
}

export async function updateExpenseAttachment(
  id: string,
  payload: Partial<ExpenseAttachment>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/expenses/attachments/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update expense attachment");
  }

  const data = await response.json();
  return data?.data as ExpenseAttachment;
}

export async function deleteExpenseAttachment(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/expenses/attachments/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete expense attachment");
  }

  const data = await response.json();
  return data?.data as ExpenseAttachment;
}
