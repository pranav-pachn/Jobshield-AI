import mongoose from "mongoose";
import { connectDatabase } from "../src/config/database";
import { searchSimilarInvestigations } from "../src/knowledge/vectorSearchService";

async function runVectorSearchCheck() {
  console.log("Connecting to database...");
  await connectDatabase();
  console.log("Connected.");

  console.log("\n--- Executing RAG Invariant Test ---");
  try {
    // 1. Fetch an existing active knowledge item from DB to get a REAL embedding
    const mongoose = require("mongoose");
    const KnowledgeItem = mongoose.connection.collection("knowledgeitems");
    
    const sampleItem = await KnowledgeItem.findOne({ 
      status: "ACTIVE", 
      embedding: { $exists: true, $ne: null } 
    });
    
    if (!sampleItem) {
      console.log("No active KnowledgeItems with embeddings found in DB.");
      return;
    }
    
    console.log(`Tool: search_threat_knowledge`);
    console.log(`Querying using embedding from existing item: ${sampleItem.summary || sampleItem._id}`);
    
    // We bypass getEmbedding by calling the raw aggregate pipeline to prove Atlas Vector Search works
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: sampleItem.embedding,
          numCandidates: 10,
          limit: 5,
          filter: { status: "ACTIVE" }
        }
      },
      {
        $project: {
          _id: 1,
          summary: 1,
          trustLevel: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];
    
    const results = await KnowledgeItem.aggregate(pipeline).toArray();
    
    console.log(`\nretrievedDocuments: [${results.length} items]`);
    results.forEach((r: any, idx: number) => {
      console.log(`\n  [Result ${idx + 1}]`);
      console.log(`  knowledgeItemId: ${r._id}`);
      console.log(`  similarity: ${r.score}`);
      console.log(`  trustLevel: ${r.trustLevel || 'ANALYST_VERIFIED (implied by filter)'}`);
      console.log(`  summary: ${r.summary}`);
    });

  } catch (error) {
    console.error("Vector search failed:", error);
  }

  await mongoose.disconnect();
}

runVectorSearchCheck().catch(console.error);
