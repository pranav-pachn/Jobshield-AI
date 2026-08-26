import mongoose from "mongoose";
import { KnowledgeItem } from "../src/models/KnowledgeItem";
import { getEmbedding } from "../src/knowledge/embeddingService";
import { env } from "../src/config/env";
import "../src/config/loadEnv";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(env.mongoUri);
  console.log("Connected.");

  // Find items missing an embedding
  const items = await KnowledgeItem.find({ embedding: { $exists: false } });
  
  console.log(`Found ${items.length} items to embed.`);
  
  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      console.log(`Embedding: ${item.title}`);
      // Create a combined string for better semantic matching
      const textToEmbed = `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}`;
      
      const embedding = await getEmbedding(textToEmbed);
      item.embedding = embedding;
      await item.save();
      
      success++;
    } catch (err: any) {
      console.error(`Failed to embed item ${item.id}:`, err.message);
      failed++;
    }
  }

  console.log(`Done. Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

run();
