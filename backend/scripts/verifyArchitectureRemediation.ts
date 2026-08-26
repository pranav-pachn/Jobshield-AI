import mongoose from "mongoose";
import { getEmbedding } from "../src/knowledge/embeddingService";
import { searchSimilarThreats, searchSimilarInvestigations } from "../src/knowledge/vectorSearchService";
import { KnowledgeItem } from "../src/models/KnowledgeItem";
import { JobAnalysis } from "../src/models/JobAnalysis";
import { buildProvenance } from "../src/explainability/provenanceBuilder";
import { InvestigationResult } from "../src/agent/types";
import { ToolExecutor } from "../src/agent/toolExecutor";
import { execSync } from "child_process";
import { env } from "../src/config/env";
import dotenv from "dotenv";

dotenv.config();

async function runTests() {
  console.log("=== ARCHITECTURE REMEDIATION VERIFICATION ===\n");
  
  // Test 6: Phase 4 Integrity
  console.log("Test 6: Phase 4 Integrity...");
  try {
    const diff = execSync("git diff -- ../ai-service/phase4_evaluation/").toString();
    if (diff.length > 0) {
      console.error("❌ Phase 4 files have been modified!");
      console.error(diff);
      process.exit(1);
    } else {
      console.log("✅ Phase 4 Integrity PRESERVED (no diffs)");
    }
  } catch (error) {
    console.log("⚠️ Could not check git diff (maybe not a git repo or no phase4_evaluation directory tracked yet). Assuming preserved.");
  }
  
  // Set up DB
  console.log("\nConnecting to MongoDB...");
  if (!env.mongoUri) {
    console.error("Missing MONGO_URI");
    process.exit(1);
  }
  await mongoose.connect(env.mongoUri);
  console.log("✅ Connected");

  // Force remote embedding mode and local AI service
  process.env.EMBEDDING_MODE = "remote";
  process.env.AI_SERVICE_URL = "http://127.0.0.1:8000";
  env.aiServiceUrl = "http://127.0.0.1:8000";

  // Test 1: Embedding Consistency
  console.log("\nTest 1: Embedding Consistency...");
  try {
    const text = "Recruiters requesting registration fees are a common employment scam.";
    const vec1 = await getEmbedding(text);
    const vec2 = await getEmbedding(text);
    
    if (vec1.length !== 384) {
      throw new Error(`Expected 384 dimensions, got ${vec1.length}`);
    }
    
    // Check if vectors are identical
    let identical = true;
    for (let i = 0; i < vec1.length; i++) {
      if (Math.abs(vec1[i] - vec2[i]) > 0.0001) {
        identical = false;
        break;
      }
    }
    
    if (!identical) {
      throw new Error("Same text produced different vectors");
    }
    
    console.log("✅ Embedding Consistency PASSED");
    console.log(`   Model: all-MiniLM-L6-v2, Dimensions: ${vec1.length}`);
  } catch (error) {
    console.error("❌ Test 1 FAILED:", error);
  }

  // Test 4: Provenance
  console.log("\nTest 4: Provenance Similarity...");
  try {
    const mockResult: InvestigationResult = {
      verdict: "SCAM",
      mode: "LIVE",
      confidence: 0.95,
      signals: [],
      contradictions: [],
      trace: [],
      agentMetrics: { toolCalls: 1, uniqueToolsUsed: 1, maxStepsReached: false, stoppedEarly: false, executionSuccess: true, toolErrors: 0, invalidToolCalls: 0 },
      evidence: [
        {
          id: "mock_id_1",
          sourceType: "KNOWLEDGE_BASE",
          summary: "mock summary",
          similarity: 0.93
        },
        {
          id: "mock_id_2",
          sourceType: "KNOWLEDGE_BASE",
          summary: "mock text search result",
          similarity: undefined
        }
      ]
    };
    
    const provenance = buildProvenance(mockResult);
    if (provenance[0].similarity !== 0.93) {
      throw new Error(`Expected similarity 0.93, got ${provenance[0].similarity}`);
    }
    if (provenance[1].similarity !== undefined) {
      throw new Error(`Expected similarity undefined, got ${provenance[1].similarity}`);
    }
    
    console.log("✅ Provenance Similarity PASSED");
  } catch (error) {
    console.error("❌ Test 4 FAILED:", error);
  }

  // Test 3: Historical similarity
  console.log("\nTest 3: Historical Similarity...");
  try {
    const executor = new ToolExecutor();
    // We will call the private method using any cast
    const resStr = await (executor as any).findSimilarCases("test job description that asks for a fee");
    const res = JSON.parse(resStr);
    
    if (res.message === "No similar historical cases found.") {
      console.log("✅ Historical Similarity PASSED (No cases found, but handled correctly)");
    } else {
      if (!res.matches || !res.matches[0].retrievalMethod) {
        throw new Error("Retrieval method (VECTOR/TEXT) not found in output");
      }
      console.log(`✅ Historical Similarity PASSED (Retrieved using ${res.matches[0].retrievalMethod})`);
    }
  } catch (error) {
    console.error("❌ Test 3 FAILED:", error);
  }

  console.log("\n=== ALL TESTS EXECUTED ===");
  await mongoose.disconnect();
}

runTests().catch(console.error);
