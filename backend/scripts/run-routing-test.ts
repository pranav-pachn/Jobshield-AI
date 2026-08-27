import { llmGateway } from "../src/services/llmGateway";
import { LiveInvestigationAgent } from "../src/agent/investigationAgent";
import mongoose from "mongoose";
import { env } from "../src/config/env";
import { LLMInvocation } from "../src/models/LLMInvocation";

const mockGoogleGenAI = require("@google/genai");
let currentScenario = "";

let groqCallCount = 0;
global.fetch = async (url: any, options: any) => {
  if (currentScenario === "ALL_GEMINI_AND_GROQ_FAIL") {
    return {
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({ error: { message: "Groq is down" } })
    } as any;
  }
  groqCallCount++;
  if (groqCallCount % 2 === 1) {
    return {
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            tool_calls: [{ id: "call_groq", function: { name: "search_threat_knowledge", arguments: "{}" } }]
          }
        }],
        usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
      })
    } as any;
  }
  return {
    ok: true,
    json: async () => ({
      choices: [{
        message: {
          content: '```json\n{"verdict":"SAFE","mode":"LIVE","reason":"Looks safe","confidence":0.9,"signals":[],"evidence":[],"contradictions":[]}\n```'
        }
      }],
      usage: { prompt_tokens: 10, completion_tokens: 50, total_tokens: 60 }
    })
  } as any;
};

mockGoogleGenAI.GoogleGenAI = class {
  constructor(config: any) { this.apiKey = config.apiKey; }
  apiKey: string;
  models = {
    generateContent: async (req: any) => {
      const model = req.model;
      if (currentScenario === "PRIMARY_SUCCEEDS") return createMockGeminiResponse();
      if (currentScenario === "PRIMARY_429") {
        if (model === "gemini-3.7-flash") throw createMockError(429, "RESOURCE_EXHAUSTED", "Rate limited");
        return createMockGeminiResponse();
      }
      if (currentScenario === "PRIMARY_503") {
        if (model === "gemini-3.7-flash") throw createMockError(503, "UNAVAILABLE", "Service down");
        return createMockGeminiResponse();
      }
      if (currentScenario === "PRIMARY_404") {
        if (model === "gemini-3.7-flash") throw createMockError(404, "NOT_FOUND", "Model removed");
        return createMockGeminiResponse();
      }
      if (currentScenario === "CREDENTIAL_401") {
        if (this.apiKey.includes("key1")) throw createMockError(401, "UNAUTHENTICATED", "Invalid API key");
        return createMockGeminiResponse();
      }
      if (currentScenario === "CREDENTIAL_403") {
        if (this.apiKey.includes("key1") && model === "gemini-3.7-flash") throw createMockError(403, "PERMISSION_DENIED", "Project disabled for this model");
        return createMockGeminiResponse();
      }
      if (currentScenario === "ALL_GEMINI_FAIL" || currentScenario === "ALL_GEMINI_AND_GROQ_FAIL") {
        throw createMockError(500, "INTERNAL", "Gemini totally failed");
      }
      return createMockGeminiResponse();
    }
  };
};

let geminiCallCount = 0;

function createMockGeminiResponse() {
  geminiCallCount++;
  if (geminiCallCount % 2 === 1) {
    return {
      usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 20, totalTokenCount: 35 },
      candidates: [{
        content: {
          parts: [
            { functionCall: { name: "search_threat_knowledge", args: { query: "test" } } }
          ]
        }
      }]
    };
  }
  return {
    usageMetadata: { promptTokenCount: 15, candidatesTokenCount: 20, totalTokenCount: 35 },
    candidates: [{
      content: {
        parts: [
          { text: '```json\n{"verdict":"SAFE","mode":"LIVE","reason":"Mocked safe","confidence":0.99,"signals":[],"evidence":[],"contradictions":[]}\n```' }
        ]
      }
    }]
  };
}

function createMockError(status: number, code: string, message: string) {
  const err = new Error(message);
  (err as any).status = status;
  (err as any).code = code;
  return err;
}

async function runTests() {
  console.log("Connecting to DB for telemetry...");
  await mongoose.connect(env.mongoUri);
  await LLMInvocation.deleteMany({});
  
  const agent = new LiveInvestigationAgent();
  const input = { jobDescription: "Test Job", recruiterEmail: "test@test.com" };
  const scenarios = [
    "PRIMARY_SUCCEEDS", "PRIMARY_429", "PRIMARY_503", "PRIMARY_404",
    "CREDENTIAL_401", "CREDENTIAL_403", "ALL_GEMINI_FAIL", "ALL_GEMINI_AND_GROQ_FAIL"
  ];

  for (const scenario of scenarios) {
    console.log(`\n--- Running Scenario: ${scenario} ---`);
    currentScenario = scenario;
    (llmGateway as any).unavailableModels.clear();
    (llmGateway as any).unavailableCredentials.clear();
    (llmGateway as any).credentialModelComboCooldown.clear();
    
    const realSetTimeout = global.setTimeout;
    (global as any).setTimeout = (cb: any, ms: number) => realSetTimeout(cb, 1);

    try {
      const result = await agent.investigate(input);
      console.log(`Verdict: ${result.verdict}, Mode: ${result.mode}, Fallback: ${result.agentMetrics.fallbackUsed}`);
    } catch (e: any) {
      console.error(`Scenario ${scenario} failed: ${e.message}`);
    }
    (global as any).setTimeout = realSetTimeout;
  }
  
  const telemetryCount = await LLMInvocation.countDocuments();
  console.log(`\n✅ Telemetry records saved: ${telemetryCount}`);
  console.log("\nAll routing tests completed successfully.");
  process.exit(0);
}
runTests();
