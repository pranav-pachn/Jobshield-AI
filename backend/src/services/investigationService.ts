import axios from "axios";
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Investigation } from "../models/Investigation";
import { JobAnalysis } from "../models/JobAnalysis";
import crypto from "crypto";
import ThreatIndicatorExtractionService from './threatIndicatorExtractionService';
import { ThreatIndicatorService } from './threatIndicatorService';
import { ThreatType, ThreatRiskLevel, ThreatSource } from '../models/ThreatIndicator';
import threatIntelligenceService from "./threatIntelligenceService";
import DomainIntelligenceService from "./domainIntelligenceService";

const domainIntelligenceService = new DomainIntelligenceService();

export interface InvestigateInput {
  jobText: string;
  recruiterName?: string;
  email?: string;
  emailDomain?: string;
  company?: string;
  companyDomain?: string;
  linkedinUrl?: string;
  phone?: string;
  jobUrl?: string;
  userId?: string;
}

export async function investigateJob(input: InvestigateInput) {
  // 1. Gather TS intelligence context
  const recruiterContext: any = {};
  
  try {
    if (input.email) {
      const recruiterIntel = await threatIntelligenceService.checkRecruiterEmail(input.email);
      recruiterContext.emailIntelligence = recruiterIntel;
    }
    
    if (input.companyDomain) {
      const domainIntel = await domainIntelligenceService.analyzeDomain(input.companyDomain);
      recruiterContext.companyDomainIntelligence = domainIntel;
    }
    
    if (input.emailDomain && input.emailDomain !== input.companyDomain) {
      const emailDomainIntel = await domainIntelligenceService.analyzeDomain(input.emailDomain);
      recruiterContext.emailDomainIntelligence = emailDomainIntel;
    }
  } catch (error) {
    logger.error("[INVESTIGATION_SERVICE] Error gathering TS intelligence context", { error });
  }
  
  // 2. Call python AI service
  const endpoint = `${env.aiServiceUrl}/api/investigate`;
  
  logger.info("[INVESTIGATION_SERVICE] Forwarding request to Python backend", { endpoint });
  
  const payload = {
    ...input,
    recruiterContext
  };
  
  try {
    const response = await axios.post(endpoint, payload);
    const traceData = response.data;
    
    // 3. Save to MongoDB
    const investigation = new Investigation({
      ...traceData,
      userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined
    });
    await investigation.save();

    // 4. Also mirror into JobAnalysis for Dashboard / History consistency
    try {
      const decision = investigation.decisionPolicy?.decision || "UNKNOWN";
      let riskLevel: "Low" | "Medium" | "High" | "ABSTAIN" = "Medium";
      if (decision === "SCAM") riskLevel = "High";
      if (decision === "SAFE") riskLevel = "Low";

      const text = input.jobText || "";
      const textHash = crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
      const scamProb = (investigation.evaluation?.overall_risk?.score ?? 50) / 100;
      const confidence = investigation.evaluation?.overall_risk?.confidence ?? 0.5;

      await JobAnalysis.create({
        user_id: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined,
        text_hash: textHash,
        job_text: text,
        scam_probability: scamProb,
        risk_level: riskLevel,
        confidence: confidence,
        suspicious_phrases: (investigation as any).heuristicSignals?.redFlags || [],
        reasons: investigation.evaluation?.decision_rationale ? [investigation.evaluation.decision_rationale] : [],
        created_at: investigation.createdAt || new Date(),
        investigationTraceId: investigation._id
      });
    } catch (analysisErr: any) {
      logger.error("[INVESTIGATION_SERVICE] Failed to mirror investigation to JobAnalysis", { error: analysisErr.message });
    }
    
    return investigation;
  } catch (error) {
    logger.error("[INVESTIGATION_SERVICE] Error calling AI service", { error });
    throw error;
  }
}

