import mongoose, { Schema, Document } from "mongoose";

export interface IScamEntity extends Document {
  jobAnalysisId?: string;
  jobReportId?: string;
  emails: string[];
  domains: string[];
  wallets: string[];
  phoneNumbers: string[];
  recruiterNames: string[];
  extractedAt: Date;
  metadata?: {
    sourceJobText?: string;
    extractionMethod?: "regex" | "ai" | "hybrid";
    confidence?: number;
  };
}

const ScamEntitySchema: Schema = new Schema({
  jobAnalysisId: {
    type: String,
    index: true,
    sparse: true,
  },
  jobReportId: {
    type: String,
    index: true,
    sparse: true,
  },
  emails: {
    type: [String],
    index: true,
    sparse: true,
    default: [],
  },
  domains: {
    type: [String],
    index: true,
    sparse: true,
    default: [],
  },
  wallets: {
    type: [String],
    index: true,
    sparse: true,
    default: [],
  },
  phoneNumbers: {
    type: [String],
    index: true,
    sparse: true,
    default: [],
  },
  recruiterNames: {
    type: [String],
    sparse: true,
    default: [],
  },
  extractedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    sourceJobText: String,
    extractionMethod: {
      type: String,
      enum: ["regex", "ai", "hybrid"],
      default: "regex",
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
  },
});

// Create compound indexes for faster correlations
ScamEntitySchema.index({ emails: 1, wallets: 1 });
ScamEntitySchema.index({ domains: 1, extractedAt: -1 });


export default mongoose.model<IScamEntity>("ScamEntity", ScamEntitySchema);
