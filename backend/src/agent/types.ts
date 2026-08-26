import { z } from "zod";

export const AgentMetricsSchema = z.object({
  toolCalls: z.number(),
  uniqueToolsUsed: z.number(),
  maxStepsReached: z.boolean(),
  stoppedEarly: z.boolean(),
  executionSuccess: z.boolean(),
  toolErrors: z.number(),
  invalidToolCalls: z.number(),
  unnecessaryToolCalls: z.number().optional(),
  totalTokens: z.number().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  estimatedCostUsd: z.number().optional()
});

export const InvestigationSignalSchema = z.object({
  type: z.string(),
  severity: z.enum(["HIGH", "MEDIUM", "LOW", "CRITICAL", "INFO"]),
  evidenceId: z.string().optional(),
  description: z.string()
});

export const EvidenceReferenceSchema = z.object({
  id: z.string(),
  sourceType: z.string(),
  summary: z.string(),
  similarity: z.number().optional()
});

export const ContradictionSchema = z.object({
  description: z.string(),
  conflictingSources: z.array(z.string())
});

export const InvestigationStepSchema = z.object({
  step: z.number(),
  tool: z.string(),
  status: z.enum(["success", "error", "skipped"]),
  details: z.string().optional()
});

export const InvestigationResultSchema = z.object({
  verdict: z.enum(["SCAM", "SAFE", "ABSTAIN", "CONFLICT"]),
  mode: z.enum(["LIVE", "MOCK", "DEGRADED"]),
  reason: z.string().optional(),
  confidence: z.number().min(0).max(1),
  signals: z.array(InvestigationSignalSchema),
  evidence: z.array(EvidenceReferenceSchema),
  contradictions: z.array(ContradictionSchema),
  trace: z.array(InvestigationStepSchema),
  agentMetrics: AgentMetricsSchema
});

export type AgentMetrics = z.infer<typeof AgentMetricsSchema>;
export type InvestigationSignal = z.infer<typeof InvestigationSignalSchema>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export type Contradiction = z.infer<typeof ContradictionSchema>;
export type InvestigationStep = z.infer<typeof InvestigationStepSchema>;
export type InvestigationResult = z.infer<typeof InvestigationResultSchema>;

export interface InvestigationInput {
  jobDescription: string;
  recruiterEmail?: string;
  companyUrl?: string;
}

export interface InvestigationAgent {
  investigate(input: InvestigationInput): Promise<InvestigationResult>;
}
