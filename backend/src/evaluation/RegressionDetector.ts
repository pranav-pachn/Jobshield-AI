import { EvaluationSummaryMetrics } from "./EvaluationScorer";
import { IEvaluationRun } from "../models/EvaluationRun";

export type RegressionSeverity = "WARNING" | "FAILURE";

export interface RegressionRule {
  metric: keyof EvaluationSummaryMetrics;
  type: "MIN" | "MAX"; 
  // MIN: drop is bad (e.g. F1)
  // MAX: increase is bad (e.g. FPR)
  thresholdWarningDelta: number;
  thresholdFailureDelta: number;
}

const REGRESSION_RULES: RegressionRule[] = [
  { metric: "f1", type: "MIN", thresholdWarningDelta: 0.02, thresholdFailureDelta: 0.05 },
  { metric: "precision", type: "MIN", thresholdWarningDelta: 0.03, thresholdFailureDelta: 0.06 },
  { metric: "falsePositiveRate", type: "MAX", thresholdWarningDelta: 0.03, thresholdFailureDelta: 0.05 },
  { metric: "p95LatencyMs", type: "MAX", thresholdWarningDelta: 500, thresholdFailureDelta: 1500 }, // +500ms warning, +1500ms failure
];

export class RegressionDetector {
  static detect(
    currentMetrics: EvaluationSummaryMetrics, 
    previousRun: IEvaluationRun | null
  ): Array<{
    metric: string;
    previousValue: number;
    currentValue: number;
    threshold: number;
    severity: RegressionSeverity;
  }> {
    const regressions: Array<any> = [];

    if (!previousRun) {
      return regressions; // No baseline to compare against
    }

    const prevMetrics = previousRun.metrics;

    for (const rule of REGRESSION_RULES) {
      const currVal = currentMetrics[rule.metric] as number;
      const prevVal = prevMetrics[rule.metric as keyof typeof prevMetrics] as number;
      
      if (currVal === undefined || prevVal === undefined) continue;

      let delta = currVal - prevVal;
      
      if (rule.type === "MIN") {
        // We want the value to be high. Drop is bad.
        // delta is negative if it dropped. We check absolute drop.
        const drop = prevVal - currVal;
        if (drop >= rule.thresholdFailureDelta) {
          regressions.push({
            metric: rule.metric,
            previousValue: prevVal,
            currentValue: currVal,
            threshold: rule.thresholdFailureDelta,
            severity: "FAILURE"
          });
        } else if (drop >= rule.thresholdWarningDelta) {
          regressions.push({
            metric: rule.metric,
            previousValue: prevVal,
            currentValue: currVal,
            threshold: rule.thresholdWarningDelta,
            severity: "WARNING"
          });
        }
      } else {
        // We want the value to be low. Increase is bad.
        const increase = currVal - prevVal;
        if (increase >= rule.thresholdFailureDelta) {
          regressions.push({
            metric: rule.metric,
            previousValue: prevVal,
            currentValue: currVal,
            threshold: rule.thresholdFailureDelta,
            severity: "FAILURE"
          });
        } else if (increase >= rule.thresholdWarningDelta) {
          regressions.push({
            metric: rule.metric,
            previousValue: prevVal,
            currentValue: currVal,
            threshold: rule.thresholdWarningDelta,
            severity: "WARNING"
          });
        }
      }
    }

    return regressions;
  }
}
