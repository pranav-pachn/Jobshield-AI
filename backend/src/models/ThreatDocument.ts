import mongoose, { Schema, Document } from "mongoose";

export interface IThreatDocument extends Document {
  documentId: string;
  title: string;
  organization: string;
  url: string;
  sourceType: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThreatDocumentSchema: Schema = new Schema({
  documentId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  organization: { type: String, required: true },
  url: { type: String, required: true },
  sourceType: { type: String, required: true },
  country: { type: String },
}, { timestamps: true });

export const ThreatDocument = mongoose.model<IThreatDocument>("ThreatDocument", ThreatDocumentSchema);
export default ThreatDocument;
