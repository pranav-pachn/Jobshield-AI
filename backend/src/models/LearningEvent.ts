import mongoose, { Schema, Document } from "mongoose";

export interface ILearningEvent extends Document {
  feedbackId: mongoose.Types.ObjectId;
  investigationId: string;
  knowledgeItemId?: mongoose.Types.ObjectId;
  campaignId?: string;
  action: "FEEDBACK_SUBMITTED" | "FEEDBACK_REJECTED" | "KNOWLEDGE_CREATED" | "CAMPAIGN_CONFIRMED";
  performedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LearningEventSchema = new Schema<ILearningEvent>({
  feedbackId: { type: Schema.Types.ObjectId, ref: "InvestigationFeedback", required: true },
  investigationId: { type: String, required: true },
  knowledgeItemId: { type: Schema.Types.ObjectId, ref: "KnowledgeItem" },
  campaignId: { type: String },
  action: { 
    type: String, 
    enum: ["FEEDBACK_SUBMITTED", "FEEDBACK_REJECTED", "KNOWLEDGE_CREATED", "CAMPAIGN_CONFIRMED"], 
    required: true 
  },
  performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

export const LearningEvent = mongoose.model<ILearningEvent>("LearningEvent", LearningEventSchema);
