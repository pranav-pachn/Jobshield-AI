import { EvaluationScorer } from "../src/evaluation/EvaluationScorer";
import { EvaluationCase, EvaluationResult } from "../src/evaluation/adapters/IEvaluationAdapter";

describe("EvaluationScorer", () => {
  it("calculates F1 correctly for a tiny known dataset", () => {
    // Truth: S S S F F F
    const cases: EvaluationCase[] = [
      { id: "1", text: "...", label: "SCAM", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
      { id: "2", text: "...", label: "SCAM", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
      { id: "3", text: "...", label: "SCAM", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
      { id: "4", text: "...", label: "SAFE", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
      { id: "5", text: "...", label: "SAFE", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
      { id: "6", text: "...", label: "SAFE", category: "c1", difficulty: "EASY", expected_signals: [], source_type: "synth" },
    ];

    // Prediction: S S F F F F
    // Means:
    // 1: SCAM (TP)
    // 2: SCAM (TP)
    // 3: SAFE (FN)
    // 4: SAFE (TN)
    // 5: SAFE (TN)
    // 6: SAFE (TN)
    //
    // TP = 2
    // FN = 1
    // FP = 0
    // TN = 3
    // Precision = 2 / (2 + 0) = 1.0
    // Recall = 2 / (2 + 1) = 0.666...
    // F1 = 2 * (1.0 * 0.666...) / (1.0 + 0.666...) = 0.8
    const results: EvaluationResult[] = [
      { decision: "SCAM", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
      { decision: "SCAM", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
      { decision: "SAFE", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
      { decision: "SAFE", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
      { decision: "SAFE", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
      { decision: "SAFE", confidence: 1, detected_signals: [], latencyMs: 10, cost: 0, isError: false },
    ];

    const metrics = EvaluationScorer.score(cases, results);
    
    expect(metrics.precision).toBe(1.0);
    expect(metrics.recall).toBeCloseTo(0.6667, 3);
    expect(metrics.f1).toBeCloseTo(0.8, 1);
  });
});
