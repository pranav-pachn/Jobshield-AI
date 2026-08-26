import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export async function getEmbedding(text: string): Promise<number[]> {
  if (process.env.EMBEDDING_MODE === "mock") {
    return generateMockEmbedding(text);
  }

  try {
    const response = await axios.post(`${env.aiServiceUrl}/api/embed`, {
      text,
      model: "all-MiniLM-L6-v2"
    });

    if (response.data && response.data.embedding) {
      return response.data.embedding;
    }
    
    throw new Error("Invalid embedding response from AI service");
  } catch (error) {
    logger.error("Failed to fetch embedding from AI service:", error);
    throw new Error(`Embedding service unavailable: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function generateMockEmbedding(text: string): number[] {
  const dim = 384;
  const vec = new Array(dim).fill(0);
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  
  let seed = Math.abs(hash);
  let mag = 0;
  for (let i = 0; i < dim; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const val = (seed / 233280) * 2 - 1;
    vec[i] = val;
    mag += val * val;
  }
  
  mag = Math.sqrt(mag);
  for (let i = 0; i < dim; i++) {
    vec[i] /= mag;
  }
  
  return vec;
}
