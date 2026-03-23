const mongoose = require('mongoose');

async function updateNetworksFinal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const analysisId = '69c0167ca100c9637909ed50';
    console.log(`📝 Updating networks to link to analysis: ${analysisId}`);
    
    const result = await db.collection('scamnetworks').updateMany(
      {},
      { $set: { linkedJobAnalysisIds: [analysisId] } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} networks`);
    
    // Verify
    const networks = await db.collection('scamnetworks').find({
      linkedJobAnalysisIds: analysisId
    }).toArray();
    
    console.log(`📊 Found ${networks.length} linked networks`);
    networks.forEach(n => console.log(`  - ${n.networkId}: ${n.correlationType}`));
    
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Update failed:', error.message);
  }
}

updateNetworksFinal();
