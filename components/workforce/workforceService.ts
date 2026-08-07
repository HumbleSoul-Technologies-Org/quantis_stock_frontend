import { apiRequest } from "@/lib/queryClient";

export async function fetchWorkforceWorkers(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/workers",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load workers");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforceWorker(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/workers",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create worker");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforceWorker(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/workers/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update worker");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforceWorker(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/workers/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete worker");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforceAttendance(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/attendance",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load attendance");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforceAttendance(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/attendance",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create attendance record");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforceAttendance(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/attendance/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update attendance");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforceAttendance(id: string, token?: string) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/attendance/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete attendance");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforceAttendancePolicies(
  token?: string,
  businessId?: string,
  branchId?: string | null,
) {
  const response = await apiRequest(
    "GET",
    "/workforce/attendance-policies",
    { businessId, branchId },
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to load attendance policies");
  }

  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

export async function createWorkforceAttendancePolicy(
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "POST",
    "/workforce/attendance-policies",
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to create attendance policy");
  }

  const data = await response.json();
  return data?.data;
}

export async function updateWorkforceAttendancePolicy(
  id: string,
  payload: Record<string, unknown>,
  token?: string,
) {
  const response = await apiRequest(
    "PUT",
    `/workforce/attendance-policies/${id}`,
    payload,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to update attendance policy");
  }

  const data = await response.json();
  return data?.data;
}

export async function deleteWorkforceAttendancePolicy(
  id: string,
  token?: string,
) {
  const response = await apiRequest(
    "DELETE",
    `/workforce/attendance-policies/${id}`,
    undefined,
    token || undefined,
  );

  if (!response.ok) {
    throw new Error("Unable to delete attendance policy");
  }

  const data = await response.json();
  return data?.data;
}

export async function fetchWorkforceBranches(token?: string) {
  const response = await apiRequest("GET", "/branches", {}, token || undefined);

  if (!response.ok) {
    throw new Error("Unable to load branches");
  }

  const payload = await response.json();
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}
