const express = require('express');
const router = express.Router();

// Import the shared data from stats routes
let { updateAnalyses } = require('./jobsStatsRoutes');

// Mock data store (in production, this would be MongoDB)
let recentAnalyses = [];

/**
 * GET /api/jobs/recent
 * Get recent job analyses for threat activity feed
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const riskLevel = req.query.risk; // Optional filter by risk level

    console.log(`[RECENT_JOBS] Fetching recent analyses - limit: ${limit}, risk: ${riskLevel}`);

    // If no data exists, generate some sample data for demo
    if (recentAnalyses.length === 0) {
      recentAnalyses = generateSampleData();
    }

    let filteredAnalyses = recentAnalyses;

    // Filter by risk level if specified
    if (riskLevel) {
      filteredAnalyses = recentAnalyses.filter(analysis => 
        analysis.risk_level.toLowerCase() === riskLevel.toLowerCase()
      );
    }

    // Sort by timestamp (most recent first) and limit
    const sortedAnalyses = filteredAnalyses
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    res.json({
      success: true,
      analyses: {
        analyses: sortedAnalyses,
        total: sortedAnalyses.length,
        filtered: riskLevel ? true : false
      }
    });

  } catch (error) {
    console.error('[RECENT_JOBS] Error fetching recent analyses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent analyses',
      message: error.message
    });
  }
});

/**
 * POST /api/jobs/record
 * Record a new job analysis (called by the main analyze endpoint)
 */
router.post('/record', async (req, res) => {
  try {
    const { job_text, risk_level, scam_probability, suspicious_phrases, reasons } = req.body;

    if (!job_text || !risk_level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job_text, risk_level'
      });
    }

    const analysis = {
      _id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      job_text: job_text.substring(0, 200), // Truncate for feed display
      risk_level,
      scam_probability,
      suspicious_phrases: suspicious_phrases || [],
      reasons: reasons || [],
      created_at: new Date().toISOString(),
      ai_latency_ms: Math.floor(Math.random() * 1000) + 500 // Mock latency
    };

    // Add to recent analyses (keep only last 100)
    recentAnalyses.unshift(analysis);
    if (recentAnalyses.length > 100) {
      recentAnalyses = recentAnalyses.slice(0, 100);
    }

    // Also update the shared analyses in stats routes
    if (updateAnalyses) {
      updateAnalyses(analysis);
    }

    console.log(`[RECENT_JOBS] Recorded new analysis - risk: ${risk_level}, probability: ${scam_probability}`);

    res.json({
      success: true,
      analysis_id: analysis._id
    });

  } catch (error) {
    console.error('[RECENT_JOBS] Error recording analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record analysis',
      message: error.message
    });
  }
});

/**
 * Generate sample data for demonstration
 */
function generateSampleData() {
  const sampleJobs = [
    {
      job_text: "URGENT HIRING: Work from home customer service. Pay $3000 weekly. Send $50 registration fee to start.",
      risk_level: "High",
      scam_probability: 92,
      suspicious_phrases: ["registration fee", "work from home", "$3000 weekly"],
      reasons: ["Requests upfront payment", "Unrealistic salary claims", "Urgent hiring language"]
    },
    {
      job_text: "Data entry position available. No experience needed. Earn $2000/week working from home.",
      risk_level: "High", 
      scam_probability: 85,
      suspicious_phrases: ["no experience needed", "$2000/week", "working from home"],
      reasons: ["Unrealistic salary for entry level", "Too good to be true claims"]
    },
    {
      job_text: "Remote software developer needed. 5+ years experience required. Competitive salary and benefits.",
      risk_level: "Low",
      scam_probability: 15,
      suspicious_phrases: [],
      reasons: ["Professional job posting", "Reasonable requirements", "No suspicious patterns"]
    },
    {
      job_text: "Mystery shopper wanted. Get paid to shop at local stores. Send $25 for background check.",
      risk_level: "High",
      scam_probability: 88,
      suspicious_phrases: ["background check fee", "mystery shopper", "get paid to shop"],
      reasons: ["Requests payment for background check", "Common scam pattern"]
    },
    {
      job_text: "Part-time administrative assistant. Flexible hours. $18/hour. Local business seeks reliable help.",
      risk_level: "Low",
      scam_probability: 12,
      suspicious_phrases: [],
      reasons: ["Normal job description", "Reasonable compensation", "No red flags"]
    },
    {
      job_text: "Work from home package reshipper. Receive packages and forward them. Keep 10% commission.",
      risk_level: "High",
      scam_probability: 95,
      suspicious_phrases: ["package reshipper", "forward packages", "commission"],
      reasons: ["Reshipping scam pattern", "Package forwarding scheme"]
    },
    {
      job_text: "Investment opportunity guaranteed returns. Work from home. $5000 weekly minimum.",
      risk_level: "High",
      scam_probability: 94,
      suspicious_phrases: ["guaranteed returns", "$5000 weekly", "investment opportunity"],
      reasons: ["Investment scam language", "Guaranteed returns claim"]
    },
    {
      job_text: "Freelance writer needed for tech blog. $0.10/word. Remote work flexible schedule.",
      risk_level: "Low",
      scam_probability: 8,
      suspicious_phrases: [],
      reasons: ["Standard freelance rates", "Clear job description", "Professional requirements"]
    }
  ];

  // Generate timestamps over the last 48 hours
  const now = new Date();
  return sampleJobs.map((job, index) => ({
    ...job,
    _id: `sample_${index + 1}`,
    created_at: new Date(now.getTime() - (index * 2 * 60 * 60 * 1000)).toISOString() // 2 hours apart
  }));
}

// Export the update function for other modules
module.exports = { router, updateAnalyses: (analysis) => {
  recentAnalyses.unshift(analysis);
  if (recentAnalyses.length > 100) {
    recentAnalyses = recentAnalyses.slice(0, 100);
  }
}};
