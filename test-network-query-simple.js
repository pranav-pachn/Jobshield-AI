const mongoose = require('mongoose');

async function testNetworkQuery() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const ScamNetworkSchema = new mongoose.Schema({
      networkId: { type: String, required: true, unique: true },
      linkedJobAnalysisIds: [String],
      correlationType: String,
      confidence: Number,
      entitiesInvolved: Array
    });
    const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);

    const analysisId = '69c015d90728f5c867987e22';
    console.log(`🔍 Searching for networks linked to: ${analysisId}`);

    const networks = await ScamNetwork.find({ linkedJobAnalysisIds: analysisId });
    console.log(`📊 Found ${networks.length} networks`);
    
    networks.forEach(n => {
      console.log(`  - ${n.networkId}: ${n.correlationType} (${n.confidence}%)`);
      console.log(`    Linked IDs: [${n.linkedJobAnalysisIds.join(', ')}]`);
      console.log(`    Entities: ${n.entitiesInvolved.length}`);
    });

    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testNetworkQuery();
