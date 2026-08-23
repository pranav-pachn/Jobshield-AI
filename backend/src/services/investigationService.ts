import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Investigation } from "../models/Investigation";
import DomainIntelligenceService from "./domainIntelligenceService";
import threatIntelligenceService from "./threatIntelligenceService";

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
              const investigation = new Investigation(event.trace);
              investigation.save()
                .then(() => logger.info("[INVESTIGATION_SERVICE] Successfully persisted investigation", { id: event.trace.investigationId }))
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
