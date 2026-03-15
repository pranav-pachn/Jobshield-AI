const express = require("express")
const cors = require("cors")
const axios = require("axios")

const app = express()

// Configuration
const PORT = process.env.PORT || 4000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001"

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`)
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
  const endpoint = `${AI_SERVICE_URL}/api/analyze`
  
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Forwarding request to: ${endpoint}`)
  console.log(`[${new Date().toISOString()}] AI_SERVICE -> Text length: ${input.length} characters`)

  try {
    const response = await axios.post(endpoint, { text: input })
    const latency = Date.now() - startTime

    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Response received in ${latency}ms`)
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Scam probability: ${response.data.scam_probability}`)

    return {
      scam_probability: response.data.scam_probability,
      risk_level: response.data.risk_level,
    }
  } catch (error) {
    const latency = Date.now() - startTime
    console.log(`[${new Date().toISOString()}] AI_SERVICE <- Error after ${latency}ms:`, error)
    throw error
  }
}

// Job analysis endpoint
app.post("/api/jobs/analyze", async (req, res) => {
  const text = req.body?.text

  console.log(`[${new Date().toISOString()}] JOB_ANALYZE -> Incoming request`)
  console.log(`[${new Date().toISOString()}] JOB_ANALYZE -> Text length: ${typeof text === "string" ? text.length : 0}`)

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    console.log(`[${new Date().toISOString()}] JOB_ANALYZE <- Invalid request payload`)
    return res.status(400).json({ message: "Text is required" })
  }

  try {
    const analysis = await analyzeJobText(text)
    console.log(`[${new Date().toISOString()}] JOB_ANALYZE <- Returning response`)
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
  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Backend server started on port ${PORT}`)
    console.log(`[${new Date().toISOString()}] AI Service URL: ${AI_SERVICE_URL}`)
  })
}

startServer()
