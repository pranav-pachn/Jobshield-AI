export interface AnalyticsOverview {
  totalInvestigations: number;
  scamCount: number;
  legitimateCount: number;
  humanReviewCount: number;
  averageConfidence: number;
  highRiskPercentage: number;
}

export interface ScamTrend {
  signalName: string;
  count: number;
  percentage: number;
}

export interface ThreatSummary {
  threatName: string;
  matchedInvestigations: number;
  averageSimilarity: number;
}

export interface PerformanceMetrics {
  averageLatencyMs: number;
  agentLatencies: {
    contentInvestigator: number;
    recruiterInvestigator: number;
    threatIntelligence: number;
    finalDecision: number;
  };
  totalTokensUsed: number;
}

export interface ExplanationSignal {
  type: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
}

export interface ExplanationEvidence {
  summary: string;
  supportingSignals: number;
  contradictions: number;
  missingEvidence: string[];
}

export interface ExplanationAgentFinding {
  agent: string;
  summary: string;
  confidence: number;
  latencyMs: number;
}

export interface ExplanationDecisionPolicy {
  decision: "SCAM" | "LEGITIMATE" | "HUMAN_REVIEW";
  reason: string;
  riskScore: number;
  policyVersion: string;
}

export interface InvestigationExplanation {
  investigationId: string;
  signals: ExplanationSignal[];
  evidence: ExplanationEvidence;
  agentFindings: ExplanationAgentFinding[];
  decisionPolicy: ExplanationDecisionPolicy;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // Serialized as string from API
  agent: string;
  status: "started" | "success" | "failed";
  durationMs?: number;
  details?: string;
}

export interface InvestigationTimeline {
  investigationId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  events: TimelineEvent[];
}
