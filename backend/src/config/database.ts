import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  });
  logger.info("MongoDB Connected", {
    uri: env.mongoUri,
    databaseName: mongoose.connection.name
  });
}