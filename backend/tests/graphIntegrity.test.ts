import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Investigation } from '../src/models/Investigation';
import { RecruiterProfile } from '../src/models/RecruiterProfile';
import { ThreatCampaign } from '../src/models/ThreatCampaign';

describe('Graph Integrity Tests', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('Investigation <-> RecruiterProfile bidirectional linking', async () => {
    const investigations = await Investigation.find({ recruiterProfileId: { $exists: true } });
    expect(investigations.length).toBeGreaterThan(0);

    for (const inv of investigations) {
      if (inv.recruiterProfileId) {
        const profile = await RecruiterProfile.findById(inv.recruiterProfileId);
        expect(profile).toBeDefined();
        
        // Use string representation of object ids for comparison
        const linkedInvIds = profile!.linkedInvestigationIds.map(id => id.toString());
        expect(linkedInvIds).toContain(inv._id.toString());
      }
    }
  });

  it('Investigation <-> Campaign bidirectional linking', async () => {
    const investigations = await Investigation.find({ linkedCampaignIds: { $exists: true, $not: { $size: 0 } } });
    expect(investigations.length).toBeGreaterThan(0);

    for (const inv of investigations) {
      for (const campId of inv.linkedCampaignIds!) {
        const campaign = await ThreatCampaign.findById(campId);
        expect(campaign).toBeDefined();
        
        const linkedInvIds = campaign!.linkedInvestigationIds.map(id => id.toString());
        expect(linkedInvIds).toContain(inv._id.toString());
      }
    }
  });

  it('RecruiterProfile <-> Campaign bidirectional linking', async () => {
    const profiles = await RecruiterProfile.find({ linkedCampaignIds: { $exists: true, $not: { $size: 0 } } });
    expect(profiles.length).toBeGreaterThan(0);

    for (const profile of profiles) {
      for (const campId of profile.linkedCampaignIds) {
        const campaign = await ThreatCampaign.findById(campId);
        expect(campaign).toBeDefined();
        
        const linkedProfIds = campaign!.linkedRecruiterProfileIds.map(id => id.toString());
        expect(linkedProfIds).toContain(profile._id.toString());
      }
    }
  });
  
  it('No duplicate relationships', async () => {
     // Check for duplicate investigation IDs in a profile
     const profiles = await RecruiterProfile.find();
     for(const profile of profiles) {
         const ids = profile.linkedInvestigationIds.map(id => id.toString());
         const uniqueIds = new Set(ids);
         expect(ids.length).toBe(uniqueIds.size);
     }
     
     // Check for duplicate campaign IDs in a profile
     for(const profile of profiles) {
         const ids = profile.linkedCampaignIds.map(id => id.toString());
         const uniqueIds = new Set(ids);
         expect(ids.length).toBe(uniqueIds.size);
     }
     
     // Check for duplicate investigation IDs in a campaign
     const campaigns = await ThreatCampaign.find();
     for(const campaign of campaigns) {
         const ids = campaign.linkedInvestigationIds.map(id => id.toString());
         const uniqueIds = new Set(ids);
         expect(ids.length).toBe(uniqueIds.size);
     }
  });
});
