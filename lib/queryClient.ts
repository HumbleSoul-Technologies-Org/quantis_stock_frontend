 import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

// simple in-memory rate limit tracker (requests per window)
const REQUEST_THRESHOLD = parseInt(process.env.NEXT_PUBLIC_VITE_API_THRESHOLD || "60", 10); // max requests per window
const THROTTLE_WINDOW = parseInt(process.env.NEXT_PUBLIC_VITE_THROTTLE_WINDOW || "60000", 10); // 1 minute by default
let requestTimestamps: number[] = [];

function checkRateLimit() {
  const now = Date.now();
  // drop old timestamps
  requestTimestamps = requestTimestamps.filter(ts => now - ts < THROTTLE_WINDOW);
  if (requestTimestamps.length >= REQUEST_THRESHOLD) {
    throw new Error("API request limit exceeded, please try again later");
  }
  requestTimestamps.push(now);
}

// ✅ Axios instance for GET only
const axiosClient = axios.create({
  baseURL: BASE_URL,
});

// attach rate limit check to every request
axiosClient.interceptors.request.use((config) => {
  checkRateLimit();
  return config;
});

// ✅ Throws error if response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`) as any;
    error.status = res.status;
    error.response = res;
    throw error;
  }
}

// ✅ Handles GET / POST / PUT / PATCH / DELETE
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  token?: string,
): Promise<Response> {
  checkRateLimit();

  // prepare headers/body properly; support FormData by letting the browser set multipart boundary
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  let finalUrl = url;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // For GET requests, convert data to query parameters and don't send body
  if (method.toUpperCase() === 'GET') {
    if (data && typeof data === 'object') {
      const params = new URLSearchParams();
      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
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

  const res = await fetch(`${BASE_URL}${finalUrl}`, {
    method,
    headers,
    ...(body !== undefined && { body }), // Only include body if it's defined
    // Don't include credentials by default - let the backend handle CORS properly
    // credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
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
    } catch (error: any) {
      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }

      if (error.response?.status === 401 && on401 === "returnNull") {
        return null;
      }

      throw new Error(error.response?.data || error.message);
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
