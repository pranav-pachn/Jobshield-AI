import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { IEvaluationAdapter, EvaluationCase, EvaluationResult } from "./adapters/IEvaluationAdapter";
import { EvaluationScorer } from "./EvaluationScorer";
import { RegressionDetector } from "./RegressionDetector";
import { EvaluationRun } from "../models/EvaluationRun";
import { logger } from "../utils/logger";

export class EvaluationRunner {
  private adapter: IEvaluationAdapter;
  private datasetPath: string;

  constructor(adapter: IEvaluationAdapter, datasetName: string = "v1_benchmark.json") {
    this.adapter = adapter;
    this.datasetPath = path.join(__dirname, "../../datasets", datasetName);
  }

  async run(options: { gitCommit?: string, promptVersion?: string, modelVersion?: string } = {}) {
    logger.info(`Starting evaluation run for system: ${this.adapter.getSystemVersion()}`);
    const startedAt = new Date();
    
    // Load dataset
    let dataset: EvaluationCase[] = [];
    try {
      const data = fs.readFileSync(this.datasetPath, "utf-8");
      dataset = JSON.parse(data) as EvaluationCase[];
    } catch (e) {
      logger.error(`Failed to load dataset from ${this.datasetPath}`, e);
      throw new Error(`Dataset load failed`);
    }
    
    const datasetVersion = dataset[0]?.dataset_version || "unknown";
    logger.info(`Loaded ${dataset.length} cases from dataset version ${datasetVersion}`);

    const results: EvaluationResult[] = [];
    const failureCases: Array<any> = [];

    // Run evaluations sequentially to avoid rate limits or skewing latency 
    // In a real system, you might chunk this or run in parallel with limits.
    for (let i = 0; i < dataset.length; i++) {
      const testCase = dataset[i];
      const startTime = Date.now();
      try {
        const result = await this.adapter.evaluate(testCase);
        results.push(result);

        // Check if it's a failure (wrong decision)
        if (result.decision !== testCase.label && result.decision !== "ABSTAIN") {
          failureCases.push({
            caseId: testCase.id,
            expected: testCase.label,
            actual: result.decision,
            reason: `System returned ${result.decision}, expected ${testCase.label}`
          });
        }
      } catch (err: any) {
        logger.error(`Error evaluating case ${testCase.id}:`, err);
        const fallbackResult: EvaluationResult = {
          decision: "ABSTAIN",
          mode: "DEGRADED",
          confidence: 0,
          detected_signals: [],
          latencyMs: Date.now() - startTime,
          cost: 0,
          isError: true,
          errorMessage: err.message
        };
        results.push(fallbackResult);
      }
    }

    const completedAt = new Date();
    
    // Score results
    const summaryMetrics = EvaluationScorer.score(dataset, results);
    
    // Get previous run for regression detection
    const previousRun = await EvaluationRun.findOne({ 
      systemVersion: this.adapter.getSystemVersion() 
    }).sort({ startedAt: -1 }).lean();

    const regressions = RegressionDetector.detect(summaryMetrics, previousRun as any);

    // Persist run
    const runId = `RUN-${uuidv4()}`;
    const evaluationRun = new EvaluationRun({
      runId,
      systemVersion: this.adapter.getSystemVersion(),
      datasetVersion,
      gitCommit: options.gitCommit,
      promptVersion: options.promptVersion,
      modelVersion: options.modelVersion,
      startedAt,
      completedAt,
      metrics: {
        precision: summaryMetrics.precision,
        recall: summaryMetrics.recall,
        f1: summaryMetrics.f1,
        falsePositiveRate: summaryMetrics.falsePositiveRate,
        falseNegativeRate: summaryMetrics.falseNegativeRate,
        coverage: summaryMetrics.coverage,
        abstentionRate: summaryMetrics.abstentionRate,
        selectiveAccuracy: summaryMetrics.selectiveAccuracy,
        avgLatencyMs: summaryMetrics.avgLatencyMs,
        p50LatencyMs: summaryMetrics.p50LatencyMs,
        p95LatencyMs: summaryMetrics.p95LatencyMs,
        averageCost: summaryMetrics.averageCost,
        totalCost: summaryMetrics.totalCost,
        costPerCorrectDecision: summaryMetrics.costPerCorrectDecision,
        totalTokens: summaryMetrics.totalTokens,
        avgTokens: summaryMetrics.avgTokens,
        fallbackRate: summaryMetrics.fallbackRate,
        errorRate: summaryMetrics.errorRate,
      },
      explainabilityMetrics: summaryMetrics.explainabilityMetrics,
      agentMetrics: summaryMetrics.agentMetrics,
      retrievalMetrics: null, // V1 doesn't have retrieval. RagAdapter will populate this in future.
      regressions,
      failureCases
    });

    await evaluationRun.save();
    logger.info(`Evaluation run ${runId} completed and saved. F1: ${summaryMetrics.f1.toFixed(3)}`);
    
    return evaluationRun;
  }
}
