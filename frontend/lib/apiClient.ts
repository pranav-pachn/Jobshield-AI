import { clearAuthSession, getStoredToken } from "@/lib/auth";

interface ApiRequestOptions extends RequestInit {
  onUnauthorized?: () => void;
}

export async function apiFetch(input: string, options: ApiRequestOptions = {}) {
  const { onUnauthorized, headers, ...requestOptions } = options;
  const token = getStoredToken();

  const mergedHeaders = new Headers(headers);
  if (token) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  console.log("[apiClient] Making request:", {
    url: input,
    method: requestOptions.method || "GET",
    headers: Object.fromEntries(mergedHeaders.entries())
  });

  try {
    const response = await fetch(input, {
      ...requestOptions,
      headers: mergedHeaders,
    });

    console.log("[apiClient] Response:", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (response.status === 401) {
      clearAuthSession();
      onUnauthorized?.();
    }

    return response;
  } catch (error) {
    console.error("[apiClient] Network error:", error);
    throw error;
  }
}
