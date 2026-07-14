import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { parseApiError } from "@/lib/errorParsers";

// ✅ Axios instance for GET only
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

// This wrapper returns a normalized response object and preserves parsed JSON/error payloads.
interface ApiRequestResponse<T = unknown> {
  ok: boolean;
  status: number;
  headers: Headers;
  data: T;
  originalResponse: Response;
  json: () => Promise<T>;
  text: () => Promise<string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createApiResponse<T = any>(
  res: Response,
): Promise<ApiRequestResponse<T>> {
  const responseText = await res.text();
  let parsedBody: unknown;

  try {
    parsedBody = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    parsedBody = responseText;
  }

  return {
    ok: res.ok,
    status: res.status,
    headers: res.headers,
    data: parsedBody as T,
    originalResponse: res,
    json: async () => parsedBody as T,
    text: async () => responseText,
  };
}

function isGenericErrorMessage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  if (
    lower === "validation failed" ||
    lower === "validation_error" ||
    lower === "error" ||
    lower === "bad request"
  ) {
    return true;
  }

  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  if (/^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}(\.\d+)?z$/i.test(trimmed)) {
    return true;
  }

  if (/^[A-Z0-9_]+$/.test(trimmed) && trimmed.length > 3) {
    return true;
  }

  return false;
}

function splitErrorString(text: string): string[] {
  return text
    .split(/\r?\n|\.\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function normalizeErrorMessages(messages: string[]): string[] {
  return Array.from(new Set(messages.map((message) => message.trim())))
    .filter(Boolean)
    .filter((message) => !isGenericErrorMessage(message));
}

function flattenApiErrorMessages(data: unknown): string[] {
  if (typeof data === "string") {
    return normalizeErrorMessages(splitErrorString(data));
  }

  if (Array.isArray(data)) {
    return data.flatMap(flattenApiErrorMessages);
  }

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;
    const results: string[] = [];

    if (typeof objectData.message === "string" && objectData.message.trim()) {
      results.push(...splitErrorString(objectData.message));
    }

    if (typeof objectData.error === "string" && objectData.error.trim()) {
      results.push(...splitErrorString(objectData.error));
    }

    if (typeof objectData.details === "string" && objectData.details.trim()) {
      results.push(...splitErrorString(objectData.details));
    }

    if (Array.isArray(objectData.messages)) {
      results.push(
        ...objectData.messages
          .filter((message): message is string => typeof message === "string")
          .flatMap(splitErrorString),
      );
    }

    for (const value of Object.values(objectData)) {
      if (value !== objectData.message && value !== objectData.error) {
        results.push(...flattenApiErrorMessages(value));
      }
    }

    return normalizeErrorMessages(results);
  }

  return [];
}

export function extractApiErrorMessage<T = any>(
  response: ApiRequestResponse<T>,
): string {
  const responseData = response.data;

  if (responseData && typeof responseData === "object") {
    const parsed = parseApiError(responseData);
    const fieldMessages = Object.values(parsed.fields)
      .flatMap((field) => field.messages)
      .filter(Boolean)
      .map((message) => message.trim());

    if (fieldMessages.length > 0) {
      return normalizeErrorMessages(fieldMessages).join(". ");
    }

    const generalMessage = parsed.general?.trim();
    if (generalMessage && !isGenericErrorMessage(generalMessage)) {
      return generalMessage;
    }
  }

  if (typeof responseData === "string" && responseData.trim()) {
    const trimmed = responseData.trim();
    return isGenericErrorMessage(trimmed)
      ? response.originalResponse.statusText || trimmed
      : trimmed;
  }

  const messages = flattenApiErrorMessages(responseData);
  if (messages.length > 0) {
    return messages.join(". ");
  }

  return response.originalResponse.statusText || "An unexpected error occurred";
}

// Handles GET / POST / PUT / PATCH / DELETE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
  token?: string,
): Promise<ApiRequestResponse<T>> {
  // prepare headers/body properly; support FormData by letting the browser set multipart boundary
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  let finalUrl = url;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // For GET requests, convert data to query parameters and don't send body
  if (method.toUpperCase() === "GET") {
    if (data && typeof data === "object") {
      const params = new URLSearchParams();
      Object.entries(data as Record<string, unknown>).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        },
      );
      const queryString = params.toString();
      if (queryString) {
        finalUrl = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
      }
    }
    // GET requests never have a body
    body = undefined;
  } else if (data instanceof FormData) {
    // leave headers empty for multipart except auth
    body = data;
  } else if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE_URL}${finalUrl}`, {
    method,
    headers,
    ...(body !== undefined && { body }), // Only include body if it's defined
    // Don't include credentials by default - let the backend handle CORS properly
    // credentials: "include",
  });

  return await createApiResponse(res);
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  timeout?: number; // optional timeout in ms
}) => QueryFunction<T> =
  ({ on401, timeout = 5000 }) =>
  async ({ queryKey, signal }) => {
    // React Query passes its own abort signal
    const controller = new AbortController();

    // If React Query aborts, abort axios request too
    signal?.addEventListener("abort", () => controller.abort());

    // Custom timeout abort
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const args = queryKey as unknown as [string, string?, string?];
      const url = `/${args[0]}`;
      const token = args[1] as string | undefined;

      const response = await axiosClient.get(url, {
        signal: controller.signal,
        withCredentials: false, // Explicitly disable credentials for GET requests
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }

      const axiosError = error as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };

      if (axiosError.response?.status === 401 && on401 === "returnNull") {
        return null;
      }

      throw new Error(
        typeof axiosError.response?.data === "string"
          ? axiosError.response.data
          : axiosError.message || "An error occurred",
      );
    } finally {
      clearTimeout(timer);
    }
  };

// ✅ React Query Global Config
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 5000,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds - reduces lag while preventing excessive polling
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});
