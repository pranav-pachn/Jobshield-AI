import mongoose, { Schema, Document } from "mongoose";

export interface IThreatCampaign extends Document {
  campaignId: string;
  name: string;
  status: "ACTIVE" | "DORMANT" | "CONFIRMED" | "DISMISSED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  linkedInvestigationIds: mongoose.Types.ObjectId[];
  linkedRecruiterProfileIds: mongoose.Types.ObjectId[];
  sharedSignals: string[];
  sharedDomains: string[];
  sharedEmails: string[];
  sharedPhones: string[];
  firstObserved: Date;
  lastObserved: Date;
  metadata?: {
    correlationDetails?: any;
    detectionMethod?: "automatic" | "manual";
  };
  createdAt: Date;
  updatedAt: Date;
}

const ThreatCampaignSchema: Schema = new Schema(
  {
    campaignId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "DORMANT", "CONFIRMED", "DISMISSED"],
      default: "ACTIVE",
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    linkedInvestigationIds: [{ type: Schema.Types.ObjectId, ref: "Investigation", index: true }],
    linkedRecruiterProfileIds: [{ type: Schema.Types.ObjectId, ref: "RecruiterProfile", index: true }],
    sharedSignals: [{ type: String }],
    sharedDomains: [{ type: String }],
    sharedEmails: [{ type: String }],
    sharedPhones: [{ type: String }],
    firstObserved: { type: Date, required: true },
    lastObserved: { type: Date, required: true },
    metadata: {
      correlationDetails: Schema.Types.Mixed,
      detectionMethod: {
        type: String,
        enum: ["automatic", "manual"],
        default: "automatic",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create individual indexes for efficient finding by shared entities
ThreatCampaignSchema.index({ sharedDomains: 1 });
ThreatCampaignSchema.index({ sharedEmails: 1 });
ThreatCampaignSchema.index({ sharedPhones: 1 });

export const ThreatCampaign = mongoose.model<IThreatCampaign>("ThreatCampaign", ThreatCampaignSchema);
