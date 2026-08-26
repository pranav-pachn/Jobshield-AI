import mongoose, { Schema, Document } from "mongoose";

export interface ILLMInvocation {
  investigationId: string;
  requestId: string;
  task: string;
  provider: string;
  model: string;
  startedAt?: Date;
  completedAt?: Date;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  success: boolean;
  attempt: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
  errorType?: string;
  routingPolicy: string;
  agentStep?: number;
  toolCallsRequested?: number;
  toolCallsExecuted?: number;
  estimatedCostUsd?: number;
  pricingVersion?: string;
  createdAt?: Date;
}

const LLMInvocationSchema = new Schema<ILLMInvocation>({
  investigationId: { type: String, required: true },
  requestId: { type: String, required: true },
  task: { type: String },
  provider: { type: String, required: true },
  model: { type: String, required: true },
  startedAt: Date,
  completedAt: Date,
  latencyMs: { type: Number, required: true },
  inputTokens: Number,
  outputTokens: Number,
  totalTokens: Number,
  success: { type: Boolean, required: true },
  attempt: { type: Number },
  fallbackUsed: { type: Boolean, required: true, default: false },
  fallbackReason: String,
  errorType: String,
  routingPolicy: { type: String },
  estimatedCostUsd: { type: Number },
  pricingVersion: { type: String, required: true },
  agentStep: { type: Number },
  toolCallsRequested: { type: Number },
  toolCallsExecuted: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for Dashboard & Investigation lookups
LLMInvocationSchema.index({ investigationId: 1, createdAt: 1 });
LLMInvocationSchema.index({ provider: 1, createdAt: -1 });
LLMInvocationSchema.index({ task: 1 });
LLMInvocationSchema.index({ success: 1 });
LLMInvocationSchema.index({ fallbackUsed: 1 });

export const LLMInvocation = mongoose.model<ILLMInvocation>("LLMInvocation", LLMInvocationSchema);
