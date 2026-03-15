const express = require('express');
const router = express.Router();

// Mock data store for analyses (in production, this would be MongoDB)
let analyses = [];

/**
 * GET /api/jobs/stats
 * Get overall statistics for the dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    console.log(`[JOBS_STATS] Fetching overall statistics`);

    // If no data exists, generate sample data
    if (analyses.length === 0) {
      analyses = generateSampleAnalyses();
    }

    // Calculate statistics
    const totalAnalyses = analyses.length;
    const highRiskCount = analyses.filter(a => a.risk_level === 'High').length;
    const mediumRiskCount = analyses.filter(a => a.risk_level === 'Medium').length;
    const lowRiskCount = analyses.filter(a => a.risk_level === 'Low').length;
    
    const averageScamScore = analyses.length > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + (a.scam_probability || 0), 0) / analyses.length)
      : 0;

    const stats = {
      total_analyses: totalAnalyses,
      high_risk: highRiskCount,
      medium_risk: mediumRiskCount,
      low_risk: lowRiskCount,
      average_scam_score: averageScamScore,
      last_updated: new Date().toISOString()
    };

    console.log(`[JOBS_STATS] Generated statistics:`, stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[JOBS_STATS] Error generating statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/jobs/analysis-counts
 * Get analysis counts by time period
 */
router.get('/analysis-counts', async (req, res) => {
  try {
    const period = req.query.period || '7d'; // 7d, 30d, 90d
    
    if (analyses.length === 0) {
      analyses = generateSampleAnalyses();
    }

    const now = new Date();
    let cutoffDate;
    
    switch (period) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const recentAnalyses = analyses.filter(a => 
      new Date(a.created_at) >= cutoffDate
    );

    const counts = {
      total: recentAnalyses.length,
      high_risk: recentAnalyses.filter(a => a.risk_level === 'High').length,
      medium_risk: recentAnalyses.filter(a => a.risk_level === 'Medium').length,
      low_risk: recentAnalyses.filter(a => a.risk_level === 'Low').length,
      period: period,
      generated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: counts
    });

  } catch (error) {
    console.error('[JOBS_STATS] Error getting analysis counts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analysis counts',
      message: error.message
    });
  }
});

/**
 * Generate sample analyses for demonstration
 */
function generateSampleAnalyses() {
  const sampleData = [];
  
  // Generate 50 sample analyses with varied risk levels
  for (let i = 0; i < 50; i++) {
    const riskLevels = ['High', 'Medium', 'Low'];
    const weights = [0.3, 0.4, 0.3]; // 30% high, 40% medium, 30% low
    const random = Math.random();
    let riskLevel;
    
    if (random < weights[0]) {
      riskLevel = 'High';
    } else if (random < weights[0] + weights[1]) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    const scamProbability = riskLevel === 'High' ? 75 + Math.random() * 25 :
                        riskLevel === 'Medium' ? 40 + Math.random() * 35 :
                        5 + Math.random() * 35;

    const daysAgo = Math.floor(Math.random() * 30); // Random day in last 30 days
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    sampleData.push({
      _id: `sample_analysis_${i + 1}`,
      job_text: `Sample job posting ${i + 1}`,
      risk_level: riskLevel,
      scam_probability: Math.round(scamProbability),
      suspicious_phrases: riskLevel !== 'Low' ? ['sample phrase'] : [],
      reasons: [`Generated sample analysis - ${riskLevel} risk`],
      created_at: createdDate.toISOString(),
      ai_latency_ms: Math.floor(Math.random() * 2000) + 500
    });
  }

  // Sort by creation date (most recent first)
  return sampleData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Update analyses when new analysis is recorded
 */
function updateAnalyses(newAnalysis) {
  analyses.unshift(newAnalysis);
  if (analyses.length > 1000) {
    analyses = analyses.slice(0, 1000); // Keep only last 1000
  }
}

// Export function to update analyses from other modules
module.exports = { router, updateAnalyses };
