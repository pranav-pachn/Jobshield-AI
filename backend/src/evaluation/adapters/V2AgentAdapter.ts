import { IEvaluationAdapter, EvaluationCase, EvaluationResult } from "./IEvaluationAdapter";
import { MockInvestigationAgent, LiveInvestigationAgent } from "../../agent/investigationAgent";
import { computeAgentRisk } from "../../services/signalNormalizer";

import { env } from "../../config/env";

export class V2AgentAdapter implements IEvaluationAdapter {
  systemVersion = "V2-Agent";

  getSystemVersion(): string {
    return this.systemVersion;
  }

  async evaluate(testCase: EvaluationCase): Promise<EvaluationResult> {
    const startTime = Date.now();
    
    const agent = env.agentMode === "live" ? new LiveInvestigationAgent() : new MockInvestigationAgent();
    
    try {
      const result = await agent.investigate({
        jobDescription: testCase.text,
        recruiterEmail: testCase.metadata?.recruiterEmail || undefined
      });
      
      const riskResult = computeAgentRisk(result);
      const latencyMs = Date.now() - startTime;
      
      // Calculate retrieval metrics
      let signalRecall = 0;
      let evidenceCoverage = result.evidence.length > 0 ? 1.0 : 0.0;
      
      if (testCase.expected_signals && testCase.expected_signals.length > 0) {
        const foundTags = result.signals.map(s => s.type)
          .concat(result.evidence.flatMap(e => e.summary.split(" "))); // basic matching
          
        let foundCount = 0;
        for (const expected of testCase.expected_signals) {
          if (foundTags.some((tag: string) => tag.includes(expected) || expected.includes(tag))) {
            foundCount++;
          }
        }
        signalRecall = foundCount / testCase.expected_signals.length;
      }

      // Map RiskLevel back to SCAM/SAFE/ABSTAIN for the generic adapter EvaluationResult
      let decision: "SCAM" | "SAFE" | "ABSTAIN";
      if (result.verdict === "CONFLICT" || riskResult.confidence < 20) {
        decision = "ABSTAIN";
      } else if (riskResult.finalScore > 50) {
        decision = "SCAM";
      } else {
        decision = "SAFE";
      }

      return {
        decision,
        mode: result.mode,
        reason: result.reason,
        confidence: riskResult.confidence / 100, // normalized 0-1
        detected_signals: result.signals.map(s => s.description),
        latencyMs,
        cost: result.agentMetrics.estimatedCostUsd || 0,
        totalTokens: result.agentMetrics.totalTokens || 0,
        inputTokens: result.agentMetrics.inputTokens || 0,
        outputTokens: result.agentMetrics.outputTokens || 0,
        isError: false,
        retrievalMetrics: {
          signalRecall,
          evidenceCoverage
        },
        agentMetrics: result.agentMetrics
      };
    } catch (err: any) {
      console.error(`V2AgentAdapter Error on ${testCase.id}:`, err.message);
      return {
        decision: "ABSTAIN",
        mode: "DEGRADED",
        reason: "PROVIDER_UNAVAILABLE",
        confidence: 0,
        detected_signals: [],
        latencyMs: Date.now() - startTime,
        cost: 0,
        isError: true,
        errorMessage: err.message
      };
    }
  }
}
