export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
};
