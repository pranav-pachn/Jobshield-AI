import dotenv from "dotenv";
import path from "path";

// Load .env file - try multiple paths for compatibility with ts-node-dev and compiled code
const envPaths = [
  path.resolve(process.cwd(), ".env"),                    // From current working directory
  path.resolve(__dirname, "../../.env"),                  // From compiled dist/config
  path.join(__dirname, "../../.env"),                     // Alternative compiled path
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (result.error === undefined) {
    console.log(`✅ Loaded .env from: ${envPath}`);
    break;
  }
}

// Fallback: also check for .env in backend root if running from there
if (!process.env.GOOGLE_CLIENT_ID) {
  dotenv.config({ path: ".env" });
}
