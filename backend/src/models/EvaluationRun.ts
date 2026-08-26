import mongoose, { Schema, Document } from "mongoose";

export interface IEvaluationRun {
  runId: string;
  systemVersion: string;
  datasetVersion: string;

  gitCommit?: string;
  promptVersion?: string;
  modelVersion?: string;
  agentVersion?: string;
  toolSchemaVersion?: string;
  provider?: string;

  startedAt: Date;
  completedAt: Date;

  metrics: {
    precision: number;
    recall: number;
    f1: number;
    falsePositiveRate: number;
    falseNegativeRate: number;

    coverage: number;
    abstentionRate: number;
    selectiveAccuracy?: number;

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
  };

  retrievalMetrics?: {
    recallAt5: number;
    recallAt10: number;
    mrr: number;
    retrievedDocuments: number;
    relevantDocuments: number;
  } | null;

  agentMetrics?: {
    avgToolCalls: number;
    avgUniqueToolsUsed: number;
    maxStepsReachedRate: number;
    stoppedEarlyRate: number;
    executionSuccessRate: number;
    avgToolErrors: number;
    avgInvalidToolCalls: number;
  } | null;

  explainabilityMetrics?: {
    signalRecall: number;
    evidenceCoverage: number;
    unsupportedClaimRate: number;
  } | null;

  regressions?: Array<{
    metric: string;
    previousValue: number;
    currentValue: number;
    threshold: number;
    severity: "WARNING" | "FAILURE";
  }>;

  failureCases?: Array<{
    caseId: string;
    expected: string;
    actual: string;
    reason: string;
  }>;
}

const EvaluationRunSchema = new Schema<IEvaluationRun>({
  runId: { type: String, required: true, unique: true },
  systemVersion: { type: String, required: true },
  datasetVersion: { type: String, required: true },

  gitCommit: { type: String },
  promptVersion: { type: String },
  modelVersion: { type: String },
  agentVersion: { type: String },
  toolSchemaVersion: { type: String },
  provider: { type: String },

  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },

  metrics: {
    precision: { type: Number, required: true },
    recall: { type: Number, required: true },
    f1: { type: Number, required: true },
    falsePositiveRate: { type: Number, required: true },
    falseNegativeRate: { type: Number, required: true },

    coverage: { type: Number, required: true },
    abstentionRate: { type: Number, required: true },
    selectiveAccuracy: { type: Number },

    avgLatencyMs: { type: Number, required: true },
    p50LatencyMs: { type: Number, required: true },
    p95LatencyMs: { type: Number, required: true },

    averageCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    costPerCorrectDecision: { type: Number, required: true },
    totalTokens: { type: Number, required: true },
    avgTokens: { type: Number, required: true },

    fallbackRate: { type: Number, required: true },
    errorRate: { type: Number, required: true },
  },
  agentMetrics: {
    type: {
      avgToolCalls: Number,
      avgUniqueToolsUsed: Number,
      maxStepsReachedRate: Number,
      stoppedEarlyRate: Number,
      executionSuccessRate: Number,
      avgToolErrors: Number,
      avgInvalidToolCalls: Number
    },
    default: null
  },

  retrievalMetrics: {
    type: {
      recallAt5: Number,
      recallAt10: Number,
      mrr: Number,
      retrievedDocuments: Number,
      relevantDocuments: Number,
    },
    default: null
  },

  explainabilityMetrics: {
    type: {
      signalRecall: Number,
      evidenceCoverage: Number,
      unsupportedClaimRate: Number,
    },
    default: null
  },

  regressions: [{
    metric: String,
    previousValue: Number,
    currentValue: Number,
    threshold: Number,
    severity: String
  }],

  failureCases: [{
    caseId: String,
    expected: String,
    actual: String,
    reason: String
  }]
}, { timestamps: true });

export const EvaluationRun = mongoose.model<IEvaluationRun>("EvaluationRun", EvaluationRunSchema);
