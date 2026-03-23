const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Scam Network schema
const ScamNetworkSchema = new mongoose.Schema({
  networkId: { type: String, required: true, unique: true },
  correlationType: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  entitiesInvolved: [{
    type: { type: String, required: true, enum: ['domain', 'email', 'wallet', 'phone'] },
    value: { type: String, required: true },
    confidence: { type: Number, required: true }
  }],
  linkedJobAnalysisIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobAnalysis' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);

// Sample scam network data
const sampleNetworks = [
  {
    networkId: "network_001",
    correlationType: "shared_email_exact",
    confidence: 0.95,
    entitiesInvolved: [
      { type: "email", value: "recruiter@scam-domain.com", confidence: 0.95 },
      { type: "domain", value: "scam-domain.com", confidence: 0.90 }
    ],
    linkedJobAnalysisIds: [] // Will be populated with actual analysis IDs
  },
  {
    networkId: "network_002", 
    correlationType: "shared_wallet",
    confidence: 0.88,
    entitiesInvolved: [
      { type: "wallet", value: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", confidence: 0.88 },
      { type: "email", value: "crypto-recruiter@fake-job.com", confidence: 0.85 }
    ],
    linkedJobAnalysisIds: []
  },
  {
    networkId: "network_003",
    correlationType: "shared_phone",
    confidence: 0.92,
    entitiesInvolved: [
      { type: "phone", value: "+1-555-0123", confidence: 0.92 },
      { type: "domain", value: "quick-jobs.net", confidence: 0.87 }
    ],
    linkedJobAnalysisIds: []
  },
  {
    networkId: "network_004",
    correlationType: "textual_similarity",
    confidence: 0.85,
    entitiesInvolved: [
      { type: "domain", value: "urgent-hiring.com", confidence: 0.80 },
      { type: "email", value: "hr@urgent-hiring.com", confidence: 0.85 }
    ],
    linkedJobAnalysisIds: []
  }
];

async function createScamNetworks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get recent job analysis IDs to link with networks
    const JobAnalysis = mongoose.model('JobAnalysis', new mongoose.Schema({}, {strict: false}));
    const recentAnalyses = await JobAnalysis.find().sort({ createdAt: -1 }).limit(10);
    
    console.log(`📋 Found ${recentAnalyses.length} recent job analyses`);

    // Clear existing scam networks
    await ScamNetwork.deleteMany({});
    console.log('🗑️ Cleared existing scam networks');

    // Link networks to job analyses
    sampleNetworks.forEach((network, index) => {
      // Link each network to 2-3 random job analyses
      const numLinks = Math.min(3, recentAnalyses.length);
      const linkedAnalyses = [];
      for (let i = 0; i < numLinks; i++) {
        const analysisIndex = (index + i) % recentAnalyses.length;
        linkedAnalyses.push(recentAnalyses[analysisIndex]._id);
      }
      network.linkedJobAnalysisIds = linkedAnalyses;
    });

    // Insert sample networks
    const inserted = await ScamNetwork.insertMany(sampleNetworks);
    console.log(`✅ Inserted ${inserted.length} sample scam networks`);

    // Show summary
    console.log('\n📊 Network Summary:');
    inserted.forEach(network => {
      console.log(`  ${network.networkId}: ${network.correlationType} (${network.linkedJobAnalysisIds.length} analyses)`);
    });

    console.log('\n🎉 Scam network data creation complete!');

  } catch (error) {
    console.error('💥 Creation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  createScamNetworks();
}

module.exports = { createScamNetworks };
