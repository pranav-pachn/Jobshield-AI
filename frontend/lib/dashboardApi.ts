/**
 * API fetching functions for Dashboard Analytics
 */

import {
  StatsResponse,
  RiskDistributionResponse,
  TrendsResponse,
  TopIndicatorsResponse,
  RecentAnalysesResponse,
} from "./dashboardTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface ApiError {
  message: string;
  status?: number;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: "no-store", // Ensure fresh data
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw {
        message: `Failed to fetch ${endpoint}`,
        status: response.status,
      } as ApiError;
    }

    return response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export async function fetchStats(): Promise<StatsResponse> {
  return fetchApi<StatsResponse>("/jobs/stats");
}

export async function fetchRiskDistribution(): Promise<RiskDistributionResponse> {
  return fetchApi<RiskDistributionResponse>("/analytics/risk-distribution");
}

export async function fetchTrends(): Promise<TrendsResponse> {
  return fetchApi<TrendsResponse>("/analytics/trends");
}

export async function fetchTopIndicators(): Promise<TopIndicatorsResponse> {
  return fetchApi<TopIndicatorsResponse>("/analytics/top-indicators");
}

export async function fetchRecentAnalyses(): Promise<RecentAnalysesResponse> {
  return fetchApi<RecentAnalysesResponse>("/jobs/recent");
}

/**
 * Fetch all dashboard data in parallel
 */
export async function fetchAllDashboardData() {
  return Promise.all([
    fetchStats(),
    fetchRiskDistribution(),
    fetchTrends(),
    fetchTopIndicators(),
    fetchRecentAnalyses(),
  ]);
}
