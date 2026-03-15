'use client';

import { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { logger } from '@/lib/logger';

export interface NodeDetail {
  id: string;
  label: string;
  nodeType: 'entity' | 'analysis' | string;
  entityType?: string;
  threat?: 'high' | 'medium' | 'low' | 'critical';
  confidence?: number;
  details?: string;
  riskScore?: number;
  connections?: number;
  correlationTypes?: string[];
  linkedAnalyses?: string[];
  metadata?: Record<string, unknown>;
}

export interface NetworkGraphData {
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

export interface GlobalNetworkStats {
  totalNetworks: number;
  networksByType: Record<string, number>;
  totalReportsInNetworks: number;
  averageConfidence: number;
  networks: any[];
  displayedNetworks: number;
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  filters: {
    correlationType: string;
    confidenceMin: number;
    confidenceMax: number;
  };
}

export interface NetworkGraphFilters {
  correlationTypes: string[];
  confidenceMin: number;
  confidenceMax: number;
  entityTypes: string[];
}

export function useNetworkGraph(jobAnalysisId?: string) {
  const [data, setData] = useState<NetworkGraphData | null>(null);
  const [globalData, setGlobalData] = useState<GlobalNetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NetworkGraphFilters>({
    correlationTypes: [],
    confidenceMin: 0,
    confidenceMax: 1,
    entityTypes: [],
  });

  // Fetch job-specific network graph
  const fetchJobNetworkGraph = useCallback(
    async (analysisId: string) => {
      if (!analysisId) {
        setError('No job analysis ID provided');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${apiUrl}/api/scam-networks/${analysisId}`;

        logger.info('useNetworkGraph', 'Fetching job network graph', { data: { analysisId } });

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch network graph`);
        }

        const graphData = (await response.json()) as NetworkGraphData;
        setData(graphData);

        logger.info('useNetworkGraph', 'Job network graph loaded', {
          data: {
            nodeCount: graphData.nodes.length,
            edgeCount: graphData.edges.length,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load network graph';
        setError(message);
        logger.error('useNetworkGraph', 'Error fetching job network', { data: { error: message } });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch global network statistics with filtering
  const fetchGlobalNetworkStats = useCallback(
    async (filterParams?: Partial<NetworkGraphFilters>) => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const params = new URLSearchParams();

        // Add correlation type filter
        if (filterParams?.correlationTypes && filterParams.correlationTypes.length > 0) {
          params.append('correlationType', filterParams.correlationTypes[0]); // API accepts single type
        }

        // Add confidence filters
        if (filterParams?.confidenceMin !== undefined) {
          params.append('confidenceMin', String(filterParams.confidenceMin));
        }
        if (filterParams?.confidenceMax !== undefined) {
          params.append('confidenceMax', String(filterParams.confidenceMax));
        }

        params.append('limit', '100');
        params.append('offset', '0');

        const url = `${apiUrl}/api/scam-networks/stats/summary?${params.toString()}`;

        logger.info('useNetworkGraph', 'Fetching global network stats', {
          data: { filters: filterParams },
        });

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch network stats`);
        }

        const statsData = (await response.json()) as GlobalNetworkStats;
        setGlobalData(statsData);

        logger.info('useNetworkGraph', 'Global network stats loaded', {
          data: {
            totalNetworks: statsData.totalNetworks,
            displayedNetworks: statsData.displayedNetworks,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load network statistics';
        setError(message);
        logger.error('useNetworkGraph', 'Error fetching global stats', { data: { error: message } });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NetworkGraphFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Filter nodes and edges based on active filters
  const getFilteredData = useCallback((): { nodes: Node[]; edges: Edge[] } | null => {
    if (!data) return null;

    let filteredEdges = data.edges;

    // Filter by correlation types
    if (filters.correlationTypes.length > 0) {
      filteredEdges = filteredEdges.filter(
        (edge) =>
          edge.data?.correlationType && filters.correlationTypes.includes(edge.data.correlationType)
      );
    }

    // Filter by confidence threshold
    filteredEdges = filteredEdges.filter(
      (edge) =>
        edge.data?.confidence !== undefined &&
        edge.data.confidence >= filters.confidenceMin * 100 &&
        edge.data.confidence <= filters.confidenceMax * 100
    );

    // Get all node IDs that are part of filtered edges
    const activeNodeIds = new Set<string>();
    filteredEdges.forEach((edge) => {
      activeNodeIds.add(edge.source);
      activeNodeIds.add(edge.target);
    });

    // Filter nodes based on entity types
    let filteredNodes = data.nodes.filter(
      (node) =>
        node.id === data.nodes[0].id || // Always include main node
        (filters.entityTypes.length === 0 ||
          !node.data?.entityType ||
          filters.entityTypes.includes(node.data.entityType))
    );

    // Also include nodes connected by filtered edges
    filteredNodes = filteredNodes.filter(
      (node) => node.id === data.nodes[0].id || activeNodeIds.has(node.id)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [data, filters]);

  // Auto-fetch job network when jobAnalysisId changes
  useEffect(() => {
    if (jobAnalysisId) {
      fetchJobNetworkGraph(jobAnalysisId);
    }
  }, [jobAnalysisId, fetchJobNetworkGraph]);

  return {
    // Job-specific network
    data,
    loading,
    error,
    fetchJobNetworkGraph,

    // Global network
    globalData,
    fetchGlobalNetworkStats,

    // Filtering
    filters,
    updateFilters,
    getFilteredData,
  };
}

export default useNetworkGraph;
