'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Network, X, Calendar, Shield, Link2, FileWarning, Globe, Mail, FileText, AlertTriangle } from 'lucide-react';
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

type NodeType = 'job' | 'recruiter' | 'domain' | 'report' | 'analysis';

interface GraphNodeData {
  label: string;
  nodeType: NodeType;
  threat?: 'high' | 'medium' | 'low';
  connections?: number;
  details?: string;
  // Extended detail fields shown in the click panel
  age?: string;          // e.g. "2 months"
  reports?: number;      // e.g. 8
  confidence?: number;   // 0-100
  description?: string;  // free-form extra text
  flaggedReasons?: string[];
}

// ============================================================================
// NODE COLORS AND STYLING
// ============================================================================

const NODE_COLORS: Record<NodeType, { bg: string; border: string; text: string }> = {
  job: {
    bg: '#0d1f17',
    border: '#10b981',
    text: '#a7f3d0',
  },
  analysis: {
    bg: '#0d1f17',
    border: '#10b981',
    text: '#a7f3d0',
  },
  recruiter: {
    bg: '#1a0f3d',
    border: '#a78bfa',
    text: '#ddd6fe',
  },
  domain: {
    bg: '#1a0a0a',
    border: '#ef4444',
    text: '#fca5a5',
  },
  report: {
    bg: '#1a1200',
    border: '#f59e0b',
    text: '#fde68a',
  },
};

// Risk-level border & glow overrides
const RISK_COLORS: Record<'high' | 'medium' | 'low', { border: string; glow: string; badge: { bg: string; text: string }; label: string }> = {
  high: {
    border: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.65)',
    badge: { bg: '#7f1d1d', text: '#fca5a5' },
    label: '🔴 SCAM',
  },
  medium: {
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.55)',
    badge: { bg: '#78350f', text: '#fde68a' },
    label: '🟡 SUSPICIOUS',
  },
  low: {
    border: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.45)',
    badge: { bg: '#052e16', text: '#86efac' },
    label: '🟢 SAFE',
  },
};

// ============================================================================
// HOVER TOOLTIP
// ============================================================================

