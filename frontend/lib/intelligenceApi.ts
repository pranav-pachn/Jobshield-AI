import { apiFetch } from './apiClient';
import { getApiUrl } from "@/lib/apiConfig";
import { 
  AnalyticsOverview, 
  ScamTrend, 
  ThreatSummary, 
  PerformanceMetrics,
  InvestigationExplanation,
  InvestigationTimeline
} from "./intelligenceTypes";

const getBackendBaseUrl = () => {
  return getApiUrl();
};

export const intelligenceApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/intelligence/overview`);
    return response.json();
  },
  
  getTrends: async (days: number = 30): Promise<ScamTrend[]> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/intelligence/trends?days=${days}`);
    return response.json();
  },
  
  getThreats: async (limit: number = 5): Promise<ThreatSummary[]> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/intelligence/threats?limit=${limit}`);
    return response.json();
  },
  
  getPerformance: async (): Promise<PerformanceMetrics> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/intelligence/performance`);
    return response.json();
  },
  
  getExplanation: async (investigationId: string): Promise<InvestigationExplanation> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/investigations/${investigationId}/explanation`);
    return response.json();
  },
  
  getTimeline: async (investigationId: string): Promise<InvestigationTimeline> => {
    const response = await apiFetch(`${getBackendBaseUrl()}/api/investigations/${investigationId}/timeline`);
    return response.json();
  }
};
