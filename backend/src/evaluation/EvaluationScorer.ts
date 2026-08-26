import { EvaluationCase, EvaluationResult } from "./adapters/IEvaluationAdapter";

export interface EvaluationSummaryMetrics {
  precision: number;
  recall: number;
  f1: number;
  falsePositiveRate: number;
  falseNegativeRate: number;

  coverage: number;
  abstentionRate: number;
  selectiveAccuracy: number;

  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;

  averageCost: number;
  totalCost: number;
  costPerCorrectDecision: number;
  totalTokens: number;
  avgTokens: number;

  fallbackRate: number;
  errorRate: number;

  explainabilityMetrics: {
    signalRecall: number;
    evidenceCoverage: number;
    unsupportedClaimRate: number;
  };

  agentMetrics?: {
    avgToolCalls: number;
    avgUniqueToolsUsed: number;
    maxStepsReachedRate: number;
    stoppedEarlyRate: number;
    executionSuccessRate: number;
    avgToolErrors: number;
    avgInvalidToolCalls: number;
  };
}

export class EvaluationScorer {
  static score(cases: EvaluationCase[], results: EvaluationResult[]): EvaluationSummaryMetrics {
    let tp = 0; // True Positive (Correct SCAM)
    let fp = 0; // False Positive (SAFE marked as SCAM)
    let tn = 0; // True Negative (Correct SAFE)
    let fn = 0; // False Negative (SCAM marked as SAFE)
    let abstentions = 0;
    let errors = 0;
    
    let totalLatency = 0;
    let latencies: number[] = [];
    let totalCost = 0;
    let totalTokens = 0;

    let signalMatches = 0;
    let signalExpected = 0;
    let totalDetectedSignals = 0;

    let totalToolCalls = 0;
    let totalUniqueTools = 0;
    let maxStepsCount = 0;
    let stoppedEarlyCount = 0;
    let successCount = 0;
    let totalToolErrors = 0;
    let totalInvalidToolCalls = 0;
    let agentCases = 0;

    for (let i = 0; i < cases.length; i++) {
      const gt = cases[i];
      const res = results[i];

      totalLatency += res.latencyMs;
      latencies.push(res.latencyMs);
      totalCost += res.cost;
      totalTokens += res.totalTokens || 0;

      if (res.agentMetrics) {
        agentCases++;
        totalToolCalls += res.agentMetrics.toolCalls;
        totalUniqueTools += res.agentMetrics.uniqueToolsUsed;
        if (res.agentMetrics.maxStepsReached) maxStepsCount++;
        if (res.agentMetrics.stoppedEarly) stoppedEarlyCount++;
        if (res.agentMetrics.executionSuccess) successCount++;
        totalToolErrors += res.agentMetrics.toolErrors;
        totalInvalidToolCalls += res.agentMetrics.invalidToolCalls;
      }

      if (res.isError) {
        errors++;
      }

      if (res.mode === "DEGRADED" && res.reason === "PROVIDER_UNAVAILABLE") {
        errors++; // Record as error explicitly instead of abstain
      } else if (res.decision === "ABSTAIN") {
        abstentions++;
      } else if (res.decision === "SCAM" && gt.label === "SCAM") {
        tp++;
      } else if (res.decision === "SCAM" && gt.label === "SAFE") {
        fp++;
      } else if (res.decision === "SAFE" && gt.label === "SAFE") {
        tn++;
      } else if (res.decision === "SAFE" && gt.label === "SCAM") {
        fn++;
      }

      // Explainability: Signal recall & evidence coverage
      // We expect the system to detect expected_signals.
      if (gt.expected_signals && gt.expected_signals.length > 0) {
        signalExpected += gt.expected_signals.length;
        for (const sig of gt.expected_signals) {
          // simple substring match for signals in V1
          const matched = res.detected_signals.some(ds => ds.includes(sig) || sig.includes(ds));
          if (matched) signalMatches++;
        }
      }
      totalDetectedSignals += res.detected_signals.length;
    }

    const total = cases.length;
    // We already counted Provider failures in `errors` block below. Let's just recount them correctly.
    const providerFailures = results.filter(r => r.mode === "DEGRADED" && r.reason === "PROVIDER_UNAVAILABLE").length;
    const completed = total - providerFailures;

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * ((precision * recall) / (precision + recall)) : 0;

    const actualNegatives = tn + fp;
    const falsePositiveRate = actualNegatives > 0 ? fp / actualNegatives : 0;
    const actualPositives = tp + fn;
    const falseNegativeRate = actualPositives > 0 ? fn / actualPositives : 0;

    const coverage = total > 0 ? completed / total : 0;
    const abstentionRate = completed > 0 ? abstentions / completed : 0;
    
    const decisionsMade = tp + fp + tn + fn;
    const selectiveAccuracy = decisionsMade > 0 ? (tp + tn) / decisionsMade : 0;

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;

    const signalRecall = signalExpected > 0 ? signalMatches / signalExpected : 0;
    // evidenceCoverage: % of detected signals that were actually relevant/expected
    // (For V1 this is rough, but a good proxy)
    const evidenceCoverage = totalDetectedSignals > 0 ? signalMatches / totalDetectedSignals : 0;

    return {
      precision,
      recall,
      f1,
      falsePositiveRate,
      falseNegativeRate,
      coverage,
      abstentionRate,
      selectiveAccuracy,
      avgLatencyMs: total > 0 ? totalLatency / total : 0,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      averageCost: total > 0 ? totalCost / total : 0,
      totalCost,
      costPerCorrectDecision: (tp + tn) > 0 ? totalCost / (tp + tn) : 0,
      totalTokens,
      avgTokens: total > 0 ? totalTokens / total : 0,
      fallbackRate: 0, // Implement later when fallback metadata is returned
      errorRate: total > 0 ? errors / total : 0,
      explainabilityMetrics: {
        signalRecall,
        evidenceCoverage,
        unsupportedClaimRate: 1 - evidenceCoverage, // rough proxy
      },
      agentMetrics: agentCases > 0 ? {
        avgToolCalls: totalToolCalls / agentCases,
        avgUniqueToolsUsed: totalUniqueTools / agentCases,
        maxStepsReachedRate: maxStepsCount / agentCases,
        stoppedEarlyRate: stoppedEarlyCount / agentCases,
        executionSuccessRate: successCount / agentCases,
        avgToolErrors: totalToolErrors / agentCases,
        avgInvalidToolCalls: totalInvalidToolCalls / agentCases
      } : undefined
    };
  }
}
