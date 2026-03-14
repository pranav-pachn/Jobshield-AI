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

  const response = await fetch(input, {
    ...requestOptions,
    headers: mergedHeaders,
  });

  if (response.status === 401) {
    clearAuthSession();
    onUnauthorized?.();
  }

  return response;
}
