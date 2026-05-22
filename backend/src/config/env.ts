import "./loadEnv";

const isProduction = process.env.NODE_ENV === "production";

function normalizeOrigin(urlValue: string): string | null {
  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

function parseOrigins(rawOrigins?: string): string[] {
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));
}

const defaultDevOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const configuredFrontendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL;
const normalizedFrontendUrl = configuredFrontendUrl ? normalizeOrigin(configuredFrontendUrl) : null;

const frontendOriginsFromEnv = parseOrigins(process.env.FRONTEND_ORIGINS);
const frontendOrigins = Array.from(
  new Set([
    ...frontendOriginsFromEnv,
    ...(normalizedFrontendUrl ? [normalizedFrontendUrl] : []),
    ...(!isProduction ? defaultDevOrigins : []),
  ])
);

const frontendUrl = normalizedFrontendUrl || frontendOrigins[0] || "http://localhost:3000";

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/jobshield_ai",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8001",
  frontendOrigins,
  
  // Google OAuth Configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "default-jwt-secret",
  
  // Frontend Configuration
  frontendUrl,
};
