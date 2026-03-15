/**
 * API Response Types for Dashboard Analytics Endpoints
 */

export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface StatsResponse {
  total_analyses: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  average_scam_score: number | null;
}

export interface RiskDistributionResponse {
  Low: number;
  Medium: number;
  High: number;
}

export interface TrendItem {
  date: string;
  high: number;
  medium: number;
  low: number;
}

export type TrendsResponse = TrendItem[];

export interface TopIndicatorItem {
  phrase: string;
  count: number;
}

export type TopIndicatorsResponse = TopIndicatorItem[];

export interface RecentAnalysis {
  id: string;
  timestamp: string;
  risk_level: "High" | "Medium" | "Low";
  scam_probability: number;
  job_text_preview: string;
}

export type RecentAnalysesResponse = RecentAnalysis[];

// Chart data formats
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
}

export interface TrendChartItem {
  date: string;
  High: number;
  Medium: number;
  Low: number;
}

export interface IndicatorChartItem {
  phrase: string;
  count: number;
}

// Phase 5: New Monitoring Features
export interface ThreatActivity {
  id: string;
  risk_level: RiskLevel;
  title: string;
  description: string;
  timestamp: string;
  job_id?: string;
  indicators?: string[];
}

export interface ThreatActivityResponse {
  activities: ThreatActivity[];
  total_count: number;
}

export interface LastAnalysisResult {
  job_id: string;
  job_title: string;
  company: string;
  risk_level: RiskLevel;
  confidence: number;
  indicators: string[];
  analyzed_at: string;
}

export interface LastAnalysisResponse {
  result?: LastAnalysisResult;
  message: string;
}

export interface SystemStatus {
  ai_engine: 'online' | 'offline' | 'degraded';
  database: 'connected' | 'disconnected' | 'slow';
  monitoring: 'active' | 'inactive';
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  ai_engine: SystemStatus['ai_engine'];
  database: SystemStatus['database'];
  monitoring: SystemStatus['monitoring'];
  timestamp: string;
}
