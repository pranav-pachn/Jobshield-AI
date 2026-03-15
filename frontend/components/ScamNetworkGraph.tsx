'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Network, ChevronDown, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AnalysisResult {
  scam_probability: number;
  risk_level: 'High' | 'Medium' | 'Low';
  reasons: string[];
  suspicious_phrases: string[];
  ai_latency_ms: number;
}

type NodeType = 'job' | 'recruiter' | 'domain' | 'report';

interface GraphNodeData {
  label: string;
  nodeType: NodeType;
  threat?: 'high' | 'medium' | 'low';
  connections?: number;
  details?: string;
}

// ============================================================================
// NODE COLORS AND STYLING
// ============================================================================

const NODE_COLORS: Record<NodeType, { bg: string; border: string; text: string }> = {
  job: {
    bg: '#1e3a8a',
    border: '#3b82f6',
    text: '#93c5fd',
  },
  recruiter: {
    bg: '#4c1d95',
    border: '#a78bfa',
    text: '#ddd6fe',
  },
  domain: {
    bg: '#7f1d1d',
    border: '#ef4444',
    text: '#fca5a5',
  },
  report: {
    bg: '#78350f',
    border: '#f59e0b',
    text: '#fde68a',
  },
};

// ============================================================================
// CUSTOM NODE COMPONENT
// ============================================================================

interface CustomNodeProps {
  data: GraphNodeData;
  isConnecting?: boolean;
}

