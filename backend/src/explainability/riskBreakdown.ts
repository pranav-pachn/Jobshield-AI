import { InvestigationResult } from "../agent/types";
import { ITraceRiskLedger } from "../models/InvestigationTrace";
import { RISK_SIGNAL_RULES } from "../services/riskSignalRules";

export function buildRiskBreakdown(result: InvestigationResult): ITraceRiskLedger[] {
  const breakdown: ITraceRiskLedger[] = [];

  for (const signal of result.signals) {
    const rule = RISK_SIGNAL_RULES[signal.type];
    const penalty = rule ? rule.points : (signal.severity === "CRITICAL" ? 25 : (signal.severity === "HIGH" ? 15 : 5));
    breakdown.push({
      signal: signal.type,
      contribution: penalty
    });
  }

  // Deduplicate in case the agent returned duplicate signals
  const uniqueBreakdown = new Map<string, number>();
  for (const item of breakdown) {
    if (!uniqueBreakdown.has(item.signal) || (uniqueBreakdown.get(item.signal) || 0) < item.contribution) {
      uniqueBreakdown.set(item.signal, item.contribution);
    }
  }

  return Array.from(uniqueBreakdown.entries()).map(([signal, contribution]) => ({
    signal,
    contribution
  }));
}
