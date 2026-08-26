import { KnowledgeItem, IKnowledgeItem } from "../models/KnowledgeItem";
import { getEmbedding } from "./embeddingService";

export interface RetrievedEvidence {
  item: IKnowledgeItem;
  similarity: number;
}

export async function searchSimilarThreats(text: string, topK: number = 5, threshold: number = 0.70): Promise<RetrievedEvidence[]> {
  const queryEmbedding = await getEmbedding(text);

  // Use MongoDB Atlas Vector Search ($vectorSearch)
  const results = await KnowledgeItem.aggregate([
    {
      $vectorSearch: {
        index: "vector_index", // Must match your Atlas Search index name
        path: "embedding",
        queryVector: queryEmbedding,
        limit: topK,
        filter: { status: "ACTIVE" }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        category: 1,
        severity: 1,
        source: 1,
        sourceType: 1,
        tags: 1,
        status: 1,
        trustLevel: 1,
        provenance: 1,
        createdAt: 1,
        updatedAt: 1,
        score: { $meta: "vectorSearchScore" }
      }
    },
    {
      $match: {
        score: { $gte: threshold }
      }
    }
  ]);

  return results.map(doc => ({
    item: doc as unknown as IKnowledgeItem,
    similarity: doc.score
  }));
}

import { JobAnalysis, IJobAnalysis } from "../models/JobAnalysis";
import { logger } from "../utils/logger";

export interface RetrievedInvestigation {
  item: IJobAnalysis;
  similarity?: number;
  matchType: "semantic" | "text";
}

export async function searchSimilarInvestigations(query: string, topK: number = 3, threshold: number = 0.70): Promise<RetrievedInvestigation[]> {
  try {
    const queryEmbedding = await getEmbedding(query);
    
    // Try vector search on JobAnalysis
    const vectorResults = await JobAnalysis.aggregate([
      {
        $vectorSearch: {
          index: "job_analysis_vector_index", 
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: topK * 10,
          limit: topK
        }
      },
      {
        $project: {
          _id: 1,
          job_text: 1,
          scam_probability: 1,
          risk_level: 1,
          reasons: 1,
          suspicious_phrases: 1,
          created_at: 1,
          score: { $meta: "vectorSearchScore" }
        }
      },
      {
        $match: {
          score: { $gte: threshold }
        }
      }
    ]);

    if (vectorResults.length > 0) {
      return vectorResults.map(doc => ({
        item: doc as unknown as IJobAnalysis,
        similarity: doc.score,
        matchType: "semantic"
      }));
    }
  } catch (error) {
    logger.warn("Vector search for similar cases failed or not supported, falling back to text search.", error);
  }

  // Fallback to text search
  try {
    const textResults = await JobAnalysis.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(topK)
    .lean();

    return textResults.map(doc => ({
      item: doc as unknown as IJobAnalysis,
      matchType: "text"
    }));
  } catch (error) {
    logger.error("Text search for similar cases failed.", error);
    return [];
  }
}
