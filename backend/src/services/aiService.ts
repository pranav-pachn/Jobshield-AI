import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

type AnalyzeJobResponse = {
  scam_probability: number;
  risk_level: string;
  confidence?: number;
  heuristic_confidence?: number;
  hybrid_intelligence?: {
    confidence_score?: number;
  };
  suspicious_phrases: string[];
  reasons: string[];
  component_scores?: {
    rule_score: number;
    zero_shot_score: number;
    similarity_score: number;
  };
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  matching_templates?: string[];
};

export async function analyzeJobText(input: string) {
  const startTime = Date.now();
  const endpoint = `${env.aiServiceUrl}/api/analyze-job`;
  
  logger.info("[AI_SERVICE] Forwarding request", {
    endpoint,
    textLength: input.length,
    textPreview: input.substring(0, 100) + (input.length > 100 ? "..." : ""),
  });

  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Forwarding request to: ${endpoint}`);
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Text length: ${input.length} characters`);
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Text preview: "${input.substring(0, 100)}${input.length > 100 ? "..." : ""}"`);

  try {
    const response = await axios.post<AnalyzeJobResponse>(
      endpoint,
      { text: input },
    );

    const latency = Date.now() - startTime;

    logger.info("[AI_SERVICE] Response received", {
      scam_probability: response.data.scam_probability,
      risk_level: response.data.risk_level,
      latencyMs: latency,
    });

    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Response received in ${latency}ms`);
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Scam probability: ${response.data.scam_probability}`);
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Risk level: ${response.data.risk_level}`);

    return {
      scam_probability: response.data.scam_probability,
      risk_level: response.data.risk_level,
      confidence:
        response.data.confidence ??
        response.data.hybrid_intelligence?.confidence_score ??
        response.data.heuristic_confidence,
      suspicious_phrases: response.data.suspicious_phrases,
      reasons: response.data.reasons,
      component_scores: response.data.component_scores,
      phrase_details: response.data.phrase_details,
      matching_templates: response.data.matching_templates,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Error after ${latency}ms:`, error);
    
    if (axios.isAxiosError(error)) {
      console.log(`[${new Date().toISOString()}] AI_SERVICE <- Axios error details:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
    
    throw error;
  }
}
