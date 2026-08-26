import useSWR from "swr";
import { getStoredToken } from "@/lib/auth";
import { getBackendUrl } from "@/lib/apiConfig";

const fetcher = async (url: string) => {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  return res.json();
};

export function useThreatIndicators(params: {
  query?: string;
  type?: string;
  riskLevel?: string;
  page?: number;
}) {
  const backendBaseUrl = getBackendUrl();
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.append("query", params.query);
  if (params.type && params.type !== "ALL") searchParams.append("type", params.type);
  if (params.riskLevel) searchParams.append("riskLevel", params.riskLevel);
  if (params.page) searchParams.append("page", params.page.toString());
  
  const queryString = searchParams.toString();
  const url = `${backendBaseUrl}/api/threat/indicators/search${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    data: data?.results || [],
    pagination: data?.pagination || null,
    isLoading,
    isError: error,
  };
}

export function useThreatStats() {
  const backendBaseUrl = getBackendUrl();
  const url = `${backendBaseUrl}/api/threat/indicators/stats`;

  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    stats: data || null,
    isLoading,
    isError: error,
  };
}
