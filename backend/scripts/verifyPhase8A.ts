import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { KnowledgeItem, KnowledgeStatus } from '../src/models/KnowledgeItem';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MONGODB_URI = process.env.MONGODB_URI || '';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyPhase8A() {
  console.log("🚀 Starting Phase 8A Adversarial Verification...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    
    // Setup initial database state for tests
    console.log("0️⃣ Setting up base active knowledge...");
    
    // Clear test knowledge if exists
    await KnowledgeItem.deleteMany({ "provenance.source": "SYSTEM_GENERATED" });
    
    // Seed an ACTIVE piece of knowledge
    const activeItem = new KnowledgeItem({
      content: "example.com is associated with registration-fee scams.",
      type: "SCAM_PATTERN",
      status: KnowledgeStatus.ACTIVE,
      provenance: {
        source: "SYSTEM_GENERATED",
        addedBy: new mongoose.Types.ObjectId(),
        confidenceScore: 0.95
      }
    });
    
    // Generate embedding for it
    const embedRes = await axios.post(`${AI_SERVICE_URL}/api/embed`, { text: activeItem.content });
    activeItem.embedding = embedRes.data.embedding;
    await activeItem.save();

    console.log("   -> Active knowledge seeded. Waiting for Atlas indexing...");
    await sleep(5000);

    // 1. Duplicate
    console.log("\n1️⃣ Testing Duplicate Detection...");
    const dupText = "Applicants must pay a registration charge to example.com.";
    try {
      const dupRes = await axios.post(`${AI_SERVICE_URL}/api/knowledge/duplicate-check`, { text: dupText });
      console.log(`   -> Result: isDuplicate=${dupRes.data.isDuplicate}, confidence=${dupRes.data.confidence.toFixed(2)}`);
      if (dupRes.data.isDuplicate) {
        console.log("   -> ✅ Passed: Duplicate correctly identified.");
      } else {
        console.log("   -> ❌ Failed: Did not flag duplicate.");
      }
    } catch (e: any) {
      console.error("   -> Error:", e.response?.data || e.message);
    }

    // 2. Conflict
    console.log("\n2️⃣ Testing Conflict Detection...");
    const conflictText = "example.com is a verified safe employer.";
    try {
      const conflictRes = await axios.post(`${AI_SERVICE_URL}/api/knowledge/conflict-check`, { text: conflictText });
      console.log(`   -> Result: hasConflict=${conflictRes.data.hasConflict}, confidence=${conflictRes.data.confidence.toFixed(2)}`);
      if (conflictRes.data.hasConflict) {
        console.log("   -> ✅ Passed: Conflict correctly identified.");
      } else {
        console.log("   -> ❌ Failed: Did not flag conflict.");
      }
    } catch (e: any) {
      console.error("   -> Error:", e.response?.data || e.message);
    }

    // 3. New Knowledge
    console.log("\n3️⃣ Testing New Knowledge...");
    const newText = "suspicious-domain-x.com was used in a credential harvesting campaign.";
    try {
      const newDupRes = await axios.post(`${AI_SERVICE_URL}/api/knowledge/duplicate-check`, { text: newText });
      const newConflictRes = await axios.post(`${AI_SERVICE_URL}/api/knowledge/conflict-check`, { text: newText });
      
      if (!newDupRes.data.isDuplicate && !newConflictRes.data.hasConflict) {
        console.log("   -> ✅ Passed: Correctly identified as safe (no dup, no conflict).");
      } else {
        console.log("   -> ❌ Failed: False positive on conflict or duplicate.");
      }
    } catch (e: any) {
      console.error("   -> Error:", e.response?.data || e.message);
    }

    // 4. Revoked Knowledge Retrieval
    console.log("\n4️⃣ Testing RAG Filters (Revoked & Pending)...");
    activeItem.status = KnowledgeStatus.REVOKED;
    await activeItem.save();
    
    // Need a tiny delay for DB update
    await sleep(2000);
    
    // Trigger RAG via the investigate endpoint for `example.com`
    const investigateRes = await axios.post(`${AI_SERVICE_URL}/api/investigate`, {
      jobText: "Please visit example.com to apply.",
      company: "Test",
      jobUrl: ""
    });
    
    const threatFindings = investigateRes.data.threatFindings;
    let foundRevoked = false;
    if (threatFindings && threatFindings.matches) {
      foundRevoked = threatFindings.matches.some((m: any) => m.evidence.includes("example.com is associated with registration-fee scams"));
    }
    
    if (!foundRevoked) {
      console.log("   -> ✅ Passed: Revoked knowledge was NOT retrieved by RAG.");
    } else {
      console.log("   -> ❌ Failed: Revoked knowledge leaked into RAG.");
    }

    // Cleanup
    await KnowledgeItem.deleteMany({ "provenance.source": "SYSTEM_GENERATED" });
    
    console.log("\n🎉 Phase 8A Verification Complete!");

  } catch (error: any) {
    console.error("❌ Verification failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyPhase8A();
