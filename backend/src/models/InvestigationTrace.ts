import mongoose, { Schema, Document } from "mongoose";

export interface ITraceStep {
  step: number;
  tool: string;
  status: "success" | "error" | "skipped";
  latencyMs?: number;
}

export interface ITraceEvidence {
  signal: string;
  description: string;
  source: {
    type: string;
    id: string;
    title: string;
  };
  similarity?: number;
  retrievedAt: Date;
}

export interface ITraceContradiction {
  description: string;
  conflictingSources: string[];
}

export interface ITraceRiskLedger {
  signal: string;
  contribution: number;
}

export interface IInvestigationTrace extends Document {
  analysisId: string;
  agentVersion: string;
  
  startedAt: Date;
  completedAt: Date;
  latencyMs: number;
  
  status: "COMPLETED" | "FAILED" | "TIMEOUT";
  
  toolCalls: number;
  
  confidence: number;
  evidenceQuality: number;
  
  steps: ITraceStep[];
  evidence: ITraceEvidence[];
  contradictions: ITraceContradiction[];
  riskBreakdown: ITraceRiskLedger[];
}

const TraceStepSchema = new Schema<ITraceStep>({
  step: { type: Number, required: true },
  tool: { type: String, required: true },
  status: { type: String, enum: ["success", "error", "skipped"], required: true },
  latencyMs: { type: Number }
}, { _id: false });

const TraceEvidenceSchema = new Schema<ITraceEvidence>({
  signal: { type: String, required: true },
  description: { type: String, required: true },
  source: {
    type: { type: String, required: true },
    id: { type: String, required: true },
    title: { type: String, required: true }
  },
  similarity: { type: Number },
  retrievedAt: { type: Date, required: true }
}, { _id: false });

const TraceContradictionSchema = new Schema<ITraceContradiction>({
  description: { type: String, required: true },
  conflictingSources: [{ type: String }]
}, { _id: false });

const TraceRiskLedgerSchema = new Schema<ITraceRiskLedger>({
  signal: { type: String, required: true },
  contribution: { type: Number, required: true }
}, { _id: false });

const InvestigationTraceSchema = new Schema<IInvestigationTrace>({
  analysisId: { type: String, required: true, index: true },
  agentVersion: { type: String, required: true },
  
  startedAt: { type: Date, required: true },
  completedAt: { type: Date, required: true },
  latencyMs: { type: Number, required: true },
  
  status: { type: String, enum: ["COMPLETED", "FAILED", "TIMEOUT"], required: true },
  toolCalls: { type: Number, required: true },
  
  confidence: { type: Number, required: true },
  evidenceQuality: { type: Number, required: true },
  
  steps: [TraceStepSchema],
  evidence: [TraceEvidenceSchema],
  contradictions: [TraceContradictionSchema],
  riskBreakdown: [TraceRiskLedgerSchema]
}, { timestamps: true });

export const InvestigationTrace = mongoose.model<IInvestigationTrace>("InvestigationTrace", InvestigationTraceSchema);
