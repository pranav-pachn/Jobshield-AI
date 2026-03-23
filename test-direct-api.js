const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jobshield_ai";

// Schemas
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

const JobAnalysisSchema = new mongoose.Schema({}, {strict: false});

const ScamNetwork = mongoose.model('ScamNetwork', ScamNetworkSchema);
const JobAnalysis = mongoose.model('JobAnalysis', JobAnalysisSchema);

async function testDirectAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const analysisId = "69c0167ca100c9637909ed50";
    console.log(`🧪 Testing direct API for analysis ID: ${analysisId}`);

    // Get the main analysis
    const mainAnalysis = await JobAnalysis.findById(analysisId);
    if (!mainAnalysis) {
      console.log('❌ Main analysis not found');
      return;
    }
    console.log(`✅ Found main analysis: ${mainAnalysis.risk_level} risk`);

    // Get networks for this analysis
    const networks = await ScamNetwork.find({
      linkedJobAnalysisIds: analysisId,
    });
    console.log(`✅ Found ${networks.length} networks`);

    if (networks.length === 0) {
      console.log('❌ No networks found, returning empty graph');
      return;
    }

    // Create a simple graph structure
    const nodes = [];
    const edges = [];

    // Add main analysis node
    nodes.push({
      id: analysisId,
      data: {
        label: "Job Analysis (Main)",
        nodeType: "analysis",
        threat: mainAnalysis.risk_level.toLowerCase(),
        riskScore: mainAnalysis.scam_probability,
        details: `Risk: ${mainAnalysis.risk_level}, Score: ${mainAnalysis.scam_probability}%`,
        connections: networks.length,
        isMainNode: true
      },
      position: { x: 400, y: -200 },
      style: {
        background: "#064e3b",
        border: `2px solid ${mainAnalysis.risk_level === 'High' ? '#ef4444' : mainAnalysis.risk_level === 'Medium' ? '#f59e0b' : '#10b981'}`,
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        color: "#a7f3d0",
        fontWeight: "bold",
        minWidth: "120px",
        textAlign: "center"
      },
      className: "main-node"
    });

    // Add entity nodes and edges
    let nodeCounter = 0;
    networks.forEach((network, networkIndex) => {
      network.entitiesInvolved.forEach((entity) => {
        const nodeId = `entity_${entity.type}_${entity.value.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        // Add entity node
        nodes.push({
          id: nodeId,
          data: {
            label: entity.value.length > 20 ? entity.value.substring(0, 17) + "..." : entity.value,
            nodeType: "entity",
            entityType: entity.type,
            threat: entity.confidence > 80 ? "high" : entity.confidence > 50 ? "medium" : "low",
            details: entity.value,
            confidence: entity.confidence
          },
          position: { 
            x: 200 + (nodeCounter % 3) * 200, 
            y: 100 + Math.floor(nodeCounter / 3) * 150 
          },
          style: {
            background: entity.type === 'domain' ? '#7f1d1d' : entity.type === 'email' ? '#4c1d95' : entity.type === 'wallet' ? '#92400e' : '#1e3a8a',
            border: entity.type === 'domain' ? '#ef4444' : entity.type === 'email' ? '#a78bfa' : entity.type === 'wallet' ? '#f59e0b' : '#3b82f6',
            borderRadius: "6px",
            padding: "8px",
            fontSize: "11px",
            color: entity.type === 'domain' ? '#fca5a5' : entity.type === 'email' ? '#ddd6fe' : entity.type === 'wallet' ? '#fde68a' : '#93c5fd',
            minWidth: "100px",
            textAlign: "center"
          }
        });

        // Add edge from analysis to entity
        edges.push({
          id: `edge_${analysisId}_${nodeId}_${networkIndex}`,
          source: analysisId,
          target: nodeId,
          animated: true,
          label: `${network.correlationType} (${network.confidence}%)`,
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2,
            opacity: 0.8
          },
          markerEnd: {
            type: "arrowclosed",
            color: '#3b82f6'
          },
          data: {
            correlationType: network.correlationType,
            confidence: network.confidence,
            riskLevel: network.confidence > 80 ? "high" : network.confidence > 50 ? "medium" : "low"
          }
        });

        nodeCounter++;
      });
    });

    const result = {
      nodes,
      edges,
      metadata: {
        totalNetworks: networks.length,
        totalLinkedAnalyses: 1,
        correlationTypes: [...new Set(networks.map(n => n.correlationType))]
      }
    };

    console.log(`📊 Generated graph with ${result.nodes.length} nodes and ${result.edges.length} edges`);
    console.log(`🔗 Correlation types: ${result.metadata.correlationTypes.join(', ')}`);

    // Return the result as JSON
    console.log('\n📤 API Response:');
    console.log(JSON.stringify(result, null, 2));

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
  testDirectAPI();
}

module.exports = { testDirectAPI };
