/**
 * API Response Types for Dashboard Analytics Endpoints
 */

export interface StatsResponse {
  total_analyses: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  average_scam_score: number;
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
