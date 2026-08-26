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
  jwtSecret: process.env.JWT_SECRET || "",
  
  // Frontend Configuration
  frontendUrl,

  // Agent Mode
  agentMode: process.env.AGENT_MODE || "live",
  
  // LLM Config
  geminiApiKeys: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [],
  llmProvider: process.env.LLM_PROVIDER || "google",
  llmFallbackProviders: process.env.LLM_FALLBACK_PROVIDERS ? process.env.LLM_FALLBACK_PROVIDERS.split(',').map(s => s.trim()).filter(Boolean) : [],
  
  geminiPrimaryModel: process.env.GEMINI_PRIMARY_MODEL || "gemini-3.7-flash",
  geminiSecondaryModel: process.env.GEMINI_SECONDARY_MODEL || "gemini-3.6-flash",
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash",
  geminiFlashLiteModel: process.env.GEMINI_FLASH_LITE_MODEL || "gemini-3.5-flash-lite",
  geminiMinRequestIntervalMs: Number(process.env.GEMINI_MIN_REQUEST_INTERVAL_MS || 4000),

  // Multi-Provider Keys
  openrouterApiKeys: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [],
  groqApiKeys: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [],
  cerebrasApiKeys: process.env.CEREBRAS_API_KEY ? process.env.CEREBRAS_API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [],
  nvidiaApiKeys: process.env.NVIDIA_API_KEY ? process.env.NVIDIA_API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [],
  
  // Multi-Provider Models
  openrouterModel: process.env.OPENROUTER_MODEL || "openrouter/auto",
  groqModel: process.env.GROQ_MODEL || "llama3-70b-8192",
  cerebrasModel: process.env.CEREBRAS_MODEL || "llama3-70b",
  nvidiaModel: process.env.NVIDIA_MODEL || "meta/llama3-70b-instruct",
};
