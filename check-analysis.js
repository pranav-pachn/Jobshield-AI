const mongoose = require('mongoose');

async function checkAnalysis() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobshield_ai');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const analysisId = '69c015d90728f5c867987e22';
    
    const analysis = await db.collection('jobanalyses').findOne({ _id: analysisId });
    console.log('📋 Analysis found:', !!analysis);
    
    if (analysis) {
      console.log('📋 Analysis details:', {
        id: analysis._id,
        risk_level: analysis.risk_level,
        scam_probability: analysis.scam_probability
      });
    } else {
      console.log('📋 Available analyses:');
      const analyses = await db.collection('jobanalyses').find({}).limit(5).toArray();
      analyses.forEach(a => console.log(`  - ${a._id}: ${a.risk_level}`));
    }
    
    mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkAnalysis();
