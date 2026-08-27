import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { investigateJob, investigateJobStream, getInvestigationById } from "../services/investigationService";
import ScamEntity from "../models/ScamEntity";
import { buildReplayEvents } from "../explainability/replayBuilder";
import { logger } from "../utils/logger";
import { investigationLimiter } from "../middleware/rateLimiter";
import { Investigation } from "../models/Investigation";

const investigationRoutes = Router();

investigationRoutes.post("/", authMiddleware, investigationLimiter, async (req, res) => {
  try {
    const trace = await investigateJob(req.body);
    res.status(200).json(trace);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to investigate job", { error });
    res.status(500).json({ error: "Failed to investigate job" });
  }
});

investigationRoutes.post("/stream", authMiddleware, investigationLimiter, async (req, res) => {
  try {
    await investigateJobStream(req.body, res);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to stream investigation", { error });
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream investigation" });
    }
  }
});

import { JobAnalysis } from "../models/JobAnalysis";

investigationRoutes.get("/:id", authMiddleware, async (req, res) => {
  try {
    const analysisId = req.params.id;
    const userId = (req as any).user?.id || (req as any).userId;
    const userRole = (req as any).user?.role;
    
    let analysis: any;
    let trace: any;
    
    const isUuid = analysisId.includes("-");
    if (isUuid) {
      // New flow: Fetch directly from Investigation by UUID
      trace = await Investigation.findOne({ investigationId: analysisId }).lean();
      
      if (!trace) {
        return res.status(404).json({ error: "Investigation not found" });
      }
      
      // Mock analysis fields for frontend compatibility
      const decision = trace.decisionPolicy?.decision || "UNKNOWN";
      let riskLevel = "Medium";
      if (decision === "SCAM") riskLevel = "High";
      if (decision === "SAFE") riskLevel = "Low";
      
      analysis = {
        _id: analysisId,
        created_at: trace.createdAt,
        risk_level: riskLevel,
        scam_probability: (trace.evaluation?.overall_risk?.score || 50) / 100,
        confidence: trace.evaluation?.overall_risk?.confidence || 0.5,
        user_id: userId,
        job_text: trace.input?.jobText || "",
      };
    } else {
      // Legacy flow: Fetch from JobAnalysis
      analysis = await JobAnalysis.findById(analysisId)
        .populate("investigationTraceId")
        .lean();
        
      if (!analysis) {
        return res.status(404).json({ error: "Investigation not found" });
      }
      trace = analysis.investigationTraceId as any;
    }
    
    // 2. Ownership check
    const isOwner = analysis.user_id && analysis.user_id.toString() === userId;
    const isAdmin = userRole === "ADMIN";
    
    if (!isOwner && !isAdmin) {
      logger.warn("[INVESTIGATION_ROUTES] Unauthorized access attempt", { analysisId, userId });
      return res.status(403).json({ error: "Unauthorized access to this investigation" });
    }
    
    // 3. Fetch ScamEntity to get intelligence context (Phase 9)
    const queryId = isUuid ? analysisId : analysisId; // The scam entity is keyed by jobAnalysisId, which for new flow would be the UUID if updated. 
    const scamEntity = await ScamEntity.findOne({ jobAnalysisId: queryId })
      .populate("recruiterProfileId")
      .populate("linkedCampaignIds")
      .lean();

    const campaigns = (scamEntity as any)?.linkedCampaignIds as any[] || [];
    const recruiter = (scamEntity as any)?.recruiterProfileId as any;
    
    // 4. Build replay events
    const replayEvents = buildReplayEvents(trace, analysis, campaigns);

    const response = {
      schemaVersion: "2.0",
      investigation: {
        id: analysisId,
        createdAt: analysis.created_at
      },
      verdict: {
        label: analysis.risk_level,
        riskScore: Math.round(analysis.scam_probability * 100),
        confidence: analysis.confidence ? Math.round(analysis.confidence * 100) : 50
      },
      mode: (analysis as any).mode || "LIVE",
      trace: trace ? {
        timeline: trace.steps,
        evidence: trace.evidence,
        riskBreakdown: trace.riskBreakdown,
        contradictions: trace.contradictions,
        evidenceQuality: trace.evidenceQuality
      } : null,
      recruiter: recruiter ? {
        id: recruiter._id,
        name: recruiter.names?.[0] || "Unknown",
        riskScore: recruiter.riskScore,
        riskLevel: recruiter.riskLevel,
        totalInvestigations: recruiter.linkedInvestigationIds?.length || 0
      } : null,
      campaigns: campaigns.map(c => ({
        campaignId: c.campaignId,
        name: c.name,
        riskLevel: c.riskLevel,
        confidence: c.confidence,
        sharedSignals: c.sharedSignals,
        sharedDomains: c.sharedDomains,
        sharedPhones: c.sharedPhones,
        firstObserved: c.firstObserved,
        lastObserved: c.lastObserved
      })),
      replayEvents,
      // Keeping original fields for legacy UI components if needed
      job_text: analysis.job_text,
      explainability: trace ? {
        timeline: trace.steps,
        evidence: trace.evidence,
        riskBreakdown: trace.riskBreakdown,
        contradictions: trace.contradictions,
        evidenceQuality: trace.evidenceQuality
      } : null
    };
    
    res.status(200).json(response);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to retrieve investigation", { error });
    res.status(500).json({ error: "Failed to retrieve investigation" });
  }
});

