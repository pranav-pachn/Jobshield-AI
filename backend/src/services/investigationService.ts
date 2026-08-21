import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Investigation } from "../models/Investigation";
import domainIntelligenceService from "./domainIntelligenceService";
import threatIntelligenceService from "./threatIntelligenceService";

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
    const investigation = new Investigation(traceData);
    await investigation.save();
    
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
    
    response.data.pipe(res);
    
    // Note: To properly save to mongo, we'd need to intercept the COMPLETE event
    // For simplicity in streaming proxy, we could just stream it.
    // If the client needs the final ID, the python service yields it.
    // But ideally we save it here too. For now we stream it.
    
  } catch (error) {
    logger.error("[INVESTIGATION_SERVICE] Error calling AI streaming service", { error });
    res.status(500).json({ error: "Streaming failed" });
  }
}

export async function getInvestigationById(id: string) {
  return Investigation.findOne({ investigationId: id });
}
