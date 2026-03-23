import "./loadEnv";

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/jobshield_ai",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
  frontendOrigins: (process.env.FRONTEND_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  
  // Google OAuth Configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "default-jwt-secret",
  
  // Frontend Configuration
  frontendUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:3000",
};
