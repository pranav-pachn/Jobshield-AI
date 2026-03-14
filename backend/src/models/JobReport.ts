import { Schema, model, models } from "mongoose";

export type JobReport = {
  text: string;
  scamProbability: number;
  createdAt: Date;
};

const JobReportSchema = new Schema<JobReport>({
  text: String,
  scamProbability: Number,
  createdAt: Date,
});

export const JobReportModel =
  models.JobReport || model<JobReport>("JobReport", JobReportSchema);
