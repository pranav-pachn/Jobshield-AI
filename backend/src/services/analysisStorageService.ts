import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
import { logger } from "../utils/logger";

export interface SaveAnalysisData {
  job_text: string;
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  suspicious_phrases: string[];
  reasons: string[];
  ai_latency_ms?: number;
  // Enrichment fields
  evidence_sources?: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  similar_patterns?: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  community_report_count?: number;
  confidence_level?: "High" | "Medium" | "Low";
  confidence_reason?: string;
  source_links?: Array<{
    title: string;
    url: string;
    category: string;
  }>;
  component_scores?: {
    rule_score?: number;
    zero_shot_score?: number;
    similarity_score?: number;
  };
}

export async function saveAnalysisResult(data: SaveAnalysisData): Promise<IJobAnalysis | null> {
  try {
    const jobAnalysis = new JobAnalysis({
      job_text: data.job_text,
      scam_probability: data.scam_probability,
      risk_level: data.risk_level,
      suspicious_phrases: data.suspicious_phrases,
      reasons: data.reasons,
      ai_latency_ms: data.ai_latency_ms,
      // Save enrichment data
      evidence_sources: data.evidence_sources,
      domain_intelligence: data.domain_intelligence,
      similar_patterns: data.similar_patterns,
      community_report_count: data.community_report_count,
      confidence_level: data.confidence_level,
      confidence_reason: data.confidence_reason,
      source_links: data.source_links,
      component_scores: data.component_scores,
    });

    const savedAnalysis = await jobAnalysis.save();
    
    logger.info("[Analysis] Saved job analysis", {
      id: savedAnalysis._id,
      risk_level: savedAnalysis.risk_level,
      scam_probability: savedAnalysis.scam_probability,
      enrichment_evidence_count: savedAnalysis.evidence_sources?.length ?? 0,
    });

    return savedAnalysis;
  } catch (error) {
    logger.error("[Analysis] Failed to save job analysis", {
      error: error instanceof Error ? error.message : "Unknown error",
      risk_level: data.risk_level,
      scam_probability: data.scam_probability,
    });
    return null;
  }
}

export interface JobStats {
  total: number;
  scam: number;
  legit: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  avg_probability: number;
  avg_latency_ms: number;
}

export async function getStats(): Promise<JobStats> {
  try {
    const [counts, avgAgg] = await Promise.all([
      JobAnalysis.aggregate([
        {
          $group: {
            _id: "$risk_level",
            count: { $sum: 1 },
            total_prob: { $sum: "$scam_probability" },
            total_latency: { $sum: { $ifNull: ["$ai_latency_ms", 0] } },
          },
        },
      ]),
      JobAnalysis.countDocuments(),
    ]);

    const byRisk: Record<string, { count: number; total_prob: number; total_latency: number }> = {};
    for (const row of counts) {
      byRisk[row._id] = { count: row.count, total_prob: row.total_prob, total_latency: row.total_latency };
    }

    const high = byRisk["High"]?.count ?? 0;
    const medium = byRisk["Medium"]?.count ?? 0;
    const low = byRisk["Low"]?.count ?? 0;
    const total = avgAgg;
    const scam = high + medium;
    const legit = low;

    const sumProb = Object.values(byRisk).reduce((s, r) => s + r.total_prob, 0);
    const sumLatency = Object.values(byRisk).reduce((s, r) => s + r.total_latency, 0);

    return {
      total,
      scam,
      legit,
      high_risk: high,
      medium_risk: medium,
      low_risk: low,
      avg_probability: total > 0 ? Math.round((sumProb / total) * 1000) / 1000 : 0,
      avg_latency_ms: total > 0 ? Math.round(sumLatency / total) : 0,
    };
  } catch (error) {
    logger.error("[Analysis] Failed to retrieve stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return { total: 0, scam: 0, legit: 0, high_risk: 0, medium_risk: 0, low_risk: 0, avg_probability: 0, avg_latency_ms: 0 };
  }
}

export async function getRecentAnalyses(limit: number = 10): Promise<IJobAnalysis[]> {
  try {
    const analyses = await JobAnalysis.find()
      .sort({ created_at: -1 })
      .limit(limit)
      .select("-job_text"); // Exclude job_text for brevity in recent analyses

    logger.info("[Analysis] Retrieved recent analyses", {
      count: analyses.length,
      limit,
    });

    return analyses;
  } catch (error) {
    logger.error("[Analysis] Failed to retrieve recent analyses", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return [];
  }
}
