const mongoose = require('mongoose');

async function checkScamNetworksData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const scamNetworks = await db.collection('scamnetworks').find({}).toArray();
    console.log(`📊 Found ${scamNetworks.length} documents in scamnetworks collection:`);
    
    scamNetworks.forEach((doc, i) => {
      console.log(`\n${i + 1}. Network: ${doc.networkId}`);
      console.log(`   Correlation Type: ${doc.correlationType}`);
      console.log(`   Linked Job Analysis IDs: [${doc.linkedJobAnalysisIds?.join(', ') || 'None'}]`);
      console.log(`   Entities: ${doc.entitiesInvolved?.length || 0}`);
    });
    
    // Test the specific query
    const analysisId = '69c015d90728f5c867987e22';
    console.log(`\n🔍 Testing query for analysisId: ${analysisId}`);
    
    const queryResult = await db.collection('scamnetworks').find({
      linkedJobAnalysisIds: analysisId
    }).toArray();
    
    console.log(`📊 Query result: ${queryResult.length} documents`);
    queryResult.forEach(doc => {
      console.log(`   - ${doc.networkId}: ${doc.correlationType}`);
    });
    
    // Test alternative query
    console.log(`\n🔍 Testing alternative query (using $in):`);
    const altResult = await db.collection('scamnetworks').find({
      linkedJobAnalysisIds: { $in: [analysisId] }
    }).toArray();
    
    console.log(`📊 Alternative query result: ${altResult.length} documents`);
    altResult.forEach(doc => {
      console.log(`   - ${doc.networkId}: ${doc.correlationType}`);
    });
    
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkScamNetworksData();
