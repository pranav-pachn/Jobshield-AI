const fs = require("fs");
const path = require("path");

const compiledEntry = path.join(__dirname, "dist", "server.js");

if (fs.existsSync(compiledEntry)) {
  require(compiledEntry);
} else {
  try {
    require("ts-node/register/transpile-only");
    require("./src/server.ts");
  } catch (error) {
    console.error("Backend entrypoint not found. Run 'npm run build' before starting the service.");
    throw error;
  }
}