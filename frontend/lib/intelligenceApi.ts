import { api } from './apiClient';
import { getBackendUrl } from "@/lib/apiConfig";
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
    api.get(`${getBackendUrl()}/api/intelligence/overview`),
  
  getTrends: (days: number = 30): Promise<ScamTrend[]> => 
    api.get(`${getBackendUrl()}/api/intelligence/trends?days=${days}`),
  
  getThreats: (limit: number = 5): Promise<ThreatSummary[]> => 
    api.get(`${getBackendUrl()}/api/intelligence/threats?limit=${limit}`),
  
  getPerformance: (): Promise<PerformanceMetrics> => 
    api.get(`${getBackendUrl()}/api/intelligence/performance`),
  
  getExplanation: (investigationId: string): Promise<InvestigationExplanation> => 
    api.get(`${getBackendUrl()}/api/investigations/${investigationId}/explanation`),
  
  getTimeline: (investigationId: string): Promise<InvestigationTimeline> => 
    api.get(`${getBackendUrl()}/api/investigations/${investigationId}/timeline`)
};
