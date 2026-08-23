import { Investigation } from "../models/Investigation";
import { 
  InvestigationExplanation,
  InvestigationTimeline,
  TimelineEvent,
  ExplanationSignal,
  ExplanationEvidence,
  ExplanationAgentFinding,
  ExplanationDecisionPolicy
} from "../types/intelligenceTypes";
import { normalizeSignalName } from "./intelligenceService";

export const buildExplanation = async (investigationId: string): Promise<InvestigationExplanation | null> => {
  const investigation = await Investigation.findOne({ investigationId }).lean();
  
  if (!investigation) {
    return null;
  }

  return {
    investigationId,
    signals: extractSignals(investigation),
    evidence: extractEvidence(investigation),
    agentFindings: extractAgentFindings(investigation),
    decisionPolicy: buildDecisionPolicyExplanation(investigation)
  };
};

export const buildTimeline = async (investigationId: string): Promise<InvestigationTimeline | null> => {
  const investigation = await Investigation.findOne({ investigationId }).lean();
  
  if (!investigation) {
    return null;
  }

  const events: TimelineEvent[] = [];
  
  if (investigation.agentTraces && Array.isArray(investigation.agentTraces)) {
    investigation.agentTraces.forEach((trace: any) => {
      events.push({
        id: `${trace.agentName}-${trace.startedAt}`,
        timestamp: new Date(trace.startedAt),
        agent: trace.agentName,
        status: trace.status as "started" | "success" | "failed",
        durationMs: trace.latencyMs,
        details: trace.status === "failed" ? trace.output?.reason : undefined
      });
    });
  }

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return {
    investigationId,
    startedAt: new Date(investigation.createdAt),
    completedAt: investigation.completedAt ? new Date(investigation.completedAt) : new Date(),
    totalDurationMs: investigation.totalLatencyMs || 0,
    events
  };
};

const extractSignals = (investigation: any): ExplanationSignal[] => {
  const signals: ExplanationSignal[] = [];

  // Content signals
  if (investigation.contentFindings?.riskSignals && Array.isArray(investigation.contentFindings.riskSignals)) {
    investigation.contentFindings.riskSignals.forEach((signal: any) => {
      signals.push({
        type: normalizeSignalName(signal.name),
        description: signal.description || "Identified in job content",
        severity: (signal.severity || "medium") as any,
        source: "content_investigator"
      });
    });
  }

  // Recruiter signals
  if (investigation.recruiterFindings?.identitySignals && Array.isArray(investigation.recruiterFindings.identitySignals)) {
    investigation.recruiterFindings.identitySignals.forEach((signal: any) => {
      signals.push({
        type: normalizeSignalName(signal.name || "recruiter_signal"),
        description: signal.description || "Identified in recruiter profile",
        severity: (signal.severity || "low") as any,
        source: "recruiter_investigator"
      });
    });
  }

  // Threat signals (matches mapped to signals)
  if (investigation.threatFindings?.matches && Array.isArray(investigation.threatFindings.matches)) {
    investigation.threatFindings.matches.forEach((match: any) => {
      signals.push({
        type: "Known Threat Match",
        description: `Matched known threat pattern: ${match.threatName} (${Math.round(match.similarity * 100)}% match)`,
        severity: (match.relevance || "high") as any,
        source: "threat_intelligence"
      });
    });
  }

  return signals;
};

const extractEvidence = (investigation: any): ExplanationEvidence => {
  const aggregation = investigation.evidenceAggregation || {};
  
  return {
    summary: "Evidence aggregated from automated agents",
    supportingSignals: aggregation.supportingSignals || 0,
    contradictions: aggregation.contradictions || 0,
    missingEvidence: aggregation.missingEvidence || []
  };
};

const extractAgentFindings = (investigation: any): ExplanationAgentFinding[] => {
  const findings: ExplanationAgentFinding[] = [];
  
  // Find latencies from traces
  const latencies: Record<string, number> = {};
  if (investigation.agentTraces && Array.isArray(investigation.agentTraces)) {
    investigation.agentTraces.forEach((trace: any) => {
      latencies[trace.agentName] = trace.latencyMs || 0;
    });
  }

  if (investigation.contentFindings) {
    findings.push({
      agent: "Content Investigator",
      summary: investigation.contentFindings.status === "success" 
        ? `Found ${investigation.contentFindings.riskSignals?.length || 0} risk signals with score ${investigation.contentFindings.riskScore}` 
        : `Failed: ${investigation.contentFindings.reason || "Unknown error"}`,
      confidence: investigation.contentFindings.confidence || 0,
      latencyMs: latencies["content_investigator"] || 0
    });
  }

  if (investigation.recruiterFindings) {
    findings.push({
      agent: "Recruiter Investigator",
      summary: investigation.recruiterFindings.status === "success" 
        ? `Verified identity with consistency score ${investigation.recruiterFindings.consistencyScore}` 
        : `Status: ${investigation.recruiterFindings.status}`,
      confidence: investigation.recruiterFindings.status === "success" ? 1.0 : 0.0,
      latencyMs: latencies["recruiter_investigator"] || 0
    });
  }

  if (investigation.threatFindings) {
    findings.push({
      agent: "Threat Intelligence",
      summary: investigation.threatFindings.status === "success" 
        ? `Found ${investigation.threatFindings.matches?.length || 0} known threat matches` 
        : `Status: ${investigation.threatFindings.status}`,
      confidence: investigation.threatFindings.confidence || 0,
      latencyMs: latencies["threat_intelligence_agent"] || latencies["threat_intelligence"] || 0
    });
  }

  return findings;
};

const buildDecisionPolicyExplanation = (investigation: any): ExplanationDecisionPolicy => {
  const policy = investigation.decisionPolicy || {};
  
  return {
    decision: (policy.decision || "HUMAN_REVIEW") as any,
    reason: policy.reason || "Decision policy data not available for this investigation",
    riskScore: policy.risk || (investigation.evaluation?.overall_risk?.score || 0),
    policyVersion: policy.policy_version || "v1"
  };
};
