import "dotenv/config";
import express from "express";
import cors from "cors";
import jobRoutes from "./routes/jobRoutes";
import recruiterRoutes from "./routes/recruiterRoutes";
import reportRoutes from "./routes/reportRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import authRoutes from "./routes/authRoutes";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { analyzeJobText } from "./services/aiService";
import mongoose from "mongoose";

const app = express();

app.use(
  cors({
    origin: env.frontendOrigins,
    credentials: true,
  })
);

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // CSP policy - more permissive for development
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; connect-src 'self' https://accounts.google.com; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
  } else {
    // Development: Allow localhost and broader resources
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' http://* https://*; connect-src 'self' http://* https://* wss://*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`[${timestamp}] Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);

// Chrome DevTools discovery endpoint
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.json({
    extensionId: "devtools",
    remoteDebuggingPort: 9222,
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "backend running" });
});

app.get("/api/test-ai", async (_req, res) => {
  const startedAt = Date.now();

  try {
    const sampleText = "Earn $3000 weekly working from home. Pay registration fee.";
    console.log(`[AI_TEST] Testing AI service with: "${sampleText}"`);
    const aiResult = await analyzeJobText(sampleText);

    res.json({
      status: "ai connection ok",
      aiServiceUrl: env.aiServiceUrl,
      latencyMs: Date.now() - startedAt,
      request: { text: sampleText },
      result: aiResult,
    });
  } catch (error) {
    logger.error("AI connectivity test failed", error);
    res.status(502).json({
      status: "ai connection failed",
      aiServiceUrl: env.aiServiceUrl,
      message: error instanceof Error ? error.message : "Unknown AI connection error",
    });
  }
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      res.status(500).json({
        status: "database not connected",
        message: "Mongoose database handle is not available",
      });
      return;
    }

    const collection = db.collection("connection_tests");
    const testRecord = {
      source: "api/test-db",
      createdAt: new Date(),
    };

    const insertResult = await collection.insertOne(testRecord);
    const inserted = await collection.findOne({ _id: insertResult.insertedId });
    await collection.deleteOne({ _id: insertResult.insertedId });

    res.json({
      status: "database connected",
      record: inserted,
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    logger.error("Database connectivity test failed", error);
    res.status(500).json({
      status: "database connection failed",
      message: error instanceof Error ? error.message : "Unknown database connection error",
    });
  }
});

async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    logger.info(`Backend server running on port ${env.port}`);
    console.log(`[${new Date().toISOString()}] Backend server started on port ${env.port}`);
    console.log(`[${new Date().toISOString()}] AI Service URL: ${env.aiServiceUrl}`);
  });
}

void startServer();
