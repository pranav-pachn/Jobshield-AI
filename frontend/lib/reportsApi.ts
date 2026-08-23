import { api } from "./apiClient";
import { getApiUrl } from "@/lib/apiConfig";

export interface ReportItem {
  id: string;
  title: string;
  company: string;
  decision: "SCAM" | "HUMAN_REVIEW" | "SAFE";
  riskScore: number;
  confidenceScore: number;
  createdAt: string;
}

export interface ReportsResponse {
  reports: ReportItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const reportsApi = {
  getReports: (page: number = 1, limit: number = 20): Promise<ReportsResponse> =>
    api.get(`${getApiUrl()}/api/reports?page=${page}&limit=${limit}`),
    
  getReportById: (id: string): Promise<ReportItem> =>
    api.get(`${getApiUrl()}/api/reports/${id}`),
};
