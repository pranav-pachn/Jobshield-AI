import mongoose from 'mongoose';
import { ThreatCampaign, IThreatCampaign } from '../models/ThreatCampaign';
import { RecruiterProfile } from '../models/RecruiterProfile';
import { Investigation } from '../models/Investigation';
import { logger } from '../utils/logger';

class CampaignDetectionService {
  
  /**
   * Main entry point after an investigation completes.
   * Deterministically finds matching entities and clusters into campaigns.
   */
  async detectCampaigns(investigationId: string | mongoose.Types.ObjectId): Promise<void> {
    try {
      const inv = await Investigation.findById(investigationId).populate('recruiterProfileId');
      if (!inv) return;
      
      const email = inv.input.email;
      const domain = inv.input.emailDomain;
      const phone = inv.input.phone;
      const signals = inv.finalDecision?.suspiciousPhrases || [];
      const profile = inv.recruiterProfileId as any; // populated RecruiterProfile
      
      if (!profile) return;
      
      // We look for existing campaigns that match strong deterministic rules
      const activeCampaigns = await ThreatCampaign.find({ status: 'ACTIVE' });
      
      let matchedCampaign: IThreatCampaign | null = null;
      let matchedConfidence = 0;
      let matchedDetails = {};
      
      for (const campaign of activeCampaigns) {
        const hasSameDomain = domain && campaign.sharedDomains.includes(domain);
        const hasSamePhone = phone && campaign.sharedPhones.includes(phone);
        const hasSameEmail = email && campaign.sharedEmails.includes(email);
        const hasSharedRecruiter = profile && campaign.linkedRecruiterProfileIds.some((id: any) => id.toString() === profile._id.toString());
        
        const sharedSignalsCount = signals.filter((s: string) => campaign.sharedSignals.includes(s)).length;
        
        // RULE A: Same domain + same phone + shared scam signal -> strong match
        if (hasSameDomain && hasSamePhone && sharedSignalsCount >= 1) {
          matchedCampaign = campaign;
          matchedConfidence = 95;
          matchedDetails = { rule: "Rule A", sharedDomains: 1, sharedPhones: 1, sharedSignals: sharedSignalsCount };
          break;
        }
        
        // RULE B: Same recruiter + same domain + same scam pattern -> strong match
        if (hasSharedRecruiter && hasSameDomain && sharedSignalsCount >= 1) {
          matchedCampaign = campaign;
          matchedConfidence = 90;
          matchedDetails = { rule: "Rule B", sharedRecruiters: 1, sharedDomains: 1, sharedSignals: sharedSignalsCount };
          break;
        }
        
        // RULE C: Same exact email + shared scam signal -> very strong match
        if (hasSameEmail && sharedSignalsCount >= 1) {
          matchedCampaign = campaign;
          matchedConfidence = 98;
          matchedDetails = { rule: "Rule C", sharedEmails: 1, sharedSignals: sharedSignalsCount };
          break;
        }
      }
      
      if (matchedCampaign) {
        // Merge into existing campaign
        logger.info(`Merging investigation ${investigationId} into campaign ${matchedCampaign.campaignId}`);
        await this.mergeIntoCampaign(matchedCampaign, inv, profile, matchedConfidence, matchedDetails);
      } else {
        // Check if we should CREATE a new campaign
        // Look for other investigations NOT in a campaign that match our strong rules
        const recentProfiles = await RecruiterProfile.find({
          _id: { $ne: profile._id },
          linkedCampaignIds: { $size: 0 }
        }).populate('linkedInvestigationIds');
        
        for (const otherProfile of recentProfiles) {
           const hasSameDomain = domain && otherProfile.domains.includes(domain);
           const hasSamePhone = phone && otherProfile.phones.includes(phone);
           const hasSameEmail = email && otherProfile.emails.includes(email);
           
           // Collect signals from other profile's investigations
           let otherSignals: string[] = [];
           otherProfile.linkedInvestigationIds.forEach((otherInv: any) => {
               if (otherInv.finalDecision?.suspiciousPhrases) {
                   otherSignals.push(...otherInv.finalDecision.suspiciousPhrases);
               }
           });
           const sharedSignalsCount = signals.filter((s: string) => otherSignals.includes(s)).length;
           
           if ((hasSameDomain && hasSamePhone && sharedSignalsCount >= 1) ||
               (hasSameEmail && sharedSignalsCount >= 1)) {
               
               // Found a cluster! Create new campaign
               const confidence = hasSameEmail ? 98 : 95;
               await this.createCampaign([inv, ...otherProfile.linkedInvestigationIds], [profile, otherProfile], confidence, {
                   rule: hasSameEmail ? "Rule C (Creation)" : "Rule A (Creation)",
                   sharedDomains: hasSameDomain ? 1 : 0,
                   sharedPhones: hasSamePhone ? 1 : 0,
                   sharedEmails: hasSameEmail ? 1 : 0,
                   sharedSignals: sharedSignalsCount
               });
               break;
           }
        }
      }
    } catch (error) {
      logger.error('Error detecting campaigns:', error);
    }
  }

