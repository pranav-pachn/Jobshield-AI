'use client';

import React from 'react';
import { X, Copy, ExternalLink, AlertTriangle, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { NodeDetail } from '@/hooks/useNetworkGraph';

interface NodeDetailPanelProps {
  node: NodeDetail | null;
  onClose: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  if (!node) return null;

  const getThreatColor = (threat?: string) => {
    switch (threat) {
      case 'high':
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getThreatIcon = (threat?: string) => {
    switch (threat) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      case 'low':
        return <Zap className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-card/95 backdrop-blur-md border-l border-border shadow-2xl z-50"
    >
      <Card className="rounded-none h-full border-0 bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
          <CardTitle className="text-lg">Entity Details</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 hover:bg-destructive/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 overflow-y-auto" style={{ height: 'calc(100% - 70px)' }}>
          {/* Entity Title */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-muted-foreground">Entity</h3>
            <p className="text-lg font-bold text-foreground break-words">{node.label}</p>
            {node.entityType && (
              <Badge variant="outline" className="w-fit">
                {node.entityType.toUpperCase()}
              </Badge>
            )}
          </motion.div>

          {/* Threat Level */}
          {node.threat && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Threat Level</h3>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getThreatColor(node.threat)}`}>
                {getThreatIcon(node.threat)}
                <span className="capitalize font-semibold">{node.threat}</span>
              </div>
            </motion.div>
          )}

          {/* Confidence Score */}
          {node.confidence !== undefined && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Confidence</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{node.confidence}%</span>
                  <span className="text-xs text-muted-foreground">Correlation Strength</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${node.confidence}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Risk Score / Scam Probability */}
          {node.riskScore !== undefined && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Risk Score</h3>
              <div className="text-3xl font-bold text-foreground">{Math.round(node.riskScore * 100)}%</div>
              <p className="text-xs text-muted-foreground">Scam probability assessment</p>
            </motion.div>
          )}

          {/* Details / Full Value */}
          {node.details && node.details !== node.label && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Full Details</h3>
              <div className="bg-secondary/50 p-3 rounded-lg border border-border flex items-start gap-2">
                <code className="text-xs font-mono text-foreground break-all flex-1">{node.details}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:bg-primary/20"
                  onClick={() => copyToClipboard(node.details!)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Correlation Types */}
          {node.correlationTypes && node.correlationTypes.length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Correlation Types</h3>
              <div className="flex flex-wrap gap-2">
                {node.correlationTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connections Count */}
          {node.connections !== undefined && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Network Connections</h3>
              <p className="text-2xl font-bold text-foreground">{node.connections}</p>
              <p className="text-xs text-muted-foreground">
                This entity connects to {node.connections} other {node.connections === 1 ? 'entity' : 'entities'} in the network
              </p>
            </motion.div>
          )}

          {/* Metadata */}
          {node.metadata && Object.keys(node.metadata).length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-semibold text-muted-foreground">Additional Metadata</h3>
              <div className="bg-secondary/30 p-3 rounded-lg border border-border space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{key}:</span>
                    <span className="text-xs text-foreground font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Close button at bottom */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-border"
          >
            <Button onClick={onClose} className="w-full" variant="outline">
              Close
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NodeDetailPanel;
