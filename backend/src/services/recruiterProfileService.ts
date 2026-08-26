import mongoose from 'mongoose';
import { RecruiterProfile, IRecruiterProfile } from '../models/RecruiterProfile';
import { Investigation } from '../models/Investigation';
import { ThreatCampaign } from '../models/ThreatCampaign';

export type IdentityMatchConfidence = 'EXACT_EMAIL' | 'EXACT_PHONE' | 'EMAIL_DOMAIN_COMPANY' | 'DOMAIN_ONLY' | 'NO_MATCH';

export interface RecruiterRiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  breakdown: {
    history: number; // 0-30
    signals: number; // 0-30
    identity: number; // 0-20
    infrastructure: number; // 0-20
  };
}

class RecruiterProfileService {
  
  /**
   * Deterministic matching logic for recruiter identities
   */
  async findProfile(email?: string, phone?: string, domain?: string, company?: string): Promise<{ profile: IRecruiterProfile, matchType: IdentityMatchConfidence } | null> {
    if (email) {
      const profile = await RecruiterProfile.findOne({ emails: email });
      if (profile) return { profile, matchType: 'EXACT_EMAIL' };
    }
    
    if (phone) {
      const profile = await RecruiterProfile.findOne({ phones: phone });
      if (profile) return { profile, matchType: 'EXACT_PHONE' };
    }
    
    if (email && domain && company) {
       // Find profile with same domain and company, even if email prefix differs
       const profile = await RecruiterProfile.findOne({ domains: domain, companies: company });
       if (profile) return { profile, matchType: 'EMAIL_DOMAIN_COMPANY' };
    }
    
    if (domain) {
      // Domain only is considered a related entity, not necessarily the same recruiter
      // However, if we need to return it as a weak match:
      const profile = await RecruiterProfile.findOne({ domains: domain });
      if (profile) return { profile, matchType: 'DOMAIN_ONLY' };
    }
    
    return null;
  }

  /**
   * Find existing or create a new recruiter profile based on identity match
   */
  async findOrCreateProfile(
    email?: string, 
    domain?: string, 
    phone?: string, 
    name?: string, 
    company?: string
  ): Promise<{ profile: IRecruiterProfile, matchType: IdentityMatchConfidence, isNew: boolean }> {
    
    const match = await this.findProfile(email, phone, domain, company);
    
    if (match) {
      // If it's a DOMAIN_ONLY match, we DO NOT merge it. We create a new profile.
      if (match.matchType !== 'DOMAIN_ONLY') {
        let updated = false;
        
        if (email && !match.profile.emails.includes(email)) { match.profile.emails.push(email); updated = true; }
        if (domain && !match.profile.domains.includes(domain)) { match.profile.domains.push(domain); updated = true; }
        if (phone && !match.profile.phones.includes(phone)) { match.profile.phones.push(phone); updated = true; }
        if (name && !match.profile.names.includes(name)) { match.profile.names.push(name); updated = true; }
        if (company && !match.profile.companies.includes(company)) { match.profile.companies.push(company); updated = true; }
        
        if (updated) {
          await match.profile.save();
        }
        
        return { profile: match.profile, matchType: match.matchType, isNew: false };
      }
    }
    
    // Create new profile
    const profile = new RecruiterProfile({
      emails: email ? [email] : [],
      domains: domain ? [domain] : [],
      phones: phone ? [phone] : [],
      names: name ? [name] : [],
      companies: company ? [company] : [],
      riskScore: 0,
      riskLevel: "LOW",
    });
    
    await profile.save();
    return { profile, matchType: 'NO_MATCH', isNew: true };
  }

