import mongoose, { Schema, Document } from "mongoose";

export interface IRecruiterProfile extends Document {
  emails: string[];
  domains: string[];
  phones: string[];
  names: string[];
  companies: string[];
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  totalInvestigations: number;
  suspiciousCount: number;
  confirmedScamCount: number;
  legitimateCount: number;
  signals: Array<{ signal: string; count: number; firstSeen: Date }>;
  linkedInvestigationIds: mongoose.Types.ObjectId[];
  linkedCampaignIds: mongoose.Types.ObjectId[];
  firstSeen: Date;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecruiterProfileSchema: Schema = new Schema(
  {
    emails: { type: [String], index: true, default: [] },
    domains: { type: [String], index: true, default: [] },
    phones: { type: [String], index: true, default: [] },
    names: { type: [String], default: [] },
    companies: { type: [String], default: [] },
    riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
      index: true,
    },
    totalInvestigations: { type: Number, default: 0 },
    suspiciousCount: { type: Number, default: 0 },
    confirmedScamCount: { type: Number, default: 0 },
    legitimateCount: { type: Number, default: 0 },
    signals: [
      {
        signal: { type: String, required: true },
        count: { type: Number, default: 1 },
        firstSeen: { type: Date, default: Date.now },
      },
    ],
    linkedInvestigationIds: [{ type: Schema.Types.ObjectId, ref: "Investigation" }],
    linkedCampaignIds: [{ type: Schema.Types.ObjectId, ref: "ThreatCampaign" }],
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const RecruiterProfile = mongoose.model<IRecruiterProfile>("RecruiterProfile", RecruiterProfileSchema);
