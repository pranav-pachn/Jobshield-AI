const express = require('express');
const router = express.Router();

// Mock data store for community reports (in production, this would be MongoDB)
let communityReports = [];

/**
 * POST /api/community/reports
 * Submit a new community scam report
 */
router.post('/reports', async (req, res) => {
  try {
    const {
      reporter_name,
      reporter_email,
      job_title,
      company_name,
      recruiter_name,
      recruiter_email,
      job_description,
      scam_type,
      scam_details,
      evidence_urls,
      contact_method
    } = req.body;

    // Validate required fields
    if (!job_description || !scam_type || !reporter_email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job_description, scam_type, reporter_email'
      });
    }

    const report = {
      _id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporter_name: reporter_name || 'Anonymous',
      reporter_email,
      job_title: job_title || 'Unknown',
      company_name: company_name || 'Unknown',
      recruiter_name: recruiter_name || 'Unknown',
      recruiter_email: recruiter_email || null,
      job_description: job_description.substring(0, 2000), // Limit length
      scam_type,
      scam_details: scam_details || '',
      evidence_urls: evidence_urls || [],
      contact_method: contact_method || 'email',
      status: 'pending', // pending, reviewed, resolved
      reported_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      moderator_notes: null,
      upvotes: 0,
      downvotes: 0,
      verified_reports: 0 // Number of times this scam pattern has been verified
    };

    // Add to community reports
    communityReports.unshift(report);
    
    // Keep only last 1000 reports
    if (communityReports.length > 1000) {
      communityReports = communityReports.slice(0, 1000);
    }

    console.log(`[COMMUNITY_REPORT] New report submitted - type: ${scam_type}, reporter: ${reporter_email}`);

    res.json({
      success: true,
      report_id: report._id,
      message: 'Report submitted successfully. Thank you for helping keep the community safe!'
    });

  } catch (error) {
    console.error('[COMMUNITY_REPORT] Error submitting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit report',
      message: error.message
    });
  }
});

/**
 * GET /api/community/reports
 * Get community reports with filtering
 */
router.get('/reports', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      scam_type,
      status,
      sort_by = 'reported_at',
      sort_order = 'desc'
    } = req.query;

    console.log(`[COMMUNITY_REPORT] Fetching reports - limit: ${limit}, offset: ${offset}, type: ${scam_type}`);

    let filteredReports = [...communityReports];

    // Filter by scam type
    if (scam_type) {
      filteredReports = filteredReports.filter(report => 
        report.scam_type.toLowerCase() === scam_type.toLowerCase()
      );
    }

    // Filter by status
    if (status) {
      filteredReports = filteredReports.filter(report => 
        report.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Sort reports
    filteredReports.sort((a, b) => {
      const aValue = a[sort_by] || a.reported_at;
      const bValue = b[sort_by] || b.reported_at;
      
      if (sort_order === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    res.json({
      success: true,
      reports: paginatedReports,
      pagination: {
        total: filteredReports.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: endIndex < filteredReports.length
      }
    });

  } catch (error) {
    console.error('[COMMUNITY_REPORT] Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

/**
 * GET /api/community/reports/stats
 * Get community reporting statistics
 */
router.get('/reports/stats', async (req, res) => {
  try {
    console.log(`[COMMUNITY_REPORT] Fetching community statistics`);

    const stats = {
      total_reports: communityReports.length,
      pending_reports: communityReports.filter(r => r.status === 'pending').length,
      reviewed_reports: communityReports.filter(r => r.status === 'reviewed').length,
      resolved_reports: communityReports.filter(r => r.status === 'resolved').length,
      
      // Reports by scam type
      reports_by_type: {},
      
      // Recent reports (last 7 days)
      recent_reports: communityReports.filter(r => {
        const reportDate = new Date(r.reported_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return reportDate >= weekAgo;
      }).length,
      
      // Top contributors
      top_contributors: {}
    };

    // Calculate reports by scam type
    communityReports.forEach(report => {
      if (!stats.reports_by_type[report.scam_type]) {
        stats.reports_by_type[report.scam_type] = 0;
      }
      stats.reports_by_type[report.scam_type]++;
    });

    // Calculate top contributors
    communityReports.forEach(report => {
      if (report.reporter_email !== 'Anonymous') {
        if (!stats.top_contributors[report.reporter_email]) {
          stats.top_contributors[report.reporter_email] = 0;
        }
        stats.top_contributors[report.reporter_email]++;
      }
    });

    // Convert to arrays and sort
    stats.reports_by_type_array = Object.entries(stats.reports_by_type)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    stats.top_contributors_array = Object.entries(stats.top_contributors)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('[COMMUNITY_REPORT] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community stats',
      message: error.message
    });
  }
});

/**
 * POST /api/community/reports/:reportId/vote
 * Vote on a community report
 */
router.post('/reports/:reportId/vote', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { vote_type } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote type. Must be upvote or downvote.'
      });
    }

    const reportIndex = communityReports.findIndex(r => r._id === reportId);
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Update vote count
    if (vote_type === 'upvote') {
      communityReports[reportIndex].upvotes++;
    } else {
      communityReports[reportIndex].downvotes++;
    }

    console.log(`[COMMUNITY_REPORT] Vote recorded - report: ${reportId}, vote: ${vote_type}`);

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('[COMMUNITY_REPORT] Error voting on report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vote',
      message: error.message
    });
  }
});

/**
 * GET /api/community/scam-types
 * Get available scam types for reporting
 */
router.get('/scam-types', async (req, res) => {
  try {
    const scamTypes = [
      {
        id: 'advance_fee',
        name: 'Advance Fee Fraud',
        description: 'Requests for payment before starting work'
      },
      {
        id: 'fake_check',
        name: 'Fake Check Scam',
        description: 'Sending fake checks that bounce after deposit'
      },
      {
        id: 'reshipping',
        name: 'Reshipping Scam',
        description: 'Package forwarding schemes using stolen credit cards'
      },
      {
        id: 'phishing',
        name: 'Phishing',
        description: 'Fake job websites to steal personal information'
      },
      {
        id: 'identity_theft',
        name: 'Identity Theft',
        description: 'Requests for excessive personal information'
      },
      {
        id: 'pyramid_scheme',
        name: 'Pyramid Scheme',
        description: 'Recruitment for pyramid or MLM schemes'
      },
      {
        id: 'work_from_home',
        name: 'Work from Home Scam',
        description: 'Fake work-from-home opportunities'
      },
      {
        id: 'unrealistic_salary',
        name: 'Unrealistic Salary',
        description: 'Salary claims that are too good to be true'
      },
      {
        id: 'fake_company',
        name: 'Fake Company',
        description: 'Impersonating legitimate companies'
      },
      {
        id: 'other',
        name: 'Other',
        description: 'Other types of job scams'
      }
    ];

    res.json({
      success: true,
      scam_types: scamTypes
    });

  } catch (error) {
    console.error('[COMMUNITY_REPORT] Error fetching scam types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scam types',
      message: error.message
    });
  }
});

module.exports = router;