  /**
   * Updates profile with a new investigation and recalculates risk
   */
  async linkInvestigation(profileId: string | mongoose.Types.ObjectId, investigationId: string | mongoose.Types.ObjectId, verdict: string, signals: string[]): Promise<IRecruiterProfile | null> {
    const profile = await RecruiterProfile.findById(profileId);
    if (!profile) return null;
    
    profile.totalInvestigations += 1;
    
    if (verdict === 'HIGH' || verdict === 'CRITICAL' || verdict === 'SCAM') {
      profile.suspiciousCount += 1;
      profile.confirmedScamCount += 1; // Simplification for now
    } else if (verdict === 'LOW' || verdict === 'SAFE') {
      profile.legitimateCount += 1;
    } else {
      profile.suspiciousCount += 1; // Medium/Review
    }
    
    if (!profile.linkedInvestigationIds.includes(investigationId as any)) {
      profile.linkedInvestigationIds.push(investigationId as any);
    }
    
    // Update signals
    for (const signal of signals) {
      const existing = profile.signals.find(s => s.signal === signal);
      if (existing) {
        existing.count += 1;
      } else {
        profile.signals.push({ signal, count: 1, firstSeen: new Date() });
      }
    }
    
    profile.lastSeen = new Date();
    
    // Recalculate Risk
    const riskResult = this.computeRecruiterRisk(profile);
    profile.riskScore = riskResult.score;
    profile.riskLevel = riskResult.level;
    
    await profile.save();
    return profile;
  }
  
  /**
   * Deterministic Risk Calculation (Max 100)
   * History: 0-30
   * Signals: 0-30
   * Identity: 0-20
   * Infrastructure: 0-20
   */
  computeRecruiterRisk(profile: IRecruiterProfile): RecruiterRiskResult {
    // 1. History (0-30)
    let historyScore = 0;
    if (profile.totalInvestigations > 0) {
      const scamRatio = profile.suspiciousCount / profile.totalInvestigations;
      historyScore = Math.min(30, Math.round(scamRatio * 30));
      // Boost if many confirmed scams
      if (profile.confirmedScamCount > 2) {
        historyScore = Math.min(30, historyScore + 10);
      }
    }
    
    // 2. Signals (0-30)
    let signalsScore = 0;
    const totalSignals = profile.signals.reduce((acc, s) => acc + s.count, 0);
    if (totalSignals > 0) {
      signalsScore = Math.min(30, totalSignals * 5); // 5 points per signal
    }
    
    // 3. Identity (0-20)
    let identityScore = 0;
    // Inconsistencies increase risk
    if (profile.names.length > 2) identityScore += 10;
    if (profile.emails.length > 2) identityScore += 10;
    if (profile.companies.length > 1) identityScore += 5;
    identityScore = Math.min(20, identityScore);
    
    // 4. Infrastructure (0-20)
    let infraScore = 0;
    // Basic heuristics: generic domains or mismatched domains
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    const usesFreeEmail = profile.domains.some(d => freeProviders.includes(d.toLowerCase()));
    if (usesFreeEmail && profile.companies.length > 0 && !profile.companies.includes("Freelance")) {
      infraScore += 15; // Using free email for corporate job
    }
    infraScore = Math.min(20, infraScore);
    
    const totalScore = historyScore + signalsScore + identityScore + infraScore;
    
    let level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    if (totalScore >= 80) level = "CRITICAL";
    else if (totalScore >= 60) level = "HIGH";
    else if (totalScore >= 35) level = "MEDIUM";
    
    return {
      score: totalScore,
      level,
      breakdown: {
        history: historyScore,
        signals: signalsScore,
        identity: identityScore,
        infrastructure: infraScore,
      }
    };
  }

  /**
   * Retrieves full intelligence dossier for a recruiter
   */
  async getRecruiterIntelligence(profileId: string) {
    const profile = await RecruiterProfile.findById(profileId)
      .populate('linkedInvestigationIds', 'investigationId state finalDecision createdAt')
      .populate('linkedCampaignIds', 'campaignId name riskLevel')
      .lean();
      
    if (!profile) return null;
    
    const riskResult = this.computeRecruiterRisk(profile as any);
    
    return {
      profile,
      riskAnalysis: riskResult
    };
  }
}

export default new RecruiterProfileService();
