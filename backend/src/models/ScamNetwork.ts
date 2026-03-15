import mongoose, { Schema, Document } from "mongoose";

export type CorrelationType = 
  | "shared_email_domain" 
  | "shared_wallet" 
  | "shared_phone" 
  | "textual_similarity" 
  | "shared_email_exact";

export interface IScamNetwork extends Document {
  networkId: string;
  entitiesInvolved: {
    type: string; // "email" | "domain" | "wallet" | "phone"
    value: string;
    confidence: number;
  }[];
  correlationType: CorrelationType;
  confidence: number; // 0-100
  linkedJobAnalysisIds: string[];
  linkedJobReportIds?: string[];
  totalReportsLinked: number;
  createdAt: Date;
  lastUpdated: Date;
  metadata?: {
    correlationDetails?: string;
    highestRiskLevel?: "high" | "medium" | "low";
    averageRiskScore?: number;
  };
}

const ScamNetworkSchema: Schema = new Schema({
  networkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  entitiesInvolved: [
    {
      type: {
        type: String,
        enum: ["email", "domain", "wallet", "phone"],
        required: true,
      },
      value: {
        type: String,
        required: true,
        index: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
    },
  ],
  correlationType: {
    type: String,
    enum: ["shared_email_domain", "shared_wallet", "shared_phone", "textual_similarity", "shared_email_exact"],
    required: true,
    index: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  linkedJobAnalysisIds: {
    type: [String],
    index: true,
    default: [],
  },
  linkedJobReportIds: {
    type: [String],
    sparse: true,
    default: [],
  },
  totalReportsLinked: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: -1,
  },
  metadata: {
    correlationDetails: String,
    highestRiskLevel: {
      type: String,
      enum: ["high", "medium", "low"],
      sparse: true,
    },
    averageRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      sparse: true,
    },
  },
});

// Create indexes for correlation queries

ScamNetworkSchema.index({ correlationType: 1, confidence: -1 });

export default mongoose.model<IScamNetwork>("ScamNetwork", ScamNetworkSchema);
