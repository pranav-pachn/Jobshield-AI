import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { LLMInvocation } from '../src/models/LLMInvocation';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MONGODB_URI = process.env.MONGODB_URI || '';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyPhase8B() {
  console.log("🚀 Starting Phase 8B Observability Verification...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log("0️⃣ Clearing test telemetry...");
    await LLMInvocation.deleteMany({ provider: "test_provider" });

    // 1. Successful investigation stream triggers telemetry
    console.log("\n1️⃣ Testing Standard Telemetry Flow...");
    
    const payload = {
        jobText: "Standard entry level developer needed. Pays $60,000.",
        company: "TestCompany",
        jobUrl: ""
    };
    
    // We send a request to the orchestrator to spin up the agents
    const res = await axios.post(`${AI_SERVICE_URL}/api/investigate`, payload);
    const trace = res.data;
    const invId = trace.investigationId;
    
    console.log(`   -> Investigation ID: ${invId}`);
    
    // Wait for async telemetry queue to flush
    console.log("   -> Waiting 3s for telemetry flush...");
    await sleep(3000);
    
    const invocations = await LLMInvocation.find({ investigationId: invId });
    console.log(`   -> Found ${invocations.length} telemetry records.`);
    
    if (invocations.length >= 3) {
      console.log("   -> ✅ Passed: Telemetry successfully persisted.");
      const sample = invocations[0];
      
      // Check PII
      if ((sample as any).prompt || (sample as any).content) {
        console.log("   -> ❌ Failed: Raw text leaked into telemetry.");
      } else {
        console.log("   -> ✅ Passed: No PII/raw text in telemetry.");
      }
      
      // Check metadata
      if (sample.latencyMs > 0 && sample.task && sample.model) {
        console.log("   -> ✅ Passed: Metadata (latency, task, model) correctly captured.");
      } else {
        console.log("   -> ❌ Failed: Missing metadata fields.");
      }
      
      // Check cost
      if (sample.estimatedCost !== undefined) {
         console.log(`   -> ✅ Passed: Cost tracked (${sample.estimatedCost} - ${sample.pricingVersion}).`);
      } else {
         console.log("   -> ❌ Failed: Cost not tracked.");
      }
    } else {
      console.log("   -> ❌ Failed: Insufficient telemetry records found.");
    }
    
    // 2. Test Telemetry Endpoint manually (Buffer/Queue Resilience)
    console.log("\n2️⃣ Testing Telemetry Ingestion Endpoint...");
    
    const testInvId = "test_inv_" + Date.now();
    const testPayload = {
      investigationId: testInvId,
      requestId: "req_test",
      task: "fast_extraction",
      provider: "test_provider",
      model: "test_model",
      latencyMs: 100,
      success: true,
      attempt: 1,
      fallbackUsed: false,
      routingPolicy: "production",
      pricingVersion: "test"
    };
    
    const ingestRes = await axios.post(`http://localhost:3000/api/telemetry/llm-invocation`, testPayload);
    if (ingestRes.status === 202) {
        console.log("   -> ✅ Passed: Endpoint accepted payload non-blockingly.");
    } else {
        console.log("   -> ❌ Failed: Endpoint did not return 202 Accepted.");
    }
    
    await sleep(1000);
    const manualTest = await LLMInvocation.findOne({ investigationId: testInvId });
    if (manualTest) {
        console.log("   -> ✅ Passed: Manual payload successfully persisted.");
    } else {
        console.log("   -> ❌ Failed: Manual payload not found in DB.");
    }

    console.log("\n🎉 Phase 8B Verification Complete!");

  } catch (error: any) {
    console.error("❌ Verification failed:", error.response?.data || error.message);
  } finally {
    // Cleanup test data
    await LLMInvocation.deleteMany({ provider: "test_provider" });
    await mongoose.disconnect();
  }
}

verifyPhase8B();