function CustomNode({ data, isConnecting }: CustomNodeProps) {
  const colors = NODE_COLORS[data.nodeType];
  const isJob = data.nodeType === 'job';
  const isDomain = data.nodeType === 'domain';
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Add pulse animation for high threat nodes
  useEffect(() => {
    if (data.threat === 'high') {
      const interval = setInterval(() => {
        setIsPulsing(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [data.threat]);

  const getGlowColor = () => {
    switch (data.threat) {
      case 'high': return 'rgba(239, 68, 68, 0.6)';
      case 'medium': return 'rgba(245, 158, 11, 0.4)';
      case 'low': return 'rgba(34, 197, 94, 0.3)';
      default: return 'rgba(59, 130, 246, 0.2)';
    }
  };

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-110 animated ${
        isPulsing ? 'animate-pulse-slow' : ''
      }`}
      style={{
        backgroundColor: colors.bg,
        borderColor: isHovered ? colors.text : colors.border,
        minWidth: isJob ? '120px' : '100px',
        boxShadow: isHovered ? `0 0 20px ${getGlowColor()}` : 'none',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} />

      {/* Icon and Label */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`}>
          {data.nodeType === 'job' && '📄'}
          {data.nodeType === 'recruiter' && '📧'}
          {data.nodeType === 'domain' && '🌐'}
          {data.nodeType === 'report' && '⚠️'}
        </span>
        <span className="text-xs font-bold transition-colors duration-300" style={{ 
          color: isHovered ? '#ffffff' : colors.text 
        }}>
          {data.nodeType === 'job' ? 'Job Post' : data.nodeType === 'recruiter' ? 'Recruiter' : data.nodeType === 'domain' ? 'Domain' : 'Report'}
        </span>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold transition-all duration-300" style={{ 
        color: isHovered ? '#ffffff' : colors.text 
      }} title={data.label}>
        {data.label.length > 18 ? data.label.slice(0, 15) + '...' : data.label}
      </p>

      {/* Details Row */}
      {data.connections !== undefined && (
        <div className="mt-2 pt-2 border-t transition-all duration-300" style={{ 
          borderColor: colors.border + '40',
          opacity: isHovered ? 1 : 0.7
        }}>
          <span className="text-[10px] transition-colors duration-300" style={{ 
            color: isHovered ? '#ffffff' : colors.text 
          }}>
            {data.connections} connection{data.connections !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {data.threat && (
        <div className="mt-1">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${
              data.threat === 'high' ? 'animate-pulse-slow' : ''
            }`}
            style={{
              backgroundColor:
                data.threat === 'high'
                  ? '#7f1d1d'
                  : data.threat === 'medium'
                  ? '#78350f'
                  : '#1e3a8a',
              color:
                data.threat === 'high'
                  ? '#fca5a5'
                  : data.threat === 'medium'
                  ? '#fde68a'
                  : '#93c5fd',
              boxShadow: isHovered ? `0 0 10px ${getGlowColor()}` : 'none',
            }}
          >
            {data.threat.toUpperCase()}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// ============================================================================
// API DATA FETCHING
// ============================================================================

async function fetchNetworkGraphData(jobAnalysisId: string) {
  try {
    const response = await fetch(`/api/scam-networks/${jobAnalysisId}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch network data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("ScamNetworkGraph", "API fetch failed", { 
      data: { error: error instanceof Error ? error.message : String(error) } 
    });
    throw error;
  }
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

interface ScamNetworkGraphProps {
  jobAnalysisId: string;
}

interface NetworkGraphData {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    totalNetworks: number;
    totalLinkedAnalyses: number;
    correlationTypes: string[];
  };
  summary: {
    nodeCount: number;
    edgeCount: number;
    uniqueEntities: number;
    correlationSources: string[];
    highestConfidence: number;
    averageConfidence: number;
  };
}

function ScamNetworkGraphComponent({ jobAnalysisId }: ScamNetworkGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const { fitView } = useReactFlow();

  // Fetch network graph data when jobAnalysisId changes
  useEffect(() => {
    if (!jobAnalysisId) {
      logger.warn("ScamNetworkGraph", "No job analysis ID provided");
      setError("No job analysis ID provided");
      setLoading(false);
      return;
    }

    const loadGraphData = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.info("ScamNetworkGraph", "Fetching network graph data", { 
          data: { jobAnalysisId } 
        });

        const data: NetworkGraphData = await fetchNetworkGraphData(jobAnalysisId);
        
        logger.info("ScamNetworkGraph", "Graph data loaded successfully", { 
          data: { nodeCount: data.nodes.length, edgeCount: data.edges.length } 
        });

        setGraphData(data);
        
        // Enhanced edges with animations
        const enhancedEdges = data.edges.map((edge) => ({
          ...edge,
          animated: true,
          style: {
            ...edge.style,
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeOpacity: 0.8,
          },
          labelStyle: {
            fill: '#93c5fd',
            fontSize: 10,
            fontWeight: 'bold',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        }));
        
        setNodes(data.nodes);
        setEdges(enhancedEdges);

        // Auto-fit view after setting nodes
        setTimeout(() => {
          fitView({ padding: 0.3 });
        }, 100);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load network graph";
        setError(message);
        logger.error("ScamNetworkGraph", "Error loading graph", { 
          data: { error: message } 
        });
        
        // Still show empty node for main analysis
        const emptyNode: Node = {
          id: jobAnalysisId,
          data: {
            label: "Job Analysis (No correlations found)",
            nodeType: "analysis",
            threat: "low",
          },
          position: { x: 0, y: 0 },
          style: {
            background: "#064e3b",
            border: "2px solid #10b981",
            borderRadius: "8px",
            padding: "10px",
            minWidth: "150px",
            color: "#a7f3d0",
            textAlign: "center",
          },
        };
        setNodes([emptyNode]);
        setEdges([]);
      } finally {
        setLoading(false);
      }
    };

    loadGraphData();
  }, [jobAnalysisId, setNodes, setEdges, fitView]);

  const nodeTypes = { customNode: CustomNode };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary/60 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading scam network analysis...</p>
        </div>
      </div>
    );
  }

  if (error && (!nodes || nodes.length === 0)) {
    logger.error("ScamNetworkGraph", "Failed to load graph", { data: { error } });
    return (
      <div className="w-full flex items-center justify-center p-8 animate-fade-in">
        <div className="flex flex-col items-center gap-3 text-red-400 text-center">
          <AlertCircle className="h-6 w-6 animate-bounce-subtle" />
          <p className="text-sm">{error}</p>
          <p className="text-xs text-muted-foreground">Unable to correlate network entities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-2">
        <Network className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Scam Network Investigation {graphData?.metadata.totalNetworks ? `(${graphData.metadata.totalNetworks} Networks)` : ""}
        </h3>
      </div>

      {/* Info Text */}
      <p className="text-sm text-muted-foreground px-2 animate-fade-in">
        {graphData?.summary ? (
          <>
            This graph shows {graphData.summary.uniqueEntities} correlated entities across {graphData.summary.nodeCount} job analyses
            with an average confidence of {graphData.summary.averageConfidence}%.
            {graphData.metadata.correlationTypes.length > 0 && (
              <> Correlation types: {graphData.metadata.correlationTypes.join(", ")}</>
            )}
          </>
        ) : (
          <>No correlations found for this job analysis.</>
        )}
      </p>

      {/* Graph Container with fade animation */}
      <div
        className="rounded-lg border border-border bg-card/40 overflow-hidden animate-fade-in-scale"
        style={{ height: "500px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#374151" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Statistics with staggered animation */}
      {graphData?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-card/40 rounded-lg border border-border text-sm animate-slide-up">
          <div className="transition-all duration-300 hover:bg-white/5 p-2 rounded">
            <div className="text-muted-foreground text-xs">Total Entities</div>
            <div className="text-lg font-bold text-foreground">{graphData.summary.uniqueEntities}</div>
          </div>
          <div className="transition-all duration-300 hover:bg-white/5 p-2 rounded">
            <div className="text-muted-foreground text-xs">Job Analyses</div>
            <div className="text-lg font-bold text-foreground">{graphData.summary.nodeCount}</div>
          </div>
          <div className="transition-all duration-300 hover:bg-white/5 p-2 rounded">
            <div className="text-muted-foreground text-xs">Avg Confidence</div>
            <div className="text-lg font-bold text-foreground">{graphData.summary.averageConfidence}%</div>
          </div>
          <div className="transition-all duration-300 hover:bg-white/5 p-2 rounded">
            <div className="text-muted-foreground text-xs">Network Links</div>
            <div className="text-lg font-bold text-foreground">{graphData.metadata.totalNetworks}</div>
          </div>
        </div>
      )}

      {/* Legend with fade animation */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-card/40 rounded-lg border border-border text-sm animate-fade-in">
        <div className="flex items-center gap-2 transition-all hover:bg-white/5 p-2 rounded">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: NODE_COLORS.job.bg, borderColor: NODE_COLORS.job.border, borderWidth: "2px" }}
          ></div>
          <span className="text-muted-foreground">Job Analysis</span>
        </div>
        <div className="flex items-center gap-2 transition-all hover:bg-white/5 p-2 rounded">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: NODE_COLORS.domain.bg, borderColor: NODE_COLORS.domain.border, borderWidth: "2px" }}
          ></div>
          <span className="text-muted-foreground">Domain</span>
        </div>
        <div className="flex items-center gap-2 transition-all hover:bg-white/5 p-2 rounded">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: NODE_COLORS.recruiter.bg, borderColor: NODE_COLORS.recruiter.border, borderWidth: "2px" }}
          ></div>
          <span className="text-muted-foreground">Email</span>
        </div>
        <div className="flex items-center gap-2 transition-all hover:bg-white/5 p-2 rounded">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: NODE_COLORS.report.bg, borderColor: NODE_COLORS.report.border, borderWidth: "2px" }}
          ></div>
          <span className="text-muted-foreground">Wallet</span>
        </div>
      </div>
    </div>
  );
}

// Wrapper component for React Flow provider
export function ScamNetworkGraph({ jobAnalysisId }: ScamNetworkGraphProps) {
  return (
    <Card className="glass-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Network className="h-5 w-5 text-primary" />
          Scam Network Intelligence
        </CardTitle>
        <CardDescription>
          Real-time correlation of job posting entities with known scam networks and threat actors
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ReactFlow>
          <ScamNetworkGraphComponent jobAnalysisId={jobAnalysisId} />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
