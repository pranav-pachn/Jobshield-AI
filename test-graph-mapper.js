const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Import the actual network graph data mapper
const networkGraphDataMapper = require('./backend/dist/services/networkGraphDataMapper.js').default;

async function testGraphMapper() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const analysisId = "69c0167ca100c9637909ed50";
    console.log(`🧪 Testing graph mapper for analysis ID: ${analysisId}`);

    // Test the generateNetworkGraph function
    console.log('🔍 Testing generateNetworkGraph...');
    const graphData = await networkGraphDataMapper.generateNetworkGraph(analysisId);
    
    console.log(`📊 Graph Data Results:`);
    console.log(`  - Nodes: ${graphData.nodes.length}`);
    console.log(`  - Edges: ${graphData.edges.length}`);
    console.log(`  - Total Networks: ${graphData.metadata.totalNetworks}`);
    console.log(`  - Correlation Types: ${graphData.metadata.correlationTypes.join(', ')}`);

    // Log node details
    if (graphData.nodes.length > 0) {
      console.log('\n📍 Node Details:');
      graphData.nodes.forEach((node, index) => {
        console.log(`  ${index + 1}. ${node.id}: ${node.data.label} (${node.data.nodeType})`);
      });
    }

    // Log edge details
    if (graphData.edges.length > 0) {
      console.log('\n🔗 Edge Details:');
      graphData.edges.forEach((edge, index) => {
        console.log(`  ${index + 1}. ${edge.source} -> ${edge.target} (${edge.data.correlationType})`);
      });
    }

    // Test the getNetworkSummary function
    console.log('\n🔍 Testing getNetworkSummary...');
    const summary = await networkGraphDataMapper.getNetworkSummary(analysisId);
    
    console.log(`📊 Summary Results:`);
    console.log(`  - Node Count: ${summary.nodeCount}`);
    console.log(`  - Edge Count: ${summary.edgeCount}`);
    console.log(`  - Unique Entities: ${summary.uniqueEntities}`);
    console.log(`  - Average Confidence: ${summary.averageConfidence}%`);

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testGraphMapper();
}

module.exports = { testGraphMapper };
