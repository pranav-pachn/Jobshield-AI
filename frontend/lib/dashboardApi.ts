import {
  StatsResponse,
  RiskDistributionResponse,
  TrendsResponse,
  TopIndicatorsResponse,
  RecentAnalysesResponse,
} from "./dashboardTypes";
import { api } from "./apiClient";
import { getBackendUrl } from "@/lib/apiConfig";

const API_BASE_URL = `${getBackendUrl()}/api`;

export async function fetchStats(): Promise<StatsResponse> {
  return api.get<StatsResponse>(`${API_BASE_URL}/jobs/stats`);
}

export async function fetchRiskDistribution(): Promise<RiskDistributionResponse> {
  return api.get<RiskDistributionResponse>(`${API_BASE_URL}/analytics/risk-distribution`);
}

export async function fetchTrends(): Promise<TrendsResponse> {
  return api.get<TrendsResponse>(`${API_BASE_URL}/analytics/trends`);
}

export async function fetchTopIndicators(): Promise<TopIndicatorsResponse> {
  return api.get<TopIndicatorsResponse>(`${API_BASE_URL}/analytics/top-indicators`);
}

export async function fetchRecentAnalyses(): Promise<RecentAnalysesResponse> {
  return api.get<RecentAnalysesResponse>(`${API_BASE_URL}/jobs/recent`);
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
