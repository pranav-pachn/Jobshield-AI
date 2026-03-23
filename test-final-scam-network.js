const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to the correct database
mongoose.connect('mongodb://localhost:27017/jobshield_ai')
  .then(() => console.log('✅ Connected to jobshield_ai database'))
  .catch(err => console.error('❌ Database connection failed:', err));

// Scam Network Graph endpoint
app.get('/api/scam-networks/:jobAnalysisId', async (req, res) => {
  try {
    const { jobAnalysisId } = req.params;
    console.log(`🔍 Testing scam network graph for: ${jobAnalysisId}`);

    const db = mongoose.connection.db;
    
    // Get the main analysis
    const { ObjectId } = mongoose.Types;
    let analysisId = jobAnalysisId;
    
    // Try to convert to ObjectId if it looks like one
    if (jobAnalysisId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        analysisId = new ObjectId(jobAnalysisId);
      } catch (e) {
        // Keep as string if conversion fails
      }
    }
    
    console.log(`🔍 Looking for analysis with ID: ${analysisId} (type: ${typeof analysisId})`);
    
    const mainAnalysis = await db.collection('jobanalyses').findOne({ _id: analysisId });
    if (!mainAnalysis) {
      console.log(`❌ Analysis not found. Trying string search...`);
      const mainAnalysisStr = await db.collection('jobanalyses').findOne({ _id: jobAnalysisId });
      if (!mainAnalysisStr) {
        console.log(`❌ Analysis still not found. Available IDs:`);
        const samples = await db.collection('jobanalyses').find({}).limit(3).toArray();
        samples.forEach(a => console.log(`  - ${a._id} (${typeof a._id})`));
        return res.json({
          nodes: [{
            id: jobAnalysisId,
            data: {
              label: "Job Analysis (Not Found)",
              nodeType: "analysis",
              threat: "low",
              details: "Analysis not found"
            },
            position: { x: 0, y: 0 }
          }],
          edges: [],
          metadata: { totalNetworks: 0, totalLinkedAnalyses: 0, correlationTypes: [] },
          summary: { nodeCount: 1, edgeCount: 0, uniqueEntities: 0, correlationSources: [], highestConfidence: 0, averageConfidence: 0 }
        });
      } else {
        console.log(`✅ Found with string search!`);
        // Update networks to use string ID
        await db.collection('scamnetworks').updateMany(
          {},
          { $set: { linkedJobAnalysisIds: [jobAnalysisId] } }
        );
      }
    }

    // Get networks for this analysis
    const networks = await db.collection('scamnetworks').find({
      linkedJobAnalysisIds: jobAnalysisId,
    }).toArray();

    console.log(`📊 Found ${networks.length} networks`);

    // Create graph structure
    const nodes = [];
    const edges = [];

    // Add main analysis node
    nodes.push({
      id: jobAnalysisId,
      data: {
        label: "Job Analysis (Main)",
        nodeType: "analysis",
        threat: mainAnalysis.risk_level?.toLowerCase() || "low",
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
    const correlationTypeSet = new Set();
    
    networks.forEach((network, networkIndex) => {
      correlationTypeSet.add(network.correlationType);
      
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
          id: `edge_${jobAnalysisId}_${nodeId}_${networkIndex}`,
          source: jobAnalysisId,
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
        correlationTypes: Array.from(correlationTypeSet)
      },
      summary: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        uniqueEntities: nodes.length - 1,
        correlationSources: Array.from(correlationTypeSet),
        highestConfidence: networks.length > 0 ? Math.max(...networks.map(n => n.confidence)) : 0,
        averageConfidence: networks.length > 0 ? Math.round(networks.reduce((sum, n) => sum + n.confidence, 0) / networks.length) : 0
      }
    };

    console.log(`🎉 SUCCESS! Generated graph with ${result.nodes.length} nodes and ${result.edges.length} edges`);
    console.log(`🔗 Correlation types: ${result.metadata.correlationTypes.join(', ')}`);

    return res.json(result);

  } catch (error) {
    console.error('💥 Error:', error);
    return res.status(500).json({
      message: "Failed to fetch network graph",
      error: error.message
    });
  }
});

const PORT = 4001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/scam-networks/69c015d90728f5c867987e22`);
});