function NodeTooltip({ data }: { data: GraphNodeData }) {
  const risk = data.threat ? RISK_COLORS[data.threat] : null;
  const colors = NODE_COLORS[data.nodeType];

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: '180px',
        maxWidth: '240px',
      }}
    >
      <div
        className="rounded-lg border shadow-2xl text-xs p-3 space-y-1.5 animate-fade-in"
        style={{
          backgroundColor: '#0f172a',
          borderColor: risk ? risk.border : colors.border,
          boxShadow: `0 0 20px ${risk ? risk.glow : 'rgba(59,130,246,0.3)'}`,
        }}
      >
        {/* Entity type + label */}
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <span>
            {(data.nodeType === 'job' || data.nodeType === 'analysis') && '📄'}
            {data.nodeType === 'recruiter' && '📧'}
            {data.nodeType === 'domain' && '🌐'}
            {data.nodeType === 'report' && '⚠️'}
          </span>
          <span className="truncate">{data.label}</span>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 border-t border-white/10">
          {data.age !== undefined && (
            <>
              <span className="text-slate-400">Age</span>
              <span className="text-white font-medium">{data.age}</span>
            </>
          )}
          {data.reports !== undefined && (
            <>
              <span className="text-slate-400">Reports</span>
              <span className="text-red-300 font-medium">{data.reports}</span>
            </>
          )}
          {data.connections !== undefined && (
            <>
              <span className="text-slate-400">Links</span>
              <span className="text-blue-300 font-medium">{data.connections}</span>
            </>
          )}
          {data.confidence !== undefined && (
            <>
              <span className="text-slate-400">Confidence</span>
              <span className="text-yellow-300 font-medium">{data.confidence}%</span>
            </>
          )}
        </div>

        {/* Risk badge */}
        {risk && (
          <div className="pt-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: risk.badge.bg, color: risk.badge.text }}
            >
              {risk.label}
            </span>
          </div>
        )}

        {/* Hint */}
        <p className="text-[10px] text-slate-500 pt-0.5">Click node for full details</p>
      </div>

      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          bottom: '-6px',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${risk ? risk.border : colors.border}`,
        }}
      />
    </div>
  );
}

// ============================================================================
// CUSTOM NODE COMPONENT
// ============================================================================

interface CustomNodeProps {
  data: GraphNodeData;
  isConnecting?: boolean;
}

export function CustomNode({ data, isConnecting }: CustomNodeProps) {
  const colors = NODE_COLORS[data.nodeType];
  const isJob = data.nodeType === 'job';
  const risk = data.threat ? RISK_COLORS[data.threat] : null;
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (data.threat === 'high') {
      const interval = setInterval(() => {
        setIsPulsing(prev => !prev);
      }, 1800);
      return () => clearInterval(interval);
    }
  }, [data.threat]);

  const borderColor = isHovered
    ? (risk ? risk.border : colors.text)
    : (risk ? risk.border : colors.border);

  const glowColor = risk ? risk.glow : 'rgba(59, 130, 246, 0.2)';

  return (
    <div
      className={`relative px-4 py-3 rounded-lg border-2 shadow-lg ${isPulsing ? 'animate-pulse-slow' : ''}`}
      style={{
        backgroundColor: colors.bg,
        borderColor,
        minWidth: isJob ? '130px' : '110px',
        boxShadow: isHovered
          ? `0 0 22px ${glowColor}, 0 4px 12px rgba(0,0,0,0.4)`
          : risk
          ? `0 0 8px ${glowColor}`
          : 'none',
        transform: isHovered ? 'scale(1.07)' : 'scale(1)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} />

      {/* Hover tooltip */}
      {isHovered && <NodeTooltip data={data} />}

      {/* Entity type row */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`}>
          {(data.nodeType === 'job' || data.nodeType === 'analysis') && '📄'}
          {data.nodeType === 'recruiter' && '📧'}
          {data.nodeType === 'domain' && '🌐'}
          {data.nodeType === 'report' && '⚠️'}
        </span>
        <span className="text-xs font-bold transition-colors duration-300" style={{
          color: isHovered ? '#ffffff' : colors.text
        }}>
          {(data.nodeType === 'job' || data.nodeType === 'analysis') ? 'Job Post'
            : data.nodeType === 'recruiter' ? 'Recruiter Email'
            : data.nodeType === 'domain' ? 'Domain'
            : 'Scam Reports'}
        </span>
      </div>

      {/* Node label */}
      <p className="text-xs font-semibold transition-all duration-300" style={{
        color: isHovered ? '#ffffff' : colors.text
      }} title={data.label}>
        {data.label.length > 18 ? data.label.slice(0, 15) + '...' : data.label}
      </p>

      {/* Connections count */}
      {data.connections !== undefined && (
        <div className="mt-2 pt-2 border-t transition-all duration-300" style={{
          borderColor: borderColor + '40',
          opacity: isHovered ? 1 : 0.7
        }}>
          <span className="text-[10px] transition-colors duration-300" style={{
            color: isHovered ? '#ffffff' : colors.text
          }}>
            {data.connections} connection{data.connections !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Risk badge */}
      {risk && (
        <div className="mt-1.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.threat === 'high' ? 'animate-pulse-slow' : ''}`}
            style={{
              backgroundColor: risk.badge.bg,
              color: risk.badge.text,
              boxShadow: isHovered ? `0 0 10px ${glowColor}` : 'none',
            }}
          >
            {risk.label}
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// ============================================================================
// NODE DETAIL PANEL (shown below graph on click)
// ============================================================================

function getNodeIcon(nodeType: NodeType) {
  switch (nodeType) {
    case 'job':
    case 'analysis': return <FileText className="h-5 w-5" />;
    case 'recruiter': return <Mail className="h-5 w-5" />;
    case 'domain': return <Globe className="h-5 w-5" />;
    case 'report': return <FileWarning className="h-5 w-5" />;
  }
}

interface NodeDetailPanelProps {
  node: Node<GraphNodeData>;
  onClose: () => void;
}

function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const data = node.data;
  const risk = data.threat ? RISK_COLORS[data.threat] : null;
  const colors = NODE_COLORS[data.nodeType];

  const entityLabel =
    (data.nodeType === 'job' || data.nodeType === 'analysis') ? 'Job Post'
    : data.nodeType === 'recruiter' ? 'Recruiter Email'
    : data.nodeType === 'domain' ? 'Domain'
    : 'Scam Reports';

  return (
    <div
      className="rounded-xl border p-5 space-y-4 transition-all duration-300 animate-slide-up"
      style={{
        backgroundColor: '#0b1120',
        borderColor: risk ? risk.border : colors.border,
        boxShadow: `0 0 30px ${risk ? risk.glow : 'rgba(59,130,246,0.2)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {getNodeIcon(data.nodeType)}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{entityLabel}</p>
            <h4 className="text-base font-bold text-white leading-tight">{data.label}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {risk && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: risk.badge.bg, color: risk.badge.text }}
            >
              {risk.label}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close detail panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.age !== undefined && (
          <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: '#161d2f', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
              <Calendar className="h-3.5 w-3.5" /> Domain Age
            </div>
            <p className="text-white font-bold text-sm">{data.age}</p>
          </div>
        )}
        {data.reports !== undefined && (
          <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: '#1a0a0a', border: '1px solid #7f1d1d' }}>
            <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-medium">
              <AlertTriangle className="h-3.5 w-3.5" /> Scam Reports
            </div>
            <p className="text-red-300 font-bold text-sm">{data.reports}</p>
          </div>
        )}
        {data.connections !== undefined && (
          <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: '#0d1a2d', border: '1px solid #1e3a5f' }}>
            <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-medium">
              <Link2 className="h-3.5 w-3.5" /> Network Links
            </div>
            <p className="text-blue-300 font-bold text-sm">{data.connections}</p>
          </div>
        )}
        {data.confidence !== undefined && (
          <div className="rounded-lg p-3 space-y-1" style={{ backgroundColor: '#1a1200', border: '1px solid #78350f' }}>
            <div className="flex items-center gap-1.5 text-yellow-400 text-[11px] font-medium">
              <Shield className="h-3.5 w-3.5" /> Confidence
            </div>
            <p className="text-yellow-300 font-bold text-sm">{data.confidence}%</p>
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Details</p>
          <p className="text-sm text-slate-300 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Flagged reasons */}
      {data.flaggedReasons && data.flaggedReasons.length > 0 && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#0f172a', border: '1px solid #7f1d1d' }}>
          <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-2">
            ⚠ Flagged Indicators
          </p>
          <ul className="space-y-1">
            {data.flaggedReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-red-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw details fallback */}
      {data.details && !data.description && !data.flaggedReasons && (
        <div className="rounded-lg p-3" style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Raw Details</p>
          <p className="text-xs text-slate-400 font-mono break-all">{data.details}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// API DATA FETCHING
// ============================================================================

async function fetchNetworkGraphData(jobAnalysisId: string) {
  try {
    if (!jobAnalysisId || jobAnalysisId.trim() === "") {
      throw new Error("jobAnalysisId is empty");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const url = `${apiUrl}/api/scam-networks/${jobAnalysisId}`;
    
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        errorBody = "Could not read response body";
      }
      const errorMsg = errorBody ? ` - Response: ${errorBody}` : "";
      throw new Error(`HTTP ${response.status} ${response.statusText}${errorMsg}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error("Invalid JSON response from server");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format");
    }

    return data;
  } catch (error) {
    let errorMessage = "Unknown error";
    let errorDetails: Record<string, unknown> = {};

    if (error instanceof TypeError) {
      errorMessage = `Network error: ${error.message}`;
      errorDetails.networkError = true;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    const fullErrorDetails = {
      error: errorMessage,
      jobAnalysisId: jobAnalysisId,
      timestamp: new Date().toISOString(),
      url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/scam-networks/${jobAnalysisId}`,
      ...errorDetails,
    };

    logger.error("ScamNetworkGraph", "API fetch failed", { 
      data: fullErrorDetails
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

// ============================================================================
// MEMOIZED NODE TYPES TO PREVENT RECREATION ON EVERY RENDER
// ============================================================================
const nodeTypes = { customNode: CustomNode };

function ScamNetworkGraphComponent({ jobAnalysisId }: ScamNetworkGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<GraphNodeData> | null>(null);
  const { fitView } = useReactFlow();

  // Handle node click → show detail panel
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node as Node<GraphNodeData>);
  }, []);

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
        setSelectedNode(null);

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
          data: { 
            error: message,
            jobAnalysisId: jobAnalysisId,
            errorType: err instanceof Error ? err.constructor.name : typeof err,
          } 
        });
        
        // Still show empty node for main analysis
        const emptyNode: Node = {
          id: jobAnalysisId,
          data: {
            label: "No correlations found",
            nodeType: "job",
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

      {/* Click hint banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 bg-white/5 border border-white/10 mx-0">
        <span className="text-base">💡</span>
        <span><strong className="text-slate-200">Hover</strong> a node to preview details · <strong className="text-slate-200">Click</strong> to expand full info panel</span>
      </div>

      {/* Graph Container */}
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
          onNodeClick={onNodeClick}
          fitView
        >
          <Background color="#374151" gap={16} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Node Detail Panel (slides in on click) */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Statistics */}
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

      {/* Legend */}
      <div className="p-4 bg-card/40 rounded-lg border border-border text-sm animate-fade-in space-y-3">
        {/* Entity types */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Entity Types</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded border-2" style={{ backgroundColor: NODE_COLORS.job.bg, borderColor: NODE_COLORS.job.border }} />
              <span className="text-muted-foreground">📄 Job Post</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded border-2" style={{ backgroundColor: NODE_COLORS.domain.bg, borderColor: NODE_COLORS.domain.border }} />
              <span className="text-muted-foreground">🌐 Domain</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded border-2" style={{ backgroundColor: NODE_COLORS.recruiter.bg, borderColor: NODE_COLORS.recruiter.border }} />
              <span className="text-muted-foreground">📧 Recruiter Email</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded border-2" style={{ backgroundColor: NODE_COLORS.report.bg, borderColor: NODE_COLORS.report.border }} />
              <span className="text-muted-foreground">⚠️ Scam Reports</span>
            </div>
          </div>
        </div>

        {/* Risk levels */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Level (Border Color)</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: RISK_COLORS.high.badge.bg, borderColor: RISK_COLORS.high.border }} />
              <span className="text-red-400 font-medium text-xs">🔴 Scam</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: RISK_COLORS.medium.badge.bg, borderColor: RISK_COLORS.medium.border }} />
              <span className="text-yellow-400 font-medium text-xs">🟡 Suspicious</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded transition-all">
              <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: RISK_COLORS.low.badge.bg, borderColor: RISK_COLORS.low.border }} />
              <span className="text-green-400 font-medium text-xs">🟢 Safe</span>
            </div>
          </div>
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
