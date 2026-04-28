import mongoose, { Schema, Document } from "mongoose";

export interface IThreatLog extends Document {
  // Core indicators (IOCs)
  email_domain?: string;
  website_domain?: string;
  phone_number?: string;
  job_title?: string;
  
  // Pattern indicators
  suspicious_phrases: string[];
  salary_pattern?: "low_unrealistic" | "high_unrealistic" | "normal" | "suspicious";
  
  // Analysis metadata
  original_risk_score: number; // AI-generated score
  intelligence_boost: number; // Threat intelligence contribution
  final_risk_score: number; // Combined score
  risk_level: "Low" | "Medium" | "High";
  
  // Source information
  job_analysis_id?: mongoose.Types.ObjectId;
  job_text_hash: string;
  job_text_sample: string; // First 200 chars for context
  
  // Timestamps
  created_at: Date;
  
  // Frequency tracking (updated by aggregation jobs)
  domain_frequency?: number;
  phrase_frequency?: number;
  
  // Classification
  threat_category?: "phishing" | "fake_job" | "identity_theft" | "financial_scam" | "other";
  confidence_level?: "High" | "Medium" | "Low";
}

const ThreatLogSchema: Schema = new Schema({
  email_domain: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  website_domain: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  phone_number: {
    type: String,
    trim: true,
    index: true,
  },
  job_title: {
    type: String,
    trim: true,
    index: true,
  },
  suspicious_phrases: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  salary_pattern: {
    type: String,
    enum: ["low_unrealistic", "high_unrealistic", "normal", "suspicious"],
    default: "normal",
  },
  original_risk_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  intelligence_boost: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  final_risk_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  risk_level: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  job_analysis_id: {
    type: Schema.Types.ObjectId,
    ref: "JobAnalysis",
  },
  job_text_hash: {
    type: String,
    required: true,
    index: true,
  },
  job_text_sample: {
    type: String,
    required: true,
    maxlength: 200,
  },
  domain_frequency: {
    type: Number,
    min: 0,
  },
  phrase_frequency: {
    type: Number,
    min: 0,
  },
  threat_category: {
    type: String,
    enum: ["phishing", "fake_job", "identity_theft", "financial_scam", "other"],
  },
  confidence_level: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: false },
});

// Compound indexes for efficient pattern matching
ThreatLogSchema.index({ website_domain: 1, created_at: -1 });
ThreatLogSchema.index({ email_domain: 1, created_at: -1 });
ThreatLogSchema.index({ suspicious_phrases: 1, created_at: -1 });
ThreatLogSchema.index({ final_risk_score: -1, created_at: -1 });
ThreatLogSchema.index({ threat_category: 1, created_at: -1 });

// Text search index for job titles and phrases
ThreatLogSchema.index({ 
  job_title: "text", 
  suspicious_phrases: "text" 
});

export const ThreatLog = mongoose.model<IThreatLog>("ThreatLog", ThreatLogSchema);
