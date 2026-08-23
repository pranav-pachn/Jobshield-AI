import { api } from './apiClient';
import { getApiUrl } from "@/lib/apiConfig";
import { 
  AnalyticsOverview, 
  ScamTrend, 
  ThreatSummary, 
  PerformanceMetrics,
  InvestigationExplanation,
  InvestigationTimeline
} from "./intelligenceTypes";

export const intelligenceApi = {
  getOverview: (): Promise<AnalyticsOverview> => 
    api.get(`${getApiUrl()}/api/intelligence/overview`),
  
  getTrends: (days: number = 30): Promise<ScamTrend[]> => 
    api.get(`${getApiUrl()}/api/intelligence/trends?days=${days}`),
  
  getThreats: (limit: number = 5): Promise<ThreatSummary[]> => 
    api.get(`${getApiUrl()}/api/intelligence/threats?limit=${limit}`),
  
  getPerformance: (): Promise<PerformanceMetrics> => 
    api.get(`${getApiUrl()}/api/intelligence/performance`),
  
  getExplanation: (investigationId: string): Promise<InvestigationExplanation> => 
    api.get(`${getApiUrl()}/api/investigations/${investigationId}/explanation`),
  
  getTimeline: (investigationId: string): Promise<InvestigationTimeline> => 
    api.get(`${getApiUrl()}/api/investigations/${investigationId}/timeline`)
};
