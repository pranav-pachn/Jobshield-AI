import mongoose from 'mongoose';
import { LLMInvocation } from '../src/models/LLMInvocation';
import { env } from '../src/config/env';

mongoose.connect(env.mongoUri).then(async () => {
  const invs = await LLMInvocation.find().sort({ startedAt: -1 }).limit(10);
  for (const inv of invs) {
    console.log(`Provider: ${inv.provider}, Model: ${inv.model}, Success: ${inv.success}, Error: ${inv.errorType}, Date: ${inv.startedAt}`);
  }
  process.exit(0);
});