export async function investigateJobStream(input: InvestigateInput, res: any) {
  // 1. Gather TS intelligence context
  const recruiterContext: any = {};
  
  try {
    if (input.email) {
      const recruiterIntel = await threatIntelligenceService.checkRecruiterEmail(input.email);
      recruiterContext.emailIntelligence = recruiterIntel;
    }
    
    if (input.companyDomain) {
      const domainIntel = await domainIntelligenceService.analyzeDomain(input.companyDomain);
      recruiterContext.companyDomainIntelligence = domainIntel;
    }
    
    if (input.emailDomain && input.emailDomain !== input.companyDomain) {
      const emailDomainIntel = await domainIntelligenceService.analyzeDomain(input.emailDomain);
      recruiterContext.emailDomainIntelligence = emailDomainIntel;
    }
  } catch (error) {
    logger.error("[INVESTIGATION_SERVICE] Error gathering TS intelligence context", { error });
  }
  
  const endpoint = `${env.aiServiceUrl}/api/investigate/stream`;
  
  logger.info("[INVESTIGATION_SERVICE] Forwarding streaming request to Python backend", { endpoint });
  
  const payload = {
    ...input,
    recruiterContext
  };
  
  try {
    const response = await axios.post(endpoint, payload, {
      responseType: 'stream',
      headers: {
        'Accept': 'text/event-stream'
      }
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let buffer = '';
    let isClientConnected = true;

    res.on('close', () => {
      isClientConnected = false;
    });

    response.data.on('data', (chunk: Buffer) => {
      if (isClientConnected) {
        res.write(chunk);
      }

      buffer += chunk.toString('utf-8');
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.event === 'COMPLETE' && event.trace) {
              const investigation = new Investigation({
                ...event.trace,
                userId: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined
              });
              investigation.save()
                .then(async (savedInvestigation) => {
                  logger.info("[INVESTIGATION_SERVICE] Successfully persisted investigation", { id: event.trace.investigationId });

                  // Mirror into JobAnalysis for Dashboard & User History consistency
                  try {
                    const decision = savedInvestigation.decisionPolicy?.decision || "UNKNOWN";
                    let riskLevel: "Low" | "Medium" | "High" | "ABSTAIN" = "Medium";
                    if (decision === "SCAM") riskLevel = "High";
                    if (decision === "SAFE") riskLevel = "Low";

                    const text = input.jobText || "";
                    const textHash = crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");
                    const scamProb = (savedInvestigation.evaluation?.overall_risk?.score ?? 50) / 100;
                    const confidence = savedInvestigation.evaluation?.overall_risk?.confidence ?? 0.5;

                    await JobAnalysis.create({
                      user_id: input.userId ? new mongoose.Types.ObjectId(input.userId) : undefined,
                      text_hash: textHash,
                      job_text: text,
                      scam_probability: scamProb,
                      risk_level: riskLevel,
                      confidence: confidence,
                      suspicious_phrases: (savedInvestigation as any).heuristicSignals?.redFlags || [],
                      reasons: savedInvestigation.evaluation?.decision_rationale ? [savedInvestigation.evaluation.decision_rationale] : [],
                      created_at: savedInvestigation.createdAt || new Date(),
                      investigationTraceId: savedInvestigation._id
                    });
                  } catch (mirrorErr: any) {
                    logger.error("[INVESTIGATION_SERVICE] Failed to mirror stream investigation to JobAnalysis", { error: mirrorErr.message });
                  }
                  
                  // Phase 7: Extract and upsert threat indicators asynchronously
                  try {
                    const jobText = savedInvestigation.input?.jobText || "";
                    if (jobText) {
                      const indicators = ThreatIndicatorExtractionService.extractIndicators(jobText);
                      const indicatorIds: mongoose.Types.ObjectId[] = [];
                      const riskLevel = ThreatRiskLevel.MEDIUM; // Default, can be adjusted based on finalDecision

                      const upsertPromises: Promise<any>[] = [];

                      const queueUpsert = (type: string, values: string[]) => {
                        for (const val of values) {
                          upsertPromises.push(
                            ThreatIndicatorService.upsert(type as any, val, {
                              riskLevel,
                              source: ThreatSource.INVESTIGATION,
                            }).then(ind => {
                              if (ind && ind._id) indicatorIds.push(ind._id as mongoose.Types.ObjectId);
                            })
                          );
                        }
                      };

                      if (indicators.email_domain) queueUpsert(ThreatType.DOMAIN, [indicators.email_domain]);
                      if (indicators.website_domain) queueUpsert(ThreatType.DOMAIN, [indicators.website_domain]);
                      queueUpsert(ThreatType.PHONE, indicators.phone_numbers);
                      queueUpsert(ThreatType.TELEGRAM, indicators.telegram_ids);
                      queueUpsert(ThreatType.WHATSAPP, indicators.whatsapp_numbers);
                      queueUpsert(ThreatType.COMPANY, indicators.company_names);
                      queueUpsert(ThreatType.SCAM_PHRASE, indicators.suspicious_phrases);

                      await Promise.all(upsertPromises);

                      if (indicatorIds.length > 0) {
                        savedInvestigation.linkedIndicators = indicatorIds;
                        await savedInvestigation.save();
                        
                        // Also link investigation to indicators
                        const linkPromises = indicatorIds.map(id => 
                          ThreatIndicatorService.linkInvestigation(id, savedInvestigation._id as mongoose.Types.ObjectId)
                        );
                        await Promise.all(linkPromises);
                      }
                      
                      logger.info(`[INVESTIGATION_SERVICE] Successfully linked ${indicatorIds.length} threat indicators`);
                    }
                  } catch (err: any) {
                    logger.error("[INVESTIGATION_SERVICE] Failed to process threat indicators", { error: err.message });
                  }
                })
                .catch((err: any) => logger.error("[INVESTIGATION_SERVICE] Failed to persist investigation to MongoDB", { error: err.message }));
            }
          } catch (e) {
            // Ignore parsing errors for partial lines
          }
        }
      }
    });

    response.data.on('end', () => {
      if (isClientConnected) {
        res.end();
      }
    });
  } catch (error) {
    logger.error("[INVESTIGATION_SERVICE] Error calling AI streaming service", { error });
    res.status(500).json({ error: "Streaming failed" });
  }
}

export async function getInvestigationById(id: string) {
  return Investigation.findOne({ investigationId: id });
}
