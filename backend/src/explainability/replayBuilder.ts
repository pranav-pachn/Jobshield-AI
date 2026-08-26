import { IInvestigationTrace } from "../models/InvestigationTrace";

export interface ReplayEvent {
  id: string;
  timestamp: string; // ms offset or actual timestamp string
  type:
    | "START"
    | "TOOL_CALL"
    | "EVIDENCE_FOUND"
    | "CORRELATION"
    | "RISK_CALCULATION"
    | "CAMPAIGN_DETECTED"
    | "FINAL_VERDICT";

  title: string;
  description: string;

  tool?: string;
  evidenceIds?: string[];
  campaignId?: string;

  status: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
}

// Maps backend agent tools to semantic frontend labels
const TOOL_LABELS: Record<string, string> = {
  analyze_url: "URL INTELLIGENCE",
  search_threat_knowledge: "THREAT KNOWLEDGE SEARCH",
  get_threat_record: "THREAT RECORD RETRIEVAL",
  analyze_recruiter: "RECRUITER INTELLIGENCE",
  find_similar_cases: "HISTORICAL CORRELATION"
};

export function buildReplayEvents(
  trace: IInvestigationTrace | null,
  analysis: any,
  campaigns: any[] = []
): ReplayEvent[] {
  const events: ReplayEvent[] = [];
  const baseTime = trace ? new Date(trace.startedAt).getTime() : new Date(analysis.created_at).getTime();

  let timeOffset = 0;
  const nextTime = (incrementMs: number = 1000) => {
    timeOffset += incrementMs;
    return new Date(baseTime + timeOffset).toISOString();
  };

  // 1. START
  events.push({
    id: `start-${analysis._id}`,
    timestamp: new Date(baseTime).toISOString(),
    type: "START",
    title: "ANALYSIS STARTED",
    description: `Investigation #${analysis._id.toString().substring(0, 8).toUpperCase()}`,
    status: "INFO"
  });

  if (!trace) {
    // If no trace is available, we just jump to the verdict (perhaps it's an old record or error)
    events.push({
      id: `verdict-${analysis._id}`,
      timestamp: nextTime(500),
      type: "FINAL_VERDICT",
      title: "INVESTIGATION COMPLETE",
      description: "No trace data available for this analysis.",
      status: "WARNING"
    });
    return events;
  }

  // 2. Map trace steps (TOOL_CALLs)
  // We only add steps that actually happened. If no recruiter tool was used, it won't appear.
  if (trace.steps && trace.steps.length > 0) {
    trace.steps.forEach((step, idx) => {
      events.push({
        id: `tool-${idx}-${step.tool}`,
        timestamp: nextTime(step.latencyMs || 800),
        type: "TOOL_CALL",
        title: TOOL_LABELS[step.tool] || step.tool.toUpperCase(),
        description: `Agent executed ${step.tool}`,
        tool: step.tool,
        status: step.status === "error" ? "ERROR" : step.status === "skipped" ? "WARNING" : "SUCCESS"
      });
    });
  }

  // 3. EVIDENCE_FOUND
  if (trace.evidence && trace.evidence.length > 0) {
    events.push({
      id: `evidence-${analysis._id}`,
      timestamp: nextTime(),
      type: "EVIDENCE_FOUND",
      title: "EVIDENCE GATHERED",
      description: `${trace.evidence.length} pieces of evidence retrieved across sources`,
      status: "SUCCESS"
    });
  }

  // 4. RISK_CALCULATION
  if (trace.riskBreakdown && trace.riskBreakdown.length > 0) {
    // We can list the top 3 highest impact signals in the description
    const sorted = [...trace.riskBreakdown].sort((a, b) => b.contribution - a.contribution);
    const top = sorted.slice(0, 3).map(r => `+${r.contribution} ${r.signal}`).join('\n');
    
    events.push({
      id: `risk-${analysis._id}`,
      timestamp: nextTime(),
      type: "RISK_CALCULATION",
      title: "RISK CALCULATION",
      description: top + (sorted.length > 3 ? `\n...and ${sorted.length - 3} more signals` : ""),
      status: "INFO"
    });
  }

  // 5. CAMPAIGN_DETECTED
  if (campaigns && campaigns.length > 0) {
    const mainCampaign = campaigns[0];
    events.push({
      id: `campaign-${mainCampaign.campaignId}`,
      timestamp: nextTime(1200),
      type: "CAMPAIGN_DETECTED",
      title: "CAMPAIGN CORRELATION THRESHOLD SATISFIED",
      description: `Detected overlap with ${mainCampaign.campaignId}`,
      campaignId: mainCampaign.campaignId,
      status: "ERROR" // Red alert for campaigns
    });
  }

  // 6. FINAL_VERDICT
  const isAbstain = analysis.risk_level === "UNKNOWN" || analysis.confidence < 20;
  
  if (isAbstain) {
    events.push({
      id: `verdict-${analysis._id}`,
      timestamp: nextTime(),
      type: "FINAL_VERDICT",
      title: "INVESTIGATION COMPLETE: INCONCLUSIVE",
      description: "Evidence insufficient for a confident verdict.",
      status: "WARNING"
    });
  } else {
    events.push({
      id: `verdict-${analysis._id}`,
      timestamp: nextTime(),
      type: "FINAL_VERDICT",
      title: "FINAL INVESTIGATION RESULT",
      description: `Risk Engine: ${Math.round(analysis.scam_probability * 100)}/100 -> ${analysis.risk_level}`,
      status: analysis.risk_level === "CRITICAL" || analysis.risk_level === "HIGH" ? "ERROR" : "SUCCESS"
    });
  }

  return events;
}