import { buildExplanation, buildTimeline } from "../services/explainabilityService";

investigationRoutes.get("/:id/timeline", authMiddleware, async (req, res) => {
  try {
    const timeline = await buildTimeline(req.params.id as string);
    if (!timeline) {
      res.status(404).json({ error: "Investigation not found" });
      return;
    }
    res.status(200).json(timeline);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to retrieve timeline", { error });
    res.status(500).json({ error: "Failed to retrieve timeline" });
  }
});

investigationRoutes.get("/:id/explanation", authMiddleware, async (req, res) => {
  try {
    const explanation = await buildExplanation(req.params.id as string);
    if (!explanation) {
      res.status(404).json({ error: "Investigation not found" });
      return;
    }
    res.status(200).json(explanation);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to retrieve explanation", { error });
    res.status(500).json({ error: "Failed to retrieve explanation" });
  }
});

import { InvestigationFeedback } from "../models/InvestigationFeedback";

investigationRoutes.post("/:id/feedback", authMiddleware, async (req: any, res) => {
  try {
    const analysisId = req.params.id;
    const { verdict, feedbackType, comment } = req.body;
    const userId = req.user.id || req.userId;

    if (!verdict || !feedbackType || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let analysis: any;
    const isUuid = analysisId.includes("-");
    
    if (isUuid) {
      const trace = await Investigation.findOne({ investigationId: analysisId }).lean();
      if (!trace) {
        return res.status(404).json({ error: "Investigation not found" });
      }
      
      const decision = trace.decisionPolicy?.decision || "UNKNOWN";
      let riskLevel = "Medium";
      if (decision === "SCAM") riskLevel = "High";
      if (decision === "SAFE") riskLevel = "Low";
      
      analysis = {
        _id: analysisId,
        user_id: (trace.input as any)?.userId, // We don't strictly have userId in trace input unless passed, but we bypass owner check if admin or not set
        risk_level: riskLevel,
        scam_probability: (trace.evaluation?.overall_risk?.score || 50) / 100,
      };
    } else {
      analysis = await JobAnalysis.findById(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Investigation not found" });
      }
    }

    const isOwner = analysis.user_id && analysis.user_id.toString() === userId;
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin && analysis.user_id) {
      logger.warn("[INVESTIGATION_ROUTES] Unauthorized feedback attempt", { analysisId, userId });
      return res.status(403).json({ error: "Unauthorized access to this investigation" });
    }

    const existingFeedback = await InvestigationFeedback.findOne({ investigationId: analysisId, submittedBy: userId }).lean();
    if (existingFeedback) {
      return res.status(409).json({ error: "Feedback already submitted for this investigation" });
    }

    const feedback = new InvestigationFeedback({
      investigationId: analysisId,
      submittedBy: userId,
      originalVerdict: analysis.risk_level,
      originalRiskScore: Math.round(analysis.scam_probability * 100),
      feedbackType: feedbackType as any,
      feedbackReason: comment,
      suggestedVerdict: verdict === "CORRECT" ? analysis.risk_level : (analysis.risk_level === "Low" ? "High" : "Low")
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to save feedback", { error });
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

export default investigationRoutes;
