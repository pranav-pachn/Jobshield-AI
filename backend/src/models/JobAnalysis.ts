import mongoose, { Schema, Document } from "mongoose";

export interface IJobAnalysis extends Document {
  job_text: string;
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  suspicious_phrases: string[];
  reasons: string[];
  created_at: Date;
  ai_latency_ms?: number;
  // Explainable AI fields
  evidence_sources?: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number; // 0-100
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  similar_patterns?: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  community_report_count?: number;
  confidence_level?: "High" | "Medium" | "Low";
  confidence_reason?: string;
  source_links?: Array<{
    title: string;
    url: string;
    category: string;
  }>;
  component_scores?: {
    rule_score: number;
    zero_shot_score: number;
    similarity_score: number;
  };
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
  // Explainable AI fields
  evidence_sources: [{
    source: String,
    description: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
  domain_intelligence: {
    domain: String,
    domain_age_days: Number,
    trust_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    threat_level: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    recently_registered: Boolean,
  },
  similar_patterns: [{
    pattern: String,
    frequency: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
  community_report_count: {
    type: Number,
    default: 0,
  },
  confidence_level: {
    type: String,
    enum: ["High", "Medium", "Low"],
  },
  confidence_reason: String,
  source_links: [{
    title: String,
    url: String,
    category: String,
  }],
  component_scores: {
    rule_score: {
      type: Number,
      min: 0,
      max: 1,
    },
    zero_shot_score: {
      type: Number,
      min: 0,
      max: 1,
    },
    similarity_score: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: false },
});

// Indexes for performance
JobAnalysisSchema.index({ created_at: -1 });
JobAnalysisSchema.index({ risk_level: 1 });

export const JobAnalysis = mongoose.model<IJobAnalysis>("JobAnalysis", JobAnalysisSchema);
