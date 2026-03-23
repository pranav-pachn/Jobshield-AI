const mongoose = require('mongoose');

// Define ScamNetwork schema
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

const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);

async function updateNetworkLink() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const analysisId = "69c015d90728f5c867987e22";
    console.log(`📝 Updating networks to link to analysis ID: ${analysisId}`);
    
    // Update all networks to link to this analysis
    const result = await ScamNetwork.updateMany(
      {},
      { $set: { linkedJobAnalysisIds: [analysisId] } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} networks`);
    
    // Verify the update
    const count = await ScamNetwork.countDocuments({ linkedJobAnalysisIds: analysisId });
    console.log(`📊 Networks linked: ${count}`);
    
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Update failed:', error.message);
  }
}

updateNetworkLink();
