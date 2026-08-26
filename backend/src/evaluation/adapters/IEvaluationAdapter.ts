export interface EvaluationCase {
  id: string;
  text: string;
  label: "SCAM" | "SAFE";
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  expected_signals: string[];
  source_type: string;
  metadata?: any;
  dataset_version?: string;
}

export interface EvaluationResult {
  decision: "SCAM" | "SAFE" | "ABSTAIN";
  mode: "LIVE" | "MOCK" | "DEGRADED";
  reason?: string;
  confidence: number;
  detected_signals: string[];
  latencyMs: number;
  cost: number; // For compatibility
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  isError: boolean;
  errorMessage?: string;
  retrievalMetrics?: {
    signalRecall: number;
    evidenceCoverage: number;
  };
  agentMetrics?: {
    toolCalls: number;
    uniqueToolsUsed: number;
    maxStepsReached: boolean;
    stoppedEarly: boolean;
    executionSuccess: boolean;
    toolErrors: number;
    invalidToolCalls: number;
    unnecessaryToolCalls?: number;
  };
}

export interface IEvaluationAdapter {
  getSystemVersion(): string;
  evaluate(testCase: EvaluationCase): Promise<EvaluationResult>;
}
