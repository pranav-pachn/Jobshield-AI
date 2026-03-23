const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Scam Network schema matching the TypeScript model
const ScamNetworkSchema = new mongoose.Schema({
  networkId: { type: String, required: true, unique: true, index: true },
  entitiesInvolved: [{
    type: { type: String, enum: ["email", "domain", "wallet", "phone"], required: true },
    value: { type: String, required: true, index: true },
    confidence: { type: Number, min: 0, max: 100, default: 100 }
  }],
  correlationType: { type: String, enum: ["shared_email_domain", "shared_wallet", "shared_phone", "textual_similarity", "shared_email_exact"], required: true, index: true },
  confidence: { type: Number, min: 0, max: 100, required: true },
  linkedJobAnalysisIds: { type: [String], index: true, default: [] },
  linkedJobReportIds: { type: [String], sparse: true, default: [] },
  totalReportsLinked: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  lastUpdated: { type: Date, default: Date.now, index: -1 },
  metadata: {
    correlationDetails: String,
    highestRiskLevel: { type: String, enum: ["high", "medium", "low"], sparse: true },
    averageRiskScore: { type: Number, min: 0, max: 100, sparse: true }
  }
});

// Job Analysis schema
const JobAnalysisSchema = new mongoose.Schema({}, {strict: false});

const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);
const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema);

async function fixNetworkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a recent job analysis ID as string
    const testAnalysis = await JobAnalysis.findOne().sort({ createdAt: -1 });
    if (!testAnalysis) {
      console.log('❌ No job analyses found');
      return;
    }

    const analysisIdString = testAnalysis._id.toString();
    console.log(`📋 Using analysis ID: ${analysisIdString}`);

    // Clear existing networks
    await ScamNetwork.deleteMany({});
    console.log('🗑️ Cleared existing scam networks');

    // Create sample networks with correct string IDs
    const sampleNetworks = [
      {
        networkId: "network_001",
        correlationType: "shared_email_exact",
        confidence: 95,
        entitiesInvolved: [
          { type: "email", value: "recruiter@scam-domain.com", confidence: 95 },
          { type: "domain", value: "scam-domain.com", confidence: 90 }
        ],
        linkedJobAnalysisIds: [analysisIdString],
        totalReportsLinked: 1
      },
      {
        networkId: "network_002", 
        correlationType: "shared_wallet",
        confidence: 88,
        entitiesInvolved: [
          { type: "wallet", value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", confidence: 88 },
          { type: "email", value: "crypto-recruiter@fake-job.com", confidence: 85 }
        ],
        linkedJobAnalysisIds: [analysisIdString],
        totalReportsLinked: 1
      },
      {
        networkId: "network_003",
        correlationType: "shared_phone",
        confidence: 92,
        entitiesInvolved: [
          { type: "phone", value: "+1-555-0123", confidence: 92 },
          { type: "domain", value: "quick-jobs.net", confidence: 87 }
        ],
        linkedJobAnalysisIds: [analysisIdString],
        totalReportsLinked: 1
      },
      {
        networkId: "network_004",
        correlationType: "textual_similarity",
        confidence: 85,
        entitiesInvolved: [
          { type: "domain", value: "urgent-hiring.com", confidence: 80 },
          { type: "email", value: "hr@urgent-hiring.com", confidence: 85 }
        ],
        linkedJobAnalysisIds: [analysisIdString],
        totalReportsLinked: 1
      }
    ];

    // Insert sample networks
    const inserted = await ScamNetwork.insertMany(sampleNetworks);
    console.log(`✅ Inserted ${inserted.length} sample scam networks`);

    // Verify the networks
    const networks = await ScamNetwork.find({ linkedJobAnalysisIds: analysisIdString });
    console.log(`📊 Found ${networks.length} networks linked to analysis ${analysisIdString}`);

    networks.forEach(network => {
      console.log(`  - ${network.networkId}: ${network.correlationType} (confidence: ${network.confidence}%)`);
      console.log(`    Entities: ${network.entitiesInvolved.map(e => `${e.type}:${e.value}`).join(', ')}`);
    });

    console.log('\n🎉 Network data fixed successfully!');

  } catch (error) {
    console.error('💥 Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  fixNetworkData();
}

module.exports = { fixNetworkData };
