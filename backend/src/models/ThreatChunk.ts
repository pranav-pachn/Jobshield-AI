import mongoose, { Schema, Document } from "mongoose";

export interface IThreatChunk extends Document {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  contentHash: string;
  category?: string;
  scamTypes: string[];
  indicators: string[];
  severity?: string;
  evidenceQuality?: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const ThreatChunkSchema: Schema = new Schema({
  chunkId: { type: String, required: true, unique: true, index: true },
  documentId: { type: String, required: true, index: true },
  chunkIndex: { type: Number, required: true },
  content: { type: String, required: true },
  contentHash: { type: String, required: true, unique: true, index: true },
  category: { type: String },
  scamTypes: [{ type: String }],
  indicators: [{ type: String }],
  severity: { type: String },
  evidenceQuality: { type: String },
  embedding: { type: [Number] }, // Atlas Vector Search index needs to be created on this field
}, { timestamps: true });

export const ThreatChunk = mongoose.model<IThreatChunk>("ThreatChunk", ThreatChunkSchema);
export default ThreatChunk;
