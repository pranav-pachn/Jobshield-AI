import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJobReport extends Document {
  user_id: Types.ObjectId;
  job_analysis_id: Types.ObjectId;
  report_title?: string;
  report_data: any; // Full analysis object
  export_format: "pdf" | "html" | "json";
  email_sent?: boolean;
  email_recipients?: string[];
  share_token?: string; // Unique token for shareable links
  share_token_expires?: Date; // 30-day expiry
  is_public?: boolean; // If accessible via share_token
  created_at: Date;
  expires_at?: Date; // 30-day retention
  file_path?: string; // Path to stored file if applicable
}

const JobReportSchema: Schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job_analysis_id: {
    type: Schema.Types.ObjectId,
    ref: "JobAnalysis",
    required: true,
  },
  report_title: {
    type: String,
    trim: true,
  },
  report_data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  export_format: {
    type: String,
    required: true,
    enum: ["pdf", "html", "json"],
  },
  email_sent: {
    type: Boolean,
    default: false,
  },
  email_recipients: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  share_token: {
    type: String,
    unique: true,
    sparse: true,
  },
  share_token_expires: {
    type: Date,
  },
  is_public: {
    type: Boolean,
    default: false,
  },
  file_path: {
    type: String,
    sparse: true,
  },
  expires_at: {
    type: Date,
    index: { expireAfterSeconds: 0 }, // TTL index for auto-deletion
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: false },
});

// Indexes for performance
JobReportSchema.index({ user_id: 1, created_at: -1 });
JobReportSchema.index({ job_analysis_id: 1 });

export const JobReport = mongoose.model<IJobReport>("JobReport", JobReportSchema);
