import { IEvaluationAdapter, EvaluationCase, EvaluationResult } from "./IEvaluationAdapter";
import { analyzeJobWithRAG } from "../../rag/ragService";

export class V2RagAdapter implements IEvaluationAdapter {
  systemVersion = "V2-RAG";

  getSystemVersion(): string {
    return this.systemVersion;
  }

  async evaluate(testCase: EvaluationCase): Promise<EvaluationResult> {
    const startTime = Date.now();
    
    try {
      const result: any = await analyzeJobWithRAG(testCase.text);
      
      // Parse decision
      let decision: "SCAM" | "SAFE" | "ABSTAIN";
      if (result._rawDecision) {
        decision = result._rawDecision as "SCAM" | "SAFE" | "ABSTAIN";
      } else {
        if (result.scam_probability >= 0.5) {
          decision = "SCAM";
        } else if (result.scam_probability <= 0.3) {
          decision = "SAFE";
        } else {
          decision = "ABSTAIN";
        }
      }

      // Calculate retrieval metrics
      // Signal Recall: What % of expected_signals were found in the retrieved context?
      let signalRecall = 0;
      let evidenceCoverage = 0;
      
      if (testCase.expected_signals && testCase.expected_signals.length > 0 && result._ragContext) {
        const retrievedTags = result._ragContext.flatMap((c: any) => c.tags || []);
        
        let foundSignals = 0;
        for (const expected of testCase.expected_signals) {
          if (retrievedTags.some((tag: string) => tag.includes(expected) || expected.includes(tag))) {
            foundSignals++;
          }
        }
        
        signalRecall = foundSignals / testCase.expected_signals.length;
        evidenceCoverage = result._ragContext.length > 0 ? 1.0 : 0.0;
      }

      return {
        decision,
        mode: "LIVE",
        confidence: Math.abs(result.scam_probability - 0.5) * 2,
        detected_signals: result.suspicious_phrases || [],
        latencyMs: Date.now() - startTime,
        cost: 0.01, // Mock RAG LLM cost
        isError: false,
        retrievalMetrics: {
          signalRecall,
          evidenceCoverage
        }
      };
    } catch (err: any) {
      console.error(`V2RagAdapter Error on ${testCase.id}:`, err.message);
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
