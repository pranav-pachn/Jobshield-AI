import fs from 'fs';
import { V1Adapter } from '../src/evaluation/adapters/V1Adapter';
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import '../src/config/loadEnv';
import { analyzeJobWithSmartFlow } from '../src/services/smartAnalysisService';

async function main() {
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB.");
  
  const cases = JSON.parse(fs.readFileSync('datasets/v1_benchmark.json', 'utf-8'));
  const adapter = new V1Adapter();
  
  console.log("ID\tTruth\tPrediction\tProb\tSignals");
  for(let i = 0; i < 15; i++) {
    const c = cases[i];
    const res = await analyzeJobWithSmartFlow(c.text);
    // @ts-ignore
    console.log(`${c.id}\t${c.label}\tN/A\t${res.scam_probability?.toFixed(2)}\t${res.suspicious_phrases?.join(',')}`);
  }
  process.exit(0);
}
main();
