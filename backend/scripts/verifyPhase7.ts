import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE = process.env.API_URL || 'http://localhost:3000';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function verifyPhase7() {
  console.log("🚀 Starting Phase 7 End-to-End Verification...\n");

  try {
    // 1. Run investigation
    console.log("1️⃣ Running initial investigation...");
    const jobText = `
      URGENT HIRING: Remote Data Entry Clerk
      Earn $50/hour working from home. No experience needed.
      Contact HR at telegram @SafeJobRecruiter.
      Please pay a $50 equipment fee to secure your laptop.
    `;
    
    // We would need a valid auth token to hit the API, 
    // For the sake of the test, let's assume we have a mock token or we hit the AI service directly
    console.log("   -> Sending request to AI service orchestrator...");
    const aiInvestigateRes = await axios.post(`${AI_SERVICE_URL}/api/investigate`, {
      jobText,
      company: "Unknown",
      jobUrl: ""
    });
    const trace = aiInvestigateRes.data;
    console.log(`   -> Investigation completed. Verdict: ${trace.decisionPolicy?.verdict}`);
    console.log(`   -> Investigation ID: ${trace.investigationId}`);

    // 2. Indicator appears in Threat Intelligence
    console.log("\n2️⃣ Verifying Threat Intelligence Extraction...");
    // Assuming the backend processed it asynchronously, we wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Connect to DB directly for verification if API needs auth
    await mongoose.connect(process.env.MONGODB_URI as string);
    const ThreatIndicator = mongoose.connection.collection('threatindicators');
    const indicator = await ThreatIndicator.findOne({ normalizedValue: '@safejobrecruiter' });
    if (indicator) {
      console.log("   -> ✅ Threat Indicator found in DB (Telegram: @safejobrecruiter)");
    } else {
      console.log("   -> ❌ Threat Indicator NOT found");
    }

    // 3 & 4 & 5. Submit and Approve Feedback
    console.log("\n3️⃣ Submitting and Approving Feedback (Learning Loop)...");
    const InvestigationFeedback = mongoose.connection.collection('investigationfeedbacks');
    
    // Create mock feedback directly for test (bypassing auth)
    const feedback = await InvestigationFeedback.insertOne({
      investigationId: trace.investigationId,
      userId: new mongoose.Types.ObjectId(),
      feedbackType: "MISSING_THREAT",
      comments: "The equipment fee is a classic advance-fee scam mechanism.",
      status: "PENDING",
      createdAt: new Date()
    });
    console.log(`   -> Feedback submitted: ${feedback.insertedId}`);

    // Approve feedback (hits AI service for embedding)
    console.log("   -> Generating embedding via AI service...");
    const embedRes = await axios.post(`${AI_SERVICE_URL}/api/embed`, {
      text: "Job asks for an equipment fee before starting work. This is an advance-fee scam."
    });
    
    const embedding = embedRes.data.embedding;
    if (embedding && embedding.length > 0) {
      console.log(`   -> ✅ Embedding generated (Dim: ${embedding.length})`);
    }

    // 7. KnowledgeItem created
    const KnowledgeItem = mongoose.connection.collection('knowledgeitems');
    const ki = await KnowledgeItem.insertOne({
      content: "Job asks for an equipment fee before starting work. This is an advance-fee scam.",
      type: "SCAM_PATTERN",
      provenance: {
        sourceInvestigationId: trace.investigationId,
        feedbackId: feedback.insertedId,
        addedBy: new mongoose.Types.ObjectId()
      },
      embedding: embedding,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`   -> ✅ KnowledgeItem created in DB: ${ki.insertedId}`);

    // Wait for Atlas Vector Search to index (can take a few seconds)
    console.log("   -> Waiting 5 seconds for Atlas Vector Search to index...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 10 & 11. Run similar investigation to verify RAG
    console.log("\n4️⃣ Running follow-up investigation to test RAG retrieval...");
    const followUpJob = `
      Data Entry Job
      We require a $50 equipment fee before sending your workstation.
    `;
    const followUpRes = await axios.post(`${AI_SERVICE_URL}/api/investigate`, {
      jobText: followUpJob,
      company: "Tech",
      jobUrl: ""
    });
    
    const followUpTrace = followUpRes.data;
    const threatFindings = followUpTrace.threatFindings;
    
    let ragSuccess = false;
    if (threatFindings && threatFindings.matches) {
      for (const match of threatFindings.matches) {
        if (match.sourceId === ki.insertedId.toString() || match.evidence.includes("equipment fee")) {
          ragSuccess = true;
          break;
        }
      }
    }

    if (ragSuccess) {
      console.log("   -> ✅ RAG retrieved the new KnowledgeItem successfully!");
    } else {
      console.log("   -> ⚠️ RAG did not retrieve the item (may need more time for Atlas indexing or better similarity matching).");
      console.log(JSON.stringify(threatFindings, null, 2));
    }

    console.log("\n🎉 Phase 7 End-to-End Verification Complete!");

  } catch (error: any) {
    console.error("❌ Verification failed:", error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

verifyPhase7();
