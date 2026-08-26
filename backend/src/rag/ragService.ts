import { searchSimilarThreats } from "../knowledge/vectorSearchService";
import { buildRagSystemPrompt } from "./ragPromptBuilder";
import { env } from "../config/env";

export interface JobAnalysisResult {
  scam_probability: number;
  suspicious_phrases: string[];
  analysis_time_ms: number;
}

// Use a mock LLM if OpenAI isn't configured, or Groq
// The project has groq-sdk, but I'll use a generic fetch if groq is preferred
// I will implement a placeholder LLM call that integrates with the user's setup
export async function analyzeJobWithRAG(jobDescription: string): Promise<JobAnalysisResult> {
  const startTime = Date.now();

  // 1. Retrieve similar threats
  const retrievedEvidence = await searchSimilarThreats(jobDescription, 5, 0.70);

  // 2. Build RAG prompt
  const systemPrompt = buildRagSystemPrompt(retrievedEvidence);
  const userPrompt = `Job Description:\n${jobDescription}\n\nPlease analyze this job based on your instructions.`;

  // 3. Call LLM
  let llmOutput = "";
  if (process.env.GROQ_API_KEY) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "llama3-70b-8192",
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });
    const data = await res.json();
    llmOutput = data.choices?.[0]?.message?.content || "{}";
  } else {
    // Mock if no groq client (useful for CI/evaluation without keys)
    llmOutput = JSON.stringify({
      decision: retrievedEvidence.length > 0 ? "SCAM" : "SAFE",
      confidence: 0.85,
      detected_signals: retrievedEvidence.flatMap(e => e.item.tags),
      reasoning: "Mocked RAG response based on retrieved evidence length."
    });
  }

  // 4. Parse Output
  let parsed: any;
  try {
    parsed = JSON.parse(llmOutput);
  } catch (err) {
    parsed = { decision: "ABSTAIN", confidence: 0, detected_signals: [] };
  }

  const latencyMs = Date.now() - startTime;
  const scam_probability = parsed.decision === "SCAM" ? parsed.confidence : (parsed.decision === "SAFE" ? (1 - parsed.confidence) : 0.5);

  return {
    scam_probability,
    suspicious_phrases: parsed.detected_signals || [],
    analysis_time_ms: latencyMs,
    // Provide retrieval info for evaluation
    _ragContext: retrievedEvidence.map(e => e.item),
    _rawDecision: parsed.decision
  } as JobAnalysisResult & { _ragContext?: any, _rawDecision?: string };
}
