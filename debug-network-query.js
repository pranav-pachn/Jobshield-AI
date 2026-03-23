const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Scam Network schema
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

async function debugNetworkQuery() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const analysisId = "69c0167ca100c9637909ed50";
    console.log(`🔍 Debugging network query for analysis ID: ${analysisId}`);

    // 1. Check if analysis exists
    const analysis = await JobAnalysis.findById(analysisId);
    console.log(`📋 Analysis exists: ${!!analysis}`);
    if (analysis) {
      console.log(`📋 Analysis details:`, {
        id: analysis._id,
        scam_probability: analysis.scam_probability,
        risk_level: analysis.risk_level
      });
    }

    // 2. Check all networks
    const allNetworks = await ScamNetwork.find({});
    console.log(`📊 Total networks in DB: ${allNetworks.length}`);
    allNetworks.forEach(network => {
      console.log(`  - ${network.networkId}: linkedJobAnalysisIds = [${network.linkedJobAnalysisIds.join(', ')}]`);
    });

    // 3. Check networks linked to this analysis
    const linkedNetworks = await ScamNetwork.find({
      linkedJobAnalysisIds: analysisId
    });
    console.log(`🔗 Networks linked to analysis: ${linkedNetworks.length}`);
    linkedNetworks.forEach(network => {
      console.log(`  - ${network.networkId}: ${network.correlationType}`);
    });

    // 4. Try the exact query from the data mapper
    const networks = await ScamNetwork.find({
      linkedJobAnalysisIds: analysisId,
    });
    console.log(`🎯 Exact query result: ${networks.length} networks`);

    // 5. Check if the analysis ID is stored as string or ObjectId
    const networksAsString = await ScamNetwork.find({
      linkedJobAnalysisIds: { $in: [analysisId] }
    });
    console.log(`🔍 String query result: ${networksAsString.length} networks`);

    // 6. Check the actual data types
    if (allNetworks.length > 0) {
      const sampleNetwork = allNetworks[0];
      console.log(`🔍 Sample network linkedJobAnalysisIds type:`, typeof sampleNetwork.linkedJobAnalysisIds[0]);
      console.log(`🔍 Sample network linkedJobAnalysisIds value:`, sampleNetwork.linkedJobAnalysisIds[0]);
      console.log(`🔍 Analysis ID type:`, typeof analysisId);
      console.log(`🔍 Analysis ID value:`, analysisId);
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  debugNetworkQuery();
}

module.exports = { debugNetworkQuery };
