const mongoose = require('mongoose');

// Sample job analysis data for testing
const sampleData = [
  {
    job_text: "Earn $5000 weekly working from home. No experience needed. Pay small registration fee.",
    scam_probability: 0.88,
    risk_level: "High",
    suspicious_phrases: ["earn $5000 weekly", "no experience needed", "registration fee"],
    reasons: ["unrealistic salary claim", "suspiciously low requirements", "payment requested"],
    ai_latency_ms: 45,
    created_at: new Date('2026-03-14T10:00:00Z')
  },
  {
    job_text: "Urgent hiring for data entry position. Start immediately. No interview required.",
    scam_probability: 0.75,
    risk_level: "High",
    suspicious_phrases: ["urgent hiring", "no interview required"],
    reasons: ["high pressure tactics", "no screening process"],
    ai_latency_ms: 38,
    created_at: new Date('2026-03-14T11:00:00Z')
  },
  {
    job_text: "Work from home customer service role. $15/hour. Requires high school diploma.",
    scam_probability: 0.25,
    risk_level: "Low",
    suspicious_phrases: [],
    reasons: ["normal salary range", "reasonable requirements"],
    ai_latency_ms: 32,
    created_at: new Date('2026-03-13T14:00:00Z')
  },
  {
    job_text: "Telegram recruiter needed for crypto project. Earn $1000 daily. Investment required.",
    scam_probability: 0.92,
    risk_level: "High",
    suspicious_phrases: ["telegram recruiter", "earn $1000 daily", "investment required"],
    reasons: ["suspicious platform", "unrealistic earnings", "payment requested upfront"],
    ai_latency_ms: 41,
    created_at: new Date('2026-03-13T09:00:00Z')
  },
  {
    job_text: "Part-time social media manager. Flexible hours. $20/hour. Experience preferred.",
    scam_probability: 0.15,
    risk_level: "Low",
    suspicious_phrases: [],
    reasons: ["reasonable compensation", "normal requirements"],
    ai_latency_ms: 35,
    created_at: new Date('2026-03-12T16:00:00Z')
  },
  {
    job_text: "Quick money online surveys. Earn $50 per survey. Pay access fee.",
    scam_probability: 0.68,
    risk_level: "Medium",
    suspicious_phrases: ["quick money", "earn $50 per survey", "access fee"],
    reasons: ["unrealistic survey pay", "payment required for access"],
    ai_latency_ms: 39,
    created_at: new Date('2026-03-12T10:00:00Z')
  },
  {
    job_text: "Remote software developer position. Competitive salary. 3+ years experience required.",
    scam_probability: 0.12,
    risk_level: "Low",
    suspicious_phrases: [],
    reasons: ["professional requirements", "market rate compensation"],
    ai_latency_ms: 33,
    created_at: new Date('2026-03-11T13:00:00Z')
  },
  {
    job_text: "Become a mystery shopper. Free products. Pay registration fee to start.",
    scam_probability: 0.58,
    risk_level: "Medium",
    suspicious_phrases: ["mystery shopper", "registration fee"],
    reasons: ["payment required for job opportunity"],
    ai_latency_ms: 36,
    created_at: new Date('2026-03-11T08:00:00Z')
  },
  {
    job_text: "Work from home assembly jobs. Earn $2000 weekly. Buy starter kit.",
    scam_probability: 0.82,
    risk_level: "High",
    suspicious_phrases: ["earn $2000 weekly", "buy starter kit"],
    reasons: ["unrealistic earnings for assembly", "payment required for materials"],
    ai_latency_ms: 42,
    created_at: new Date('2026-03-10T15:00:00Z')
  },
  {
    job_text: "Freelance writing opportunities. $0.10 per word. Portfolio required.",
    scam_probability: 0.18,
    risk_level: "Low",
    suspicious_phrases: [],
    reasons: ["industry standard rates", "professional requirements"],
    ai_latency_ms: 34,
    created_at: new Date('2026-03-10T11:00:00Z')
  }
];

// Job Analysis schema (simplified version)
const JobAnalysisSchema = new mongoose.Schema({
  job_text: { type: String, required: true, trim: true },
  scam_probability: { type: Number, required: true, min: 0, max: 1 },
  risk_level: { type: String, required: true, enum: ["Low", "Medium", "High"] },
  suspicious_phrases: [{ type: String, trim: true }],
  reasons: [{ type: String, trim: true }],
  ai_latency_ms: { type: Number, min: 0 },
  created_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: "created_at", updatedAt: false } });

JobAnalysisSchema.index({ created_at: -1 });
JobAnalysisSchema.index({ risk_level: 1 });

const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema);

async function seedAnalyticsData() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await JobAnalysis.deleteMany({});
    console.log('🗑️ Cleared existing job analysis data');

    // Insert sample data
    const inserted = await JobAnalysis.insertMany(sampleData);
    console.log(`✅ Inserted ${inserted.length} sample job analyses`);

    // Show summary
    const summary = await JobAnalysis.aggregate([
      {
        $group: {
          _id: "$risk_level",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Risk Level Distribution:');
    summary.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\n🎉 Analytics data seeding complete!');

  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  seedAnalyticsData();
}

module.exports = { seedAnalyticsData };
