'use client';

import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Network,
  ChevronDown,
  Filter,
  RotateCcw,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNetworkGraph, { NetworkGraphFilters, NodeDetail } from '@/hooks/useNetworkGraph';
import NodeDetailPanel from './NodeDetailPanel';
import { logger } from '@/lib/logger';

// Reuse the same CustomNode renderer for the chain nodes
import { CustomNode } from './ScamNetworkGraph';
const PANEL_NODE_TYPES = { customNode: CustomNode };

interface ScamNetworkPanelProps {
  jobAnalysisId?: string;
  mode?: 'job-specific' | 'global';
}

const CORRELATION_TYPE_OPTIONS = [
  'shared_wallet',
  'shared_email_exact',
  'shared_phone',
  'shared_email_domain',
  'textual_similarity',
];

const ENTITY_TYPE_OPTIONS = ['domain', 'email', 'wallet', 'phone', 'analysis'];

// Inner component that uses ReactFlow hooks
function ReactFlowGraphContainer({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  isExpanded,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (node: Node) => void;
  isExpanded: boolean;
}) {
  const { fitView } = useReactFlow();

  // Fit view when nodes/edges change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.3 });
      }, 100);
    }
  }, [nodes, fitView]);

  return (
    <div className="w-full h-full rounded-lg border border-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node)}
        nodeTypes={PANEL_NODE_TYPES}
        fitView
      >
        <Background color="#374151" gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function ScamNetworkPanel({
  jobAnalysisId,
  mode = 'job-specific',
}: ScamNetworkPanelProps) {
  const {
    data,
    globalData,
    loading,
    error,
    filters,
    updateFilters,
    getFilteredData,
    fetchGlobalNetworkStats,
  } = useNetworkGraph(jobAnalysisId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [is3DEnabled, setIs3DEnabled] = useState(false);

  // Load global stats on mount if in global mode
  useEffect(() => {
    if (mode === 'global') {
      fetchGlobalNetworkStats();
    }
  }, [mode, fetchGlobalNetworkStats]);

  // Update graph when filtered data changes
  useEffect(() => {
    if (mode === 'job-specific' && data) {
      const filteredData = getFilteredData();
      if (filteredData) {
        const enhancedEdges = filteredData.edges.map((edge) => ({
          ...edge,
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edge.style?.stroke || '#3b82f6',
          },
        }));

        setNodes(filteredData.nodes);
        setEdges(enhancedEdges);
      }
    }
  }, [data, filters, mode, getFilteredData, setNodes, setEdges]);

  // Handle node click to show details
  const handleNodeClick = (node: Node) => {
    const detail: NodeDetail = {
      id: node.id,
      label: node.data?.label || 'Unknown',
      nodeType: node.data?.nodeType || 'entity',
      entityType: node.data?.entityType,
      threat: node.data?.threat,
      confidence: node.data?.confidence,
      riskScore: node.data?.riskScore,
      details: node.data?.details || node.data?.label,
      connections: node.data?.connections,
      correlationTypes: node.data?.correlationTypes,
      metadata: node.data,
    };
    setSelectedNode(detail);
    logger.info('ScamNetworkPanel', 'Node selected', { data: { nodeId: node.id } });
  };

  const handleResetFilters = () => {
    updateFilters({
      correlationTypes: [],
      confidenceMin: 0,
      confidenceMax: 1,
      entityTypes: [],
    });
    setShowFilters(false);
    logger.info('ScamNetworkPanel', 'Filters reset');
  };

  const handleConfidenceChange = (value: number[]) => {
    updateFilters({
      confidenceMin: value[0] / 100,
      confidenceMax: value[1] / 100,
    });
  };

  const handleCorrelationToggle = (type: string) => {
    updateFilters({
      correlationTypes: filters.correlationTypes.includes(type)
        ? filters.correlationTypes.filter((t) => t !== type)
        : [...filters.correlationTypes, type],
    });
  };

  const handleEntityTypeToggle = (type: string) => {
    updateFilters({
      entityTypes: filters.entityTypes.includes(type)
        ? filters.entityTypes.filter((t) => t !== type)
        : [...filters.entityTypes, type],
    });
  };

  const statsData = mode === 'job-specific' ? data?.summary : globalData;
  const chartsData = mode === 'job-specific' ? data?.metadata : globalData;

  if (mode === 'job-specific' && loading) {
    return (
      <Card className="glass-card border-border shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary/60 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Loading scam network...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'job-specific' && error && !data) {
    return (
      <Card className="glass-card border-border shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-red-400 text-center">
            <AlertCircle className="h-6 w-6 animate-bounce" />
            <p className="text-sm">{error}</p>
            <p className="text-xs text-muted-foreground">Unable to load network graph</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`glass-card border-border shadow-lg ${isExpanded ? 'fixed inset-0 z-40 rounded-none' : ''}`}
      >
        <Card className={`h-full border-0 bg-transparent ${isExpanded ? 'rounded-none' : ''}`}>
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Scam Network {mode === 'global' ? 'Intelligence' : 'Investigation'}
              </CardTitle>
              <CardDescription>
                {mode === 'global'
                  ? 'Real-time correlation of job posting entities with known scam networks'
                  : 'Correlation analysis for this job posting'}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={showFilters ? 'Hide filters' : 'Show filters'}
              >
                <Filter className="h-4 w-4" />
              </motion.button>

              {mode === 'job-specific' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={isExpanded ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </motion.button>
              )}
            </div>
          </CardHeader>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-b border-border overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Confidence Threshold */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Confidence Threshold
                    </label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[filters.confidenceMin * 100, filters.confidenceMax * 100]}
                        onValueChange={handleConfidenceChange}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <div className="flex gap-1 text-xs font-mono text-muted-foreground">
                        <span>{Math.round(filters.confidenceMin * 100)}%</span>
                        <span>-</span>
                        <span>{Math.round(filters.confidenceMax * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Correlation Types */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Correlation Types
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CORRELATION_TYPE_OPTIONS.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={filters.correlationTypes.includes(type)}
                            onCheckedChange={() => handleCorrelationToggle(type)}
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {type.replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Entity Types */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Entity Types
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ENTITY_TYPE_OPTIONS.map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Checkbox
                            checked={filters.entityTypes.includes(type)}
                            onCheckedChange={() => handleEntityTypeToggle(type)}
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 3D Toggle (Future Feature) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={is3DEnabled}
                        onCheckedChange={(checked: any) => {
                          setIs3DEnabled(checked as boolean);
                          logger.info('ScamNetworkPanel', '3D mode toggled', {
                            data: { enabled: checked },
                          });
                        }}
                        disabled
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        3D View (Coming Soon)
                      </span>
                    </label>
                  </div>

                  {/* Reset Button */}
                  <Button
                    onClick={handleResetFilters}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Graph Container */}
          <CardContent className="p-4" style={{ height: isExpanded ? 'calc(100vh - 200px)' : '600px' }}>
            {mode === 'global' ? (
              // Global Mode: Show network summary and statistics
              loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Loading global network data...</p>
                  </div>
                </div>
              ) : globalData ? (
                <div className="w-full h-full space-y-6 overflow-y-auto">
                  {/* Network Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-sm text-muted-foreground mb-1">Total Networks</div>
                      <div className="text-3xl font-bold text-foreground">{globalData.totalNetworks}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange/10 to-orange/5 border border-orange/20">
                      <div className="text-sm text-muted-foreground mb-1">Reports Linked</div>
                      <div className="text-3xl font-bold text-foreground">{globalData.totalReportsInNetworks}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green/10 to-green/5 border border-green/20">
                      <div className="text-sm text-muted-foreground mb-1">Avg Confidence</div>
                      <div className="text-3xl font-bold text-foreground">{Math.round(globalData.averageConfidence * 100)}%</div>
                    </div>
                  </div>

                  {/* Network Types Breakdown */}
                  {Object.keys(globalData.networksByType).length > 0 && (
                    <div className="p-4 rounded-lg border border-border bg-secondary/20">
                      <h3 className="text-sm font-semibold mb-3 text-foreground">Networks by Type</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(globalData.networksByType).map(([type, count]) => (
                          <div
                            key={type}
                            className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                              {type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xl font-semibold text-foreground">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Networks List */}
                  {globalData.networks && globalData.networks.length > 0 && (
                    <div className="p-4 rounded-lg border border-border bg-secondary/20">
                      <h3 className="text-sm font-semibold mb-3 text-foreground">Top Networks</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {globalData.networks.slice(0, 5).map((network, idx) => (
                          <div
                            key={network.networkId || idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground mb-1">
                                {network.correlationType?.replace(/_/g, ' ') || 'Network'}
                              </div>
                              <div className="text-sm font-medium text-foreground">
                                {network.totalReportsLinked} reports found
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {Math.round((network.confidence || 0) * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-lg border border-border bg-background/50">
                  <div className="text-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No network data available</p>
                  </div>
                </div>
              )
            ) : // Job-specific mode: Show ReactFlow graph
            (!data || data.nodes.length === 0) ? (
              <div className="w-full h-full flex items-center justify-center rounded-lg border border-border bg-background/50">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No network correlations found</p>
                </div>
              </div>
            ) : (
              <ReactFlowProvider>
                <ReactFlowGraphContainer
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                  isExpanded={isExpanded}
                />
              </ReactFlowProvider>
            )}
          </CardContent>

          {/* Statistics Footer */}
          {statsData && mode === 'job-specific' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-secondary/20 border-t border-border text-sm"
            >
              <div className="transition-all hover:bg-white/5 p-2 rounded">
                <div className="text-muted-foreground text-xs">Total Entities</div>
                <div className="text-lg font-bold text-foreground">
                  {(statsData as any).uniqueEntities || (statsData as any).nodeCount || (statsData as any).totalNetworks || 0}
                </div>
              </div>
              <div className="transition-all hover:bg-white/5 p-2 rounded">
                <div className="text-muted-foreground text-xs">Avg Confidence</div>
                <div className="text-lg font-bold text-foreground">{statsData.averageConfidence}%</div>
              </div>
              <div className="transition-all hover:bg-white/5 p-2 rounded">
                <div className="text-muted-foreground text-xs">Correlations</div>
                <div className="text-lg font-bold text-foreground">
                  {chartsData ? (chartsData as any).totalNetworks || 0 : 0}
                </div>
              </div>
              <div className="transition-all hover:bg-white/5 p-2 rounded">
                <div className="text-muted-foreground text-xs">Risk Level</div>
                <div className="text-lg font-bold text-foreground">
                  {statsData.averageConfidence > 80 ? 'HIGH' : statsData.averageConfidence > 50 ? 'MED' : 'LOW'}
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ScamNetworkPanel;
