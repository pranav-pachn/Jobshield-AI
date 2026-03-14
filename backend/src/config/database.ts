import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB Connected");
}