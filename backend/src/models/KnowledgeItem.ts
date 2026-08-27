import mongoose, { Schema, Document } from "mongoose";

export enum KnowledgeStatus {
  APPROVED = "APPROVED",
  INDEXED = "INDEXED",
  ACTIVE = "ACTIVE"
}

export enum TrustLevel {
  UNVERIFIED = "UNVERIFIED",
  SYSTEM_GENERATED = "SYSTEM_GENERATED",
  ANALYST_VERIFIED = "ANALYST_VERIFIED"
}

export interface IKnowledgeItem extends Document {
  title: string;
  content: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: string;
  sourceType: string;
  tags: string[];
  embedding?: number[];
  
  status: KnowledgeStatus;
  trustLevel: TrustLevel;
  
  provenance?: {
    sourceType: "ANALYST_FEEDBACK" | "SYSTEM" | "MANUAL";
    sourceInvestigationId?: string;
    sourceFeedbackId?: mongoose.Types.ObjectId;
    submittedBy?: mongoose.Types.ObjectId;
    validatedBy?: mongoose.Types.ObjectId;
    validatedAt?: Date;
    confidenceScore: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeItemSchema = new Schema<IKnowledgeItem>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    required: true
  },
  source: { type: String, required: true },
  sourceType: { type: String, required: true },
  tags: { type: [String], default: [] },
  embedding: { type: [Number], index: false },

  status: { 
    type: String, 
    enum: Object.values(KnowledgeStatus),
    default: KnowledgeStatus.ACTIVE
  },
  trustLevel: {
    type: String,
    enum: Object.values(TrustLevel),
    default: TrustLevel.SYSTEM_GENERATED
  },

  provenance: {
    sourceType: { type: String, enum: ["ANALYST_FEEDBACK", "SYSTEM", "MANUAL"] },
    sourceInvestigationId: { type: String },
    sourceFeedbackId: { type: Schema.Types.ObjectId, ref: "InvestigationFeedback" },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    validatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    validatedAt: { type: Date },
    confidenceScore: { type: Number, default: 0.9 }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

KnowledgeItemSchema.pre("save", function(this: any) {
  this.updatedAt = new Date();
});

export const KnowledgeItem = mongoose.model<IKnowledgeItem>("KnowledgeItem", KnowledgeItemSchema);
