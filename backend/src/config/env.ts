export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  frontendOrigins: (process.env.FRONTEND_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