  private async mergeIntoCampaign(campaign: IThreatCampaign, inv: any, profile: any, confidence: number, details: any) {
    if (!campaign.linkedInvestigationIds.includes(inv._id)) {
      campaign.linkedInvestigationIds.push(inv._id);
    }
    
    if (!campaign.linkedRecruiterProfileIds.includes(profile._id)) {
      campaign.linkedRecruiterProfileIds.push(profile._id);
    }
    
    if (inv.input.emailDomain && !campaign.sharedDomains.includes(inv.input.emailDomain)) {
      campaign.sharedDomains.push(inv.input.emailDomain);
    }
    if (inv.input.email && !campaign.sharedEmails.includes(inv.input.email)) {
      campaign.sharedEmails.push(inv.input.email);
    }
    if (inv.input.phone && !campaign.sharedPhones.includes(inv.input.phone)) {
      campaign.sharedPhones.push(inv.input.phone);
    }
    
    const signals = inv.finalDecision?.suspiciousPhrases || [];
    for (const signal of signals) {
      if (!campaign.sharedSignals.includes(signal)) {
        campaign.sharedSignals.push(signal);
      }
    }
    
    campaign.lastObserved = new Date();
    
    // Update confidence if new evidence is stronger
    if (confidence > campaign.confidence) {
      campaign.confidence = confidence;
      campaign.metadata = {
        ...campaign.metadata,
        correlationDetails: details
      };
    }
    
    await campaign.save();
    
    // Update Investigation
    inv.linkedCampaignIds = inv.linkedCampaignIds || [];
    if (!inv.linkedCampaignIds.includes(campaign._id)) {
      inv.linkedCampaignIds.push(campaign._id);
      await inv.save();
    }
    
    // Update Profile
    if (!profile.linkedCampaignIds.includes(campaign._id)) {
      profile.linkedCampaignIds.push(campaign._id);
      await profile.save();
    }
  }

  private async createCampaign(investigations: any[], profiles: any[], confidence: number, details: any) {
    // Generate sequential ID
    const count = await ThreatCampaign.countDocuments();
    const campaignId = `CAMPAIGN-${(count + 1).toString().padStart(4, '0')}`;
    
    logger.info(`Creating new campaign: ${campaignId}`);
    
    const campaign = new ThreatCampaign({
      campaignId,
      name: `Detected Campaign ${campaignId}`,
      status: 'ACTIVE',
      riskLevel: 'HIGH', // Assuming clustered threats are at least high
      confidence,
      linkedInvestigationIds: investigations.map(i => i._id),
      linkedRecruiterProfileIds: profiles.map(p => p._id),
      sharedSignals: [],
      sharedDomains: [],
      sharedEmails: [],
      sharedPhones: [],
      firstObserved: new Date(),
      lastObserved: new Date(),
      metadata: {
        detectionMethod: 'automatic',
        correlationDetails: details
      }
    });
    
    // Aggregate shared info
    for (const inv of investigations) {
      if (inv.input?.emailDomain && !campaign.sharedDomains.includes(inv.input.emailDomain)) {
        campaign.sharedDomains.push(inv.input.emailDomain);
      }
      if (inv.input?.email && !campaign.sharedEmails.includes(inv.input.email)) {
        campaign.sharedEmails.push(inv.input.email);
      }
      if (inv.input?.phone && !campaign.sharedPhones.includes(inv.input.phone)) {
        campaign.sharedPhones.push(inv.input.phone);
      }
      const signals = inv.finalDecision?.suspiciousPhrases || [];
      for (const signal of signals) {
        if (!campaign.sharedSignals.includes(signal)) {
          campaign.sharedSignals.push(signal);
        }
      }
    }
    
    await campaign.save();
    
    // Link back
    for (const inv of investigations) {
      inv.linkedCampaignIds = inv.linkedCampaignIds || [];
      if (!inv.linkedCampaignIds.includes(campaign._id)) {
        inv.linkedCampaignIds.push(campaign._id);
        await inv.save();
      }
    }
    
    for (const profile of profiles) {
      if (!profile.linkedCampaignIds.includes(campaign._id)) {
        profile.linkedCampaignIds.push(campaign._id);
        await profile.save();
      }
    }
    
    return campaign;
  }
}

export default new CampaignDetectionService();
