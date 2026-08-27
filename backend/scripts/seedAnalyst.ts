import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const email = "test_analyst_3@jobshield.ai";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await User.findOneAndUpdate(
    { email },
    {
      email,
      password: hashedPassword,
      name: "Test Analyst 3",
      role: "ANALYST",
      authProvider: "LOCAL",
      isEmailVerified: true
    },
    { upsert: true, new: true }
  );
  
  console.log("Analyst seeded successfully.");
  process.exit(0);
}

seed().catch(console.error);
