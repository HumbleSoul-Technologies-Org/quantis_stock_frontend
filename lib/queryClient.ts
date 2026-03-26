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
    throw new Error(`${res.status}: ${text}`);
  }
}

// ✅ Handles POST / PUT / PATCH / DELETE
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  checkRateLimit();

  // prepare headers/body properly; support FormData by letting the browser set multipart boundary
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (data instanceof FormData) {
    // leave headers empty, fetch will add appropriate content-type including boundary
    body = data;
  } else if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(data);
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body,
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
      const url = `/${queryKey.join("/")}`;

      const response = await axiosClient.get(url, {
        signal: controller.signal,
        withCredentials: false, // Explicitly disable credentials for GET requests
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
      staleTime: 10000,
      retry: true,
    },
    mutations: {
      retry: true,
    },
  },
});
