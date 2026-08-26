import mongoose, { Schema, Document } from "mongoose";

export enum FeedbackType {
  FALSE_POSITIVE = "FALSE_POSITIVE",
  FALSE_NEGATIVE = "FALSE_NEGATIVE",
  INACCURATE_EVIDENCE = "INACCURATE_EVIDENCE",
  MISSING_THREAT = "MISSING_THREAT",
  OTHER = "OTHER"
}

export enum FeedbackStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
}

export interface IInvestigationFeedback extends Document {
  investigationId: string; // Refers to the JobAnalysis _id
  
  // Who submitted the feedback
  submittedBy: string | mongoose.Types.ObjectId; 
  submittedAt: Date;

  // The original prediction (Snapshotted to prevent historical rewrites)
  originalVerdict: string;
  originalRiskScore: number;
  
  // The feedback
  feedbackType: FeedbackType;
  feedbackReason: string; // e.g., "Recruiter asked me to pay registration"
  suggestedVerdict?: string;

  // Analyst Review
  status: FeedbackStatus;
  reviewedBy?: string | mongoose.Types.ObjectId;
  reviewedAt?: Date;
  analystNote?: string;

  // Linked items after approval
  knowledgeItemId?: mongoose.Types.ObjectId; 
}

const InvestigationFeedbackSchema = new Schema<IInvestigationFeedback>({
  investigationId: { type: String, required: true, index: true },
  
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  submittedAt: { type: Date, default: Date.now },

  originalVerdict: { type: String, required: true },
  originalRiskScore: { type: Number, required: true },

  feedbackType: { 
    type: String, 
    enum: Object.values(FeedbackType),
    required: true 
  },
  feedbackReason: { type: String, required: true },
  suggestedVerdict: { type: String },

  status: { 
    type: String, 
    enum: Object.values(FeedbackStatus),
    default: FeedbackStatus.PENDING,
    index: true
  },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date,
  analystNote: String,
  
  knowledgeItemId: { type: Schema.Types.ObjectId, ref: "KnowledgeItem" },
});

// Ensure a user can only submit one feedback per investigation
InvestigationFeedbackSchema.index({ investigationId: 1, submittedBy: 1 }, { unique: true });

export const InvestigationFeedback = mongoose.model<IInvestigationFeedback>("InvestigationFeedback", InvestigationFeedbackSchema);
