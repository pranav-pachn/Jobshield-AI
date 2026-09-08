import { clearAuthSession, getStoredToken } from "@/lib/auth";
import { getBackendUrl } from "@/lib/apiConfig";

interface ApiRequestOptions extends RequestInit {
  onUnauthorized?: () => void;
}

export async function apiFetch(input: string, options: ApiRequestOptions = {}) {
  const { onUnauthorized, headers, ...requestOptions } = options;
  const token = getStoredToken();

  const backendUrl = getBackendUrl();
  const isLocalhost = backendUrl.includes("localhost") || backendUrl.includes("127.0.0.1");
  // If backend is remote, bypass proxy and hit it directly to avoid Render timeouts.
  // If local, use relative path so Next.js proxy can handle it.
  const url = input.startsWith('/') && !isLocalhost ? `${backendUrl}${input}` : input;

  const mergedHeaders = new Headers(headers);
  if (token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  console.log("[apiClient] Making request:", {
    url: url,
    method: requestOptions.method || "GET",
    headers: Object.fromEntries(mergedHeaders.entries())
  });

  try {
    const response = await fetch(url, {
      ...requestOptions,
      credentials: requestOptions.credentials ?? "include",
      headers: mergedHeaders,
    });

    console.log("[apiClient] Response:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (response.status === 401) {
      if (token) {
        clearAuthSession();
      }
      onUnauthorized?.();
    }

    return response;
  } catch (error) {
    console.error("[apiClient] Network error:", error);
    throw error;
  }
}

export const api = {
  get: async <T>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const response = await apiFetch(path, { ...options, method: 'GET' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  post: async <T>(path: string, body: any, options?: ApiRequestOptions): Promise<T> => {
    const response = await apiFetch(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
};
