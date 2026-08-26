import mongoose, { Schema, Document } from "mongoose";

export enum ThreatType {
  DOMAIN = "DOMAIN",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  TELEGRAM = "TELEGRAM",
  WHATSAPP = "WHATSAPP",
  SCAM_PHRASE = "SCAM_PHRASE",
  COMPANY = "COMPANY",
}

export enum ThreatRiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum ThreatSource {
  INVESTIGATION = "INVESTIGATION",
  MANUAL = "MANUAL",
  FEED = "FEED",
}

export interface IThreatIndicator extends Document {
  type: ThreatType;
  value: string;
  normalizedValue: string;
  riskLevel: ThreatRiskLevel;
  firstSeen: Date;
  lastSeen: Date;
  occurrenceCount: number;
  source: ThreatSource;
  confidence: number;
  linkedInvestigations: mongoose.Types.ObjectId[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ThreatIndicatorSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(ThreatType),
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    normalizedValue: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: Object.values(ThreatRiskLevel),
      default: ThreatRiskLevel.MEDIUM,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    occurrenceCount: {
      type: Number,
      default: 1,
    },
    source: {
      type: String,
      enum: Object.values(ThreatSource),
      default: ThreatSource.INVESTIGATION,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    linkedInvestigations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Investigation",
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index for the indicator itself
ThreatIndicatorSchema.index({ type: 1, normalizedValue: 1 }, { unique: true });

// Query optimization indexes
ThreatIndicatorSchema.index({ riskLevel: 1 });
ThreatIndicatorSchema.index({ linkedInvestigations: 1 });

export const ThreatIndicator = mongoose.model<IThreatIndicator>(
  "ThreatIndicator",
  ThreatIndicatorSchema
);
