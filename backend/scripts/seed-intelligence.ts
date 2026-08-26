import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from '../src/config/env';
import { Investigation } from '../src/models/Investigation';
import { JobAnalysis } from '../src/models/JobAnalysis';
import ScamEntity from '../src/models/ScamEntity';
import { RecruiterProfile } from '../src/models/RecruiterProfile';
import { ThreatCampaign } from '../src/models/ThreatCampaign';
import { ThreatIndicator, ThreatType, ThreatRiskLevel, ThreatSource } from '../src/models/ThreatIndicator';

const seedDataPath = path.join(__dirname, '../datasets/intelligence_seed.json');

async function seedDatabase() {
  console.log('Connecting to database...');
  await mongoose.connect(env.mongoUri);
  console.log('Connected.');

  console.log('Reading seed data...');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

  // Idempotency: clear existing seed data
  // We identify seed data by checking if it's in our seed list. 
  // Let's clear based on the known IDs.
  const seedInvIds = seedData.map((d: any) => d.id);
  const seedCampaigns = Array.from(new Set(seedData.map((d: any) => d.campaign).filter(Boolean)));

  console.log('Cleaning up old seed data...');
  await Investigation.deleteMany({ investigationId: { $in: seedInvIds } });
  await JobAnalysis.deleteMany({ text_hash: { $in: seedInvIds } }); // using id as hash for simplicity
  await ThreatCampaign.deleteMany({ campaignId: { $in: seedCampaigns } });
  // Recruiter profiles linked to these investigations will be deleted
  await RecruiterProfile.deleteMany({ "emails": { $in: seedData.map((d:any) => d.email).filter(Boolean) } });
  
  // Actually let's just clear all ThreatCampaigns and RecruiterProfiles for a clean state in dev
  // if this is a dedicated seed script. But to be safe, only delete matching emails.

  console.log('Creating campaigns...');
  const campaignMap = new Map();
  for (const campaignId of seedCampaigns) {
    const campaign = new ThreatCampaign({
      campaignId: campaignId as string,
      name: `Synthetic ${campaignId}`,
      status: 'ACTIVE',
      riskLevel: 'HIGH',
      confidence: 95,
      linkedInvestigationIds: [],
      linkedRecruiterProfileIds: [],
      sharedSignals: [],
      sharedDomains: [],
      sharedEmails: [],
      sharedPhones: [],
      firstObserved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastObserved: new Date(),
      metadata: { detectionMethod: 'automatic', correlationDetails: { seed: true } }
    });
    await campaign.save();
    campaignMap.set(campaignId, campaign);
  }

  console.log('Processing investigations...');
  const recruiterMap = new Map(); // key: email -> profile

  for (const data of seedData) {
    // Find or create RecruiterProfile
    let profile = recruiterMap.get(data.email);
    if (!profile) {
      profile = new RecruiterProfile({
        emails: [data.email],
        domains: [data.emailDomain],
        phones: [data.phone],
        names: [data.recruiterName],
        companies: [data.company],
        riskScore: data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' ? 85 : 10,
        riskLevel: data.riskLevel,
        totalInvestigations: 0,
        suspiciousCount: 0,
        confirmedScamCount: 0,
        legitimateCount: 0,
        signals: [],
        linkedInvestigationIds: [],
        linkedCampaignIds: [],
      });
      recruiterMap.set(data.email, profile);
    }

    profile.totalInvestigations += 1;
    if (data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL') {
      profile.suspiciousCount += 1;
      profile.confirmedScamCount += 1;
    } else {
      profile.legitimateCount += 1;
    }

    // Add signals
    for (const signal of data.signals) {
      const existing = profile.signals.find((s: any) => s.signal === signal);
      if (existing) {
        existing.count += 1;
      } else {
        profile.signals.push({ signal, count: 1, firstSeen: new Date() });
      }
    }

    await profile.save();

    // Create JobAnalysis
    let riskLevelTitleCase = data.riskLevel.charAt(0) + data.riskLevel.slice(1).toLowerCase();
    if (riskLevelTitleCase === 'Critical') {
      riskLevelTitleCase = 'High';
    }
    
    const analysis = new JobAnalysis({
      text_hash: data.id,
      job_text: data.jobText,
      scam_probability: data.scam_probability,
      risk_level: riskLevelTitleCase,
      confidence: 0.9,
      suspicious_phrases: data.signals,
      reasons: ['Synthetic seed data'],
    });
    await analysis.save();

    // Create Investigation
    const inv = new Investigation({
      investigationId: data.id,
      state: 'COMPLETED',
      input: {
        jobText: data.jobText,
        recruiterName: data.recruiterName,
        email: data.email,
        emailDomain: data.emailDomain,
        company: data.company,
        phone: data.phone,
      },
      agentTraces: [],
      finalDecision: {
        riskLevel: data.riskLevel,
        scamProbability: data.scam_probability,
      },
      linkedCampaignIds: data.campaign ? [campaignMap.get(data.campaign)._id] : [],
      recruiterProfileId: profile._id,
      createdAt: new Date(),
      completedAt: new Date(),
    });
    await inv.save();

    // Link investigation to profile
    profile.linkedInvestigationIds.push(inv._id);
    if (data.campaign && !profile.linkedCampaignIds.includes(campaignMap.get(data.campaign)._id)) {
      profile.linkedCampaignIds.push(campaignMap.get(data.campaign)._id);
    }
    await profile.save();

    // Update Campaign
    if (data.campaign) {
      const campaign = campaignMap.get(data.campaign);
      campaign.linkedInvestigationIds.push(inv._id);
      if (!campaign.linkedRecruiterProfileIds.includes(profile._id)) {
        campaign.linkedRecruiterProfileIds.push(profile._id);
      }
      if (!campaign.sharedDomains.includes(data.emailDomain)) {
        campaign.sharedDomains.push(data.emailDomain);
      }
      if (!campaign.sharedEmails.includes(data.email)) {
        campaign.sharedEmails.push(data.email);
      }
      if (!campaign.sharedPhones.includes(data.phone)) {
        campaign.sharedPhones.push(data.phone);
      }
      for (const signal of data.signals) {
        if (!campaign.sharedSignals.includes(signal)) {
          campaign.sharedSignals.push(signal);
        }
      }
      await campaign.save();
    }

    // Create ScamEntity
    const entity = new ScamEntity({
      jobAnalysisId: analysis._id.toString(),
      recruiterProfileId: profile._id.toString(),
      emails: [data.email],
      domains: [data.emailDomain],
      wallets: [],
      phoneNumbers: [data.phone],
      recruiterNames: [data.recruiterName],
    });
    await entity.save();
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
