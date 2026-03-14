import mongoose, { Schema, Document } from "mongoose";

export interface IJobAnalysis extends Document {
  job_text: string;
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  suspicious_phrases: string[];
  reasons: string[];
  created_at: Date;
  ai_latency_ms?: number;
}

const JobAnalysisSchema: Schema = new Schema({
  job_text: {
    type: String,
    required: true,
    trim: true,
  },
  scam_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  risk_level: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  suspicious_phrases: [{
    type: String,
    trim: true,
  }],
  reasons: [{
    type: String,
    trim: true,
  }],
  ai_latency_ms: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: false },
});

// Indexes for performance
JobAnalysisSchema.index({ created_at: -1 });
JobAnalysisSchema.index({ risk_level: 1 });

export const JobAnalysis = mongoose.model<IJobAnalysis>("JobAnalysis", JobAnalysisSchema);
