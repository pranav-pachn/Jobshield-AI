const mongoose = require('mongoose');

async function checkCollections() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:');
    collections.forEach(c => console.log(`  - ${c.name}`));
    
    const scamNetworks = await db.collection('scamnetworks').countDocuments();
    const scamNetworks2 = await db.collection('scam_networks').countDocuments();
    console.log(`📊 scamnetworks count: ${scamNetworks}`);
    console.log(`📊 scam_networks count: ${scamNetworks2}`);
    
    // Check if our data is in scam_networks
    if (scamNetworks2 > 0) {
      const sample = await db.collection('scam_networks').findOne();
      console.log('📋 Sample document from scam_networks:', sample);
    }
    
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkCollections();
