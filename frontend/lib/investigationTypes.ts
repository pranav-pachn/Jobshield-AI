export type InvestigationState = 
  | "RECEIVED"
  | "PLANNING"
  | "INVESTIGATING"
  | "EVIDENCE_AGGREGATION"
  | "CONTRADICTION_ANALYSIS"
  | "FINAL_DECISION"
  | "COMPLETED"
  | "FAILED";

export interface DecisionPolicyResult {
  decision: "SAFE" | "HUMAN_REVIEW" | "SCAM";
  policy_version: string;
  reason: string;
  risk: number;
  confidence: number;
}

export interface EvaluationDimension {
  score: number;
  label: string;
}

export interface EvidenceQuality {
  level: "Low" | "Medium" | "High";
  score: number;
}

export interface BetterEvaluation {
  content_risk:          EvaluationDimension;
  recruiter_trust:       EvaluationDimension;
  threat_match:          EvaluationDimension;
  historical_similarity: EvaluationDimension;
  overall_risk:          EvaluationDimension;
  evidence_quality:      EvidenceQuality;
  confidence:            number;
  sources_used:          number;
  contradictions:        number;
  missing_evidence:      number;
}

export interface InvestigationInput {
  jobText: string;
  recruiterName?: string;
  email?: string;
  emailDomain?: string;
  company?: string;
  companyDomain?: string;
  linkedinUrl?: string;
  phone?: string;
  jobUrl?: string;
  recruiterContext?: Record<string, unknown>;
}

export interface Signal {
  signal: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  evidence: string;
}

export interface ThreatMatch {
  sourceId: string;
  similarity: number;
  evidenceQuality: string;
  relevance: "low" | "medium" | "high";
  agentConfidence: number;
  evidence: string;
}

export interface ContradictionDetail {
  description: string;
  agents: string[];
}

export interface EvidenceBundle {
  contentEvidence: Signal[];
  recruiterEvidence: Signal[];
  threatEvidence: ThreatMatch[];
  supportingSignals: number;
  contradictions: number;
  contradictionDetails: ContradictionDetail[];
  missingEvidence: string[];
  overallEvidenceConfidence: number;
  investigationMetadata: Record<string, unknown>;
}

export interface FinalDecisionOutput {
  verdict: "SAFE" | "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL";
  riskScore: number;
  confidence: number;
  why: string[];
  evidence: Record<string, unknown>[];
  contradictions: string[];
  recommendations: string[];
}

export interface AgentFailure {
  agent: string;
  status: "failed";
  reason: string;
  fallback: "insufficient_evidence" | "empty_results";
}

export interface ContentInvestigatorOutput {
  agent: "content_investigator";
  riskSignals: Signal[];
  riskScore: number;
  confidence: number;
}

export interface RecruiterInvestigatorOutput {
  agent: "recruiter_investigator";
  identitySignals: Signal[];
  consistencyScore: number;
  status: "success" | "insufficient_evidence" | "failed";
}

export interface ThreatIntelligenceOutput {
  agent: "threat_intelligence";
  matches: ThreatMatch[];
  confidence: number;
  status: "success" | "failed";
}

export interface ProviderAttempt {
  provider: string;
  model: string;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'NO_CREDITS' | 'AUTH_FAILED' | 'MODEL_UNAVAILABLE' | 'TIMEOUT' | 'NETWORK_ERROR' | 'VALIDATION_FAILED' | 'MALFORMED_JSON' | 'EMPTY_RESPONSE' | 'UNKNOWN_ERROR';
  latencyMs: number;
  error?: string;
}

export interface AgentTrace {
  agentName: string;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  providerAttempts: ProviderAttempt[];
  inputTokens?: number;
  outputTokens?: number;
  status: string;
  output: unknown;
}

export interface InvestigationTrace {
  investigationId: string;
  state: 'RECEIVED' | 'PLANNING' | 'INVESTIGATING' | 'EVIDENCE_AGGREGATION' | 'FINAL_DECISION' | 'COMPLETED' | 'PARTIAL' | 'DEGRADED' | 'FAILED';
  degradationReason?: string;
  input: InvestigationInput;
  agentTraces: AgentTrace[];
  contentFindings?: ContentInvestigatorOutput | AgentFailure;
  recruiterFindings?: RecruiterInvestigatorOutput | AgentFailure;
  threatFindings?: ThreatIntelligenceOutput | AgentFailure;
  evidenceAggregation?: EvidenceBundle;
  finalDecision?: FinalDecisionOutput;
  createdAt: string;
  completedAt?: string;
  totalLatencyMs?: number;
  evaluation?: BetterEvaluation;
  decisionPolicy?: DecisionPolicyResult;
}
