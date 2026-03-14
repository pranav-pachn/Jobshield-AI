const express = require("express")
const cors = require("cors")
const axios = require("axios")
const mongoose = require("mongoose")

const app = express()

// Configuration
const PORT = process.env.PORT || 4000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai"
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000"

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)
  console.log(`[${timestamp}] Headers:`, JSON.stringify(req.headers, null, 2))
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body, null, 2))
  }
  next()
})

app.use(cors())
app.use(express.json())

// Health endpoints
app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.get("/api/health", (_req, res) => {
  res.json({ status: "backend running" })
})

// AI Service integration
async function analyzeJobText(input) {
  const startTime = Date.now()
  const endpoint = `${AI_SERVICE_URL}/api/analyze-job`
  
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Forwarding request to: ${endpoint}`)
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Text length: ${input.length} characters`)
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Text preview: "${input.substring(0, 100)}${input.length > 100 ? "..." : ""}"`)

  try {
    const response = await axios.post(endpoint, { text: input })
    const latency = Date.now() - startTime

    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Response received in ${latency}ms`)
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Scam probability: ${response.data.scam_probability}`)
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Risk level: ${response.data.risk_level}`)

    return {
      scam_probability: response.data.scam_probability,
      risk_level: response.data.risk_level,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Error after ${latency}ms:`, error)
    
    if (axios.isAxiosError(error)) {
      console.log(`[${new Date().toISOString()}] AI_SERVICE <- Axios error details:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    
    throw error
  }
}

// Job analysis endpoint
app.post("/api/jobs/analyze", async (req, res) => {
  const text = req.body?.text

  console.log(`[${new Date().toISOString()}] JOB_ANALYZE -> Incoming request`)
  console.log(`[${new Date().toISOString()}] JOB_ANALYZE -> Path: ${req.originalUrl}`)
  console.log(`[${new Date().toISOString()}] JOB_ANALYZE -> Text length: ${typeof text === "string" ? text.length : 0}`)

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    console.log(`[${new Date().toISOString()}] JOB_ANALYZE <- Invalid request payload - Text is missing or empty`)
    return res.status(400).json({ message: "Text is required" })
  }

  try {
    const analysis = await analyzeJobText(text)
    console.log(`[${new Date().toISOString()}] JOB_ANALYZE <- Returning response:`, analysis)
    return res.json(analysis)
  } catch (error) {
    console.log(`[${new Date().toISOString()}] JOB_ANALYZE <- AI service unavailable:`, error)
    return res.status(502).json({ message: "AI service unavailable" })
  }
})

// Test AI endpoint
app.get("/api/test-ai", async (_req, res) => {
  const startedAt = Date.now()

  try {
    const sampleText = "Earn $3000 weekly working from home. Pay registration fee."
    console.log(`[AI_TEST] Testing AI service with: "${sampleText}"`)
    const aiResult = await analyzeJobText(sampleText)

    res.json({
      status: "ai connection ok",
      aiServiceUrl: AI_SERVICE_URL,
      latencyMs: Date.now() - startedAt,
      request: { text: sampleText },
      result: aiResult,
    })
  } catch (error) {
    console.log(`[AI_TEST] AI connectivity test failed:`, error)
    res.status(502).json({
      status: "ai connection failed",
      aiServiceUrl: AI_SERVICE_URL,
      message: error instanceof Error ? error.message : "Unknown AI connection error",
    })
  }
})

// Start server
async function startServer() {
  try {
    // Connect to MongoDB (optional for testing)
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI)
      console.log(`[${new Date().toISOString()}] Connected to MongoDB`)
    }
  } catch (error) {
    console.log(`[${new Date().toISOString()}] MongoDB connection failed:`, error)
  }

  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Backend server started on port ${PORT}`)
    console.log(`[${new Date().toISOString()}] AI Service URL: ${AI_SERVICE_URL}`)
    console.log(`[${new Date().toISOString()}] MongoDB URI: ${MONGODB_URI}`)
  })
}

startServer()