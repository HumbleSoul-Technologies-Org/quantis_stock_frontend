import { apiRequest } from "@/lib/queryClient";

export async function fetchWorkforcePayrollRuns(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/payroll-runs",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load payroll runs");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforcePayrollRun(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/payroll-runs",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create payroll run");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforcePayrollRun(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/payroll-runs/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update payroll run");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforcePayrollRun(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/payroll-runs/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete payroll run");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforcePayrollPolicies(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/payroll-policies",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load payroll policies");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforcePayrollPolicy(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/payroll-policies",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create payroll policy");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforcePayrollEntries(
  token?: string,
  businessId?: string,
  runId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/payroll-entries",
    { businessId, runId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load payroll entries");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforcePayrollEntry(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/payroll-entries",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create payroll entry");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforcePayrollEntry(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/payroll-entries/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update payroll entry");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforcePayrollEntry(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/payroll-entries/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete payroll entry");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforcePayslips(token?: string, entryId?: string) {
  const response = await apiRequest(
    "GET",
    "/workforce/payslips",
    { entryId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load payslips");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforcePayslip(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/payslips",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create payslip");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforceAdvanceDeductions(
  token?: string,
  advanceId?: string,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/advance-deductions",
    { advanceId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load advance deductions");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforceAdvanceDeduction(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/advance-deductions",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create advance deduction");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforceAdvances(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/advances",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load advances");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforceAdvance(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/advances",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create advance");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforceAdvance(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/advances/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update advance");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforceAdvance(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/advances/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete advance");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforceAdvanceDeduction(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/advance-deductions/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update advance deduction");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforceAdvanceDeduction(
  id: string,
  token?: string,
) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/advance-deductions/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete advance deduction");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforcePayslip(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/payslips/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update payslip");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforcePayslip(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/payslips/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete payslip");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforcePayrollPolicy(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/payroll-policies/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update payroll policy");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforcePayrollPolicy(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/payroll-policies/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete payroll policy");
  }

  const data = await response.json();
  return data?.data;
}
