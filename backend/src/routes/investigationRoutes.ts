import { Router } from "express";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/authMiddleware";
import { investigateJob, investigateJobStream, getInvestigationById } from "../services/investigationService";
import ScamEntity from "../models/ScamEntity";
import { buildReplayEvents } from "../explainability/replayBuilder";
import { logger } from "../utils/logger";
import { investigationLimiter } from "../middleware/rateLimiter";
import { Investigation } from "../models/Investigation";
import { buildExplanation, buildTimeline } from "../services/explainabilityService";

const investigationRoutes = Router();

investigationRoutes.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const investigations = await Investigation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.status(200).json(investigations);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to list investigations", { error });
    res.status(500).json({ error: "Failed to list investigations" });
  }
});

investigationRoutes.post("/", authMiddleware, investigationLimiter, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const trace = await investigateJob({ ...req.body, userId });
    res.status(200).json(trace);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to investigate job", { error });
    res.status(500).json({ error: "Failed to investigate job" });
  }
});

investigationRoutes.post("/stream", authMiddleware, investigationLimiter, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    await investigateJobStream({ ...req.body, userId }, res);
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
        user_id: trace.userId || userId,
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
    const isOwner = analysis.user_id ? analysis.user_id.toString() === userId : true;
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

    // 5. Build timeline events
    const timelineData = trace?.investigationId ? await buildTimeline(trace.investigationId) : null;
    const timelineEvents = timelineData?.events || trace?.steps || [];

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
        timeline: timelineEvents,
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
        timeline: timelineEvents,
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

investigationRoutes.get("/:id/trace", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    if (!id) {
      return res.status(400).json({ error: "Investigation ID required" });
    }
    const userId = (req as any).user?.id || (req as any).userId;
    const userRole = (req as any).user?.role;

    let traceDoc: any = null;

    // 1. Try finding Investigation by investigationId (UUID)
    traceDoc = await Investigation.findOne({ investigationId: id }).lean();

    // 2. If not found and valid ObjectId, try finding Investigation by _id
    if (!traceDoc && mongoose.Types.ObjectId.isValid(id)) {
      traceDoc = await Investigation.findById(id).lean();
    }

    // 3. If still not found and valid ObjectId, check if it's a JobAnalysis referencing an Investigation
    if (!traceDoc && mongoose.Types.ObjectId.isValid(id)) {
      const jobAnalysis = await JobAnalysis.findById(id).lean();
      if (jobAnalysis?.investigationTraceId) {
        traceDoc = await Investigation.findById(jobAnalysis.investigationTraceId).lean();
      }

      // Fallback: If JobAnalysis exists but has no linked Investigation (legacy data)
      if (!traceDoc && jobAnalysis) {
        const riskScore = Math.round((jobAnalysis.scam_probability || 0.5) * 100);
        traceDoc = {
          investigationId: id,
          state: "COMPLETED",
          userId: jobAnalysis.user_id,
          input: {
            jobText: jobAnalysis.job_text || "",
          },
          agentTraces: [],
          finalDecision: {
            verdict: jobAnalysis.risk_level === "High" ? "HIGH_RISK" : jobAnalysis.risk_level === "Low" ? "SAFE" : "MEDIUM_RISK",
            riskScore: riskScore,
            confidence: jobAnalysis.confidence || 0.5,
            why: jobAnalysis.reasons || [],
            evidence: [],
            contradictions: [],
            recommendations: [],
          },
          evaluation: {
            content_risk: { score: riskScore, label: jobAnalysis.risk_level },
            recruiter_trust: { score: 50, label: "Medium" },
            threat_match: { score: 50, label: "Medium" },
            historical_similarity: { score: 50, label: "Medium" },
            overall_risk: { score: riskScore, label: jobAnalysis.risk_level },
            evidence_quality: { level: "Medium", score: 50 },
            confidence: jobAnalysis.confidence || 0.5,
            sources_used: 1,
            contradictions: 0,
            missing_evidence: 0,
          },
          createdAt: jobAnalysis.created_at || new Date(),
        };
      }
    }

    if (!traceDoc) {
      return res.status(404).json({ error: "Investigation trace not found" });
    }

    // Ownership check
    const isOwner = traceDoc.userId ? traceDoc.userId.toString() === userId : true;
    const isAdmin = userRole === "ADMIN";
    if (!isOwner && !isAdmin) {
      logger.warn("[INVESTIGATION_ROUTES] Unauthorized access attempt to trace", { id, userId });
      return res.status(403).json({ error: "Unauthorized access to this investigation trace" });
    }

    // Ensure investigationId is populated
    if (!traceDoc.investigationId) {
      traceDoc.investigationId = traceDoc._id ? traceDoc._id.toString() : id;
    }

    res.status(200).json(traceDoc);
  } catch (error) {
    logger.error("[INVESTIGATION_ROUTES] Failed to retrieve canonical trace", { error });
    res.status(500).json({ error: "Failed to retrieve investigation trace" });
  }
});

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
