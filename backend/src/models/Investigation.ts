import mongoose, { Schema, Document } from "mongoose";

export interface IInvestigation extends Document {
  investigationId: string;
  state: string;
  input: {
    jobText: string;
    recruiterName?: string;
    email?: string;
    emailDomain?: string;
    company?: string;
    companyDomain?: string;
    linkedinUrl?: string;
    phone?: string;
    jobUrl?: string;
  };
  agentTraces: Array<{
    agentName: string;
    startedAt: Date;
    completedAt: Date;
    latencyMs: number;
    provider?: string;
    model?: string;
    status: string;
    output?: any;
  }>;
  contentFindings?: any;
  recruiterFindings?: any;
  threatFindings?: any;
  evidenceAggregation?: any;
  finalDecision?: any;
  createdAt: Date;
  completedAt?: Date;
  totalLatencyMs?: number;
}

const InvestigationSchema: Schema = new Schema({
  investigationId: { type: String, required: true, index: true },
  state: { type: String, required: true },
  input: {
    jobText: { type: String, required: true },
    recruiterName: String,
    email: String,
    emailDomain: String,
    company: String,
    companyDomain: String,
    linkedinUrl: String,
    phone: String,
    jobUrl: String,
  },
  agentTraces: [{
    agentName: String,
    startedAt: Date,
    completedAt: Date,
    latencyMs: Number,
    provider: String,
    model: String,
    status: String,
    output: Schema.Types.Mixed,
  }],
  contentFindings: Schema.Types.Mixed,
  recruiterFindings: Schema.Types.Mixed,
  threatFindings: Schema.Types.Mixed,
  evidenceAggregation: Schema.Types.Mixed,
  finalDecision: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  totalLatencyMs: Number,
}, {
  timestamps: false,
});

InvestigationSchema.index({ createdAt: -1 });

export const Investigation = mongoose.model<IInvestigation>("Investigation", InvestigationSchema);
