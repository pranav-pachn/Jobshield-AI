const express = require('express');
const EmailAnalysisService = require('../services/emailAnalysisService');
const router = express.Router();

// Initialize service
const emailService = new EmailAnalysisService();

/**
 * POST /api/emails/analyze
 * Analyze a single email address
 */
router.post('/analyze', async (req, res) => {
  try {
    const { email, includeDomainAnalysis = true } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email address is required' 
      });
    }

    console.log(`[EMAIL_API] Received analysis request for: ${email}`);

    const analysis = await emailService.analyzeEmail(email, includeDomainAnalysis);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('[EMAIL_API] Analysis failed:', error);
    res.status(500).json({ 
      error: 'Email analysis failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/emails/extract-and-analyze
 * Extract emails from text and analyze them
 */
router.post('/extract-and-analyze', async (req, res) => {
  try {
    const { text, includeDomainAnalysis = true } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text content is required' 
      });
    }

    console.log(`[EMAIL_API] Extracting and analyzing emails from text (${text.length} chars)`);

    const analysis = await emailService.analyzeEmailsFromText(text, includeDomainAnalysis);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('[EMAIL_API] Extract and analyze failed:', error);
    res.status(500).json({ 
      error: 'Email extraction and analysis failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/emails/quick-check/:email
 * Quick email trust score check
 */
router.get('/quick-check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    console.log(`[EMAIL_API] Quick check for: ${email}`);

    const analysis = await emailService.analyzeEmail(email, false); // Skip domain analysis for quick check

    res.json({
      success: true,
      data: {
        email: analysis.email,
        trustScore: analysis.trustScore,
        isFreeProvider: analysis.isFreeProvider,
        hasSuspiciousPatterns: analysis.suspiciousPatterns.suspicious,
        hasCorporatePatterns: analysis.corporatePatterns.corporate,
        domain: analysis.domain
      }
    });

  } catch (error) {
    console.error('[EMAIL_API] Quick check failed:', error);
    res.status(500).json({ 
      error: 'Quick email check failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/emails/bulk-check
 * Bulk email analysis for multiple emails
 */
router.post('/bulk-check', async (req, res) => {
  try {
    const { emails, includeDomainAnalysis = true } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Array of emails is required' });
    }

    if (emails.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 emails per request' });
    }

    console.log(`[EMAIL_API] Bulk check for ${emails.length} emails`);

    const results = await Promise.allSettled(
      emails.map(email => emailService.analyzeEmail(email, includeDomainAnalysis))
    );

    const analyses = results.map((result, index) => ({
      email: emails[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : { error: result.reason?.message }
    }));

    const summary = {
      totalEmails: emails.length,
      successfulAnalyses: analyses.filter(a => a.success).length,
      failedAnalyses: analyses.filter(a => !a.success).length,
      averageTrustScore: analyses
        .filter(a => a.success && a.data.trustScore)
        .reduce((sum, a) => sum + a.data.trustScore.score, 0) / 
        Math.max(1, analyses.filter(a => a.success && a.data.trustScore).length)
    };

    res.json({
      success: true,
      data: {
        summary,
        results: analyses
      }
    });

  } catch (error) {
    console.error('[EMAIL_API] Bulk check failed:', error);
    res.status(500).json({ 
      error: 'Bulk email check failed',
      message: error.message 
    });
  }
});

module.exports = router;
