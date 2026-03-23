const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Schemas
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

const JobAnalysisSchema = new mongoose.Schema({}, {strict: false});

const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);
const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema);

async function updateNetworkLinks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a specific job analysis ID to test with
    const testAnalysis = await JobAnalysis.findOne().sort({ createdAt: -1 });
    if (!testAnalysis) {
      console.log('❌ No job analyses found');
      return;
    }

    console.log(`📋 Using analysis ID: ${testAnalysis._id}`);

    // Update all scam networks to include this analysis
    const result = await ScamNetwork.updateMany(
      {},
      { 
        $addToSet: { linkedJobAnalysisIds: testAnalysis._id },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} scam networks`);

    // Verify the updates
    const networks = await ScamNetwork.find({ linkedJobAnalysisIds: testAnalysis._id });
    console.log(`📊 Found ${networks.length} networks linked to analysis ${testAnalysis._id}`);

    networks.forEach(network => {
      console.log(`  - ${network.networkId}: ${network.correlationType} (confidence: ${network.confidence})`);
      console.log(`    Entities: ${network.entitiesInvolved.map(e => `${e.type}:${e.value}`).join(', ')}`);
    });

    console.log('\n🎉 Network links updated successfully!');

  } catch (error) {
    console.error('💥 Update failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  updateNetworkLinks();
}

module.exports = { updateNetworkLinks };
