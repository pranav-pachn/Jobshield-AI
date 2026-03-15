const express = require('express');
const DomainIntelligenceService = require('../services/domainIntelligenceService');
const router = express.Router();

// Initialize service
const domainService = new DomainIntelligenceService();

/**
 * POST /api/domains/analyze
 * Analyze domain or email for security intelligence
 */
router.post('/analyze', async (req, res) => {
  try {
    const { domain, email, url } = req.body;
    
    // Determine input
    let input = domain || email || url;
    if (!input) {
      return res.status(400).json({ 
        error: 'Missing required field: domain, email, or url' 
      });
    }

    console.log(`[DOMAIN_API] Received analysis request for: ${input}`);

    const analysis = await domainService.analyzeDomain(input);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('[DOMAIN_API] Analysis failed:', error);
    res.status(500).json({ 
      error: 'Domain analysis failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/domains/quick-check/:domain
 * Quick domain trust score check
 */
router.get('/quick-check/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter required' });
    }

    console.log(`[DOMAIN_API] Quick check for: ${domain}`);

    const analysis = await domainService.analyzeDomain(domain);

    // Return only essential data for quick checks
    res.json({
      success: true,
      data: {
        domain: analysis.domain,
        trustScore: analysis.trustScore,
        recentlyRegistered: analysis.whoisData?.domainAge < 30,
        hasValidSSL: analysis.sslCertificate?.valid || false,
        flaggedBySafeBrowsing: !analysis.safeBrowsing?.safe,
        maliciousReports: analysis.virusTotal?.malicious || 0
      }
    });

  } catch (error) {
    console.error('[DOMAIN_API] Quick check failed:', error);
    res.status(500).json({ 
      error: 'Quick domain check failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/domains/bulk-check
 * Bulk domain analysis for multiple domains
 */
router.post('/bulk-check', async (req, res) => {
  try {
    const { domains } = req.body;
    
    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'Array of domains required' });
    }

    if (domains.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 domains per request' });
    }

    console.log(`[DOMAIN_API] Bulk check for ${domains.length} domains`);

    const results = await Promise.allSettled(
      domains.map(domain => domainService.analyzeDomain(domain))
    );

    const analyses = results.map((result, index) => ({
      domain: domains[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : { error: result.reason?.message }
    }));

    res.json({
      success: true,
      data: {
        analyzed: analyses.length,
        results: analyses
      }
    });

  } catch (error) {
    console.error('[DOMAIN_API] Bulk check failed:', error);
    res.status(500).json({ 
      error: 'Bulk domain check failed',
      message: error.message 
    });
  }
});

module.exports = router;
