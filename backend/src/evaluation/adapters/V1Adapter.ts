import { IEvaluationAdapter, EvaluationCase, EvaluationResult } from "./IEvaluationAdapter";
import { analyzeJobWithSmartFlow } from "../../services/smartAnalysisService";

export class V1Adapter implements IEvaluationAdapter {
  getSystemVersion(): string {
    return "V1-Heuristic";
  }

  async evaluate(testCase: EvaluationCase): Promise<EvaluationResult> {
    const startTime = Date.now();
    try {
      const result = await analyzeJobWithSmartFlow(testCase.text);
      const latencyMs = Date.now() - startTime;

      if ("status" in result && result.status === "UNABLE_TO_ASSESS") {
        return {
          decision: "ABSTAIN",
          mode: "LIVE",
          confidence: 0,
          detected_signals: [],
          latencyMs,
          cost: 0,
          isError: false,
        };
      }

      const res = result as any;

      // Convert V1 risk_level / scam_probability to our binary + abstain labels
      let decision: "SCAM" | "SAFE" | "ABSTAIN";
      if (res.scam_probability >= 0.45) {
        decision = "SCAM";
      } else if (res.scam_probability <= 0.25) {
        decision = "SAFE";
      } else {
        decision = "ABSTAIN";
      }

      // V1 uses 'suspicious_phrases' and 'reasons' for signals. 
      // We will map these into lower_snake_case for signal matching.
      const detected_signals = [
        ...(res.suspicious_phrases || []),
        ...(res.reasons || [])
      ].map((s: string) => s.toLowerCase().replace(/\s+/g, "_"));

      return {
        decision,
        mode: "LIVE",
        confidence: res.scam_probability,
        detected_signals,
        latencyMs,
        cost: 0, // V1 heuristics are mostly free, AI calls have minimal cost but we'll say 0 for baseline
        isError: false,
      };
    } catch (error: any) {
      return {
        decision: "ABSTAIN",
        mode: "DEGRADED",
        reason: "PROVIDER_UNAVAILABLE",
        confidence: 0,
        detected_signals: [],
        latencyMs: Date.now() - startTime,
        cost: 0,
        isError: true,
        errorMessage: error.message,
      };
    }
  }
}
