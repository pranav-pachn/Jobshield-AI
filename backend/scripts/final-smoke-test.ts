import mongoose from "mongoose";
import { env } from "../src/config/env";
import { LiveInvestigationAgent } from "../src/agent/investigationAgent";

async function runSmokeTests() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri);
  const agent = new LiveInvestigationAgent();

  console.log("\n--- TEST 1: OBVIOUS SCAM ---");
  const scamInput = {
    jobDescription: "Remote Data Entry Job. No experience required. Earn ₹70,000 per month. To activate your employee account, you must pay a ₹2,999 registration fee.",
  };
  const result1 = await agent.investigate(scamInput as any);
  console.log(`Verdict: ${result1.verdict}`);
  console.log(`Confidence: ${result1.confidence}`);
  console.log(`Mode: ${result1.mode}`);
  console.log(`Signals:`, result1.signals.map((s: any) => s.type));
  if (result1.evidence && result1.evidence.length > 0) {
    console.log(`Evidence [RAG]:`, result1.evidence[0]);
  }

  console.log("\n--- TEST 2: LEGITIMATE JOB ---");
  const legitInput = {
    jobDescription: "Software Engineer. We are hiring a backend engineer to build REST APIs using Node.js and PostgreSQL. 12 LPA salary. No registration fee. No payment required."
  };
  const result2 = await agent.investigate(legitInput as any);
  console.log(`Verdict: ${result2.verdict}`);
  console.log(`Confidence: ${result2.confidence}`);
  console.log(`Mode: ${result2.mode}`);
  console.log(`Signals:`, result2.signals.map((s: any) => s.type));

  console.log("\n--- TEST 3: FORCE PRIMARY MODEL FAIL ---");
  const originalPrimary = env.geminiPrimaryModel;
  (env as any).geminiPrimaryModel = "gemini-nonexistent-model";
  
  const result3 = await agent.investigate(legitInput as any);
  console.log(`Verdict: ${result3.verdict}`);
  console.log(`Mode: ${result3.mode}`);
  console.log(`Fallback Used: ${result3.agentMetrics?.fallbackUsed}`);
  console.log(`Model Used: ${result3.agentMetrics?.modelUsed}`);
  console.log(`Fallback Reason: ${result3.agentMetrics?.fallbackReason}`);
  (env as any).geminiPrimaryModel = originalPrimary;

  console.log("\n--- TEST 4: FORCE ALL PROVIDERS FAIL ---");
  const originalGeminiKeys = env.geminiApiKeys;
  const originalGroqKeys = env.groqApiKeys;
  const originalOpenrouterKeys = env.openrouterApiKeys;
  
  (env as any).geminiApiKeys = [{ projectId: "test", credentialId: "test", key: "invalid-key-1" }];
  (env as any).groqApiKeys = ["invalid-key-2"];
  (env as any).openrouterApiKeys = ["invalid-key-3"];
  
  const result4 = await agent.investigate(scamInput);
  console.log(`Verdict: ${result4.verdict}`);
  console.log(`Mode: ${result4.mode}`);
  console.log(`Reason: ${result4.reason}`);
  
  (env as any).geminiApiKeys = originalGeminiKeys;
  (env as any).groqApiKeys = originalGroqKeys;
  (env as any).openrouterApiKeys = originalOpenrouterKeys;

  console.log("\nAll smoke tests completed.");
  process.exit(0);
}

runSmokeTests().catch(console.error);
