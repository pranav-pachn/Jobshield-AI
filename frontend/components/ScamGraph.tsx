import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, X, Globe, Mail, AlertTriangle, FileText, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Type definitions for our data structures
type ThreatLevel = 'high' | 'medium' | 'low';
type NodeType = 'job' | 'recruiter' | 'domain' | 'reports' | 'wallet';

interface NodeDetails {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  posted?: string;
  applicants?: number;
  suspiciousPhrases?: string[];
  email?: string;
  domain?: string;
  verified?: boolean;
  reputation?: number;
  blacklistCount?: number;
  firstSeen?: string;
  suspiciousPatterns?: string[];
  age?: string;
  registrar?: string;
  created?: string;
  expires?: string;
  sslValid?: boolean;
  reports?: number;
  trustScore?: number;
  virusTotal?: { malicious: number; suspicious: number };
  safeBrowsing?: boolean;
  nameServers?: string[];
  totalReports?: number;
  confirmedScams?: number;
  pendingReview?: number;
  reportTypes?: string[];
  lastReport?: string;
  severity?: string;
  affectedUsers?: number;
  address?: string;
  blockchain?: string;
  transactions?: number;
  totalReceived?: string;
  flaggedAddresses?: number;
  exchangeConnections?: string[];
  riskScore?: number;
}

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  tone: string;
  threatLevel: ThreatLevel;
  details: NodeDetails;
}

interface MousePosition {
  x: number;
  y: number;
}

// Enhanced node data with threat intelligence details
const nodes: GraphNode[] = [
  {
    id: "job-post",
    label: "Senior Developer",
    type: "job",
    x: 14,
    y: 44,
    tone: "bg-primary/20 text-primary border-primary/30",
    threatLevel: "medium" as const,
    details: {
      title: "Senior React Developer",
      company: "TechCorp Solutions",
      location: "Remote",
      salary: "$120k-$150k",
      posted: "2 days ago",
      applicants: 45,
      suspiciousPhrases: ["urgent hiring", "immediate start"],
    },
  },
  {
    id: "recruiter-email",
    label: "hr@fast-careers.com",
    type: "recruiter",
    x: 42,
    y: 18,
    tone: "bg-secondary/20 text-secondary-foreground border-secondary/30",
    threatLevel: "high" as const,
    details: {
      email: "hr@fast-careers.com",
      domain: "fast-careers.com",
      verified: false,
      reputation: -2.5,
      blacklistCount: 8,
      firstSeen: "3 months ago",
      suspiciousPatterns: ["generic corporate domain", "no company name"],
    },
  },
  {
    id: "domain",
    label: "fast-careers.com",
    type: "domain",
    x: 74,
    y: 35,
    tone: "bg-destructive/20 text-destructive border-destructive/30",
    threatLevel: "high" as const,
    details: {
      domain: "fast-careers.com",
      age: "2 months",
      registrar: "NameCheap Inc.",
      created: "2024-01-15",
      expires: "2025-01-15",
      sslValid: false,
      reports: 8,
      trustScore: 15,
      virusTotal: { malicious: 3, suspicious: 2 },
      safeBrowsing: true,
      nameServers: ["ns1.fast-careers.com", "ns2.fast-careers.com"],
    },
  },
  {
    id: "scam-reports",
    label: "8 Reports",
    type: "reports",
    x: 62,
    y: 74,
    tone: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    threatLevel: "high" as const,
    details: {
      totalReports: 8,
      confirmedScams: 5,
      pendingReview: 3,
      reportTypes: ["fake job posting", "advance fee fraud", "phishing"],
      lastReport: "1 day ago",
      severity: "high",
      affectedUsers: 23,
    },
  },
  {
    id: "wallet-address",
    label: "0x7f9a...8b2c",
    type: "wallet",
    x: 28,
    y: 80,
    tone: "bg-green-500/20 text-green-500 border-green-500/30",
    threatLevel: "medium" as const,
    details: {
      address: "0x7f9a4b8c2d6e1f3a5b7c9d0e2f4a6b8c0d2e4f6",
      blockchain: "Ethereum",
      firstSeen: "1 month ago",
      transactions: 47,
      totalReceived: "2.3 ETH",
      flaggedAddresses: 3,
      exchangeConnections: ["Binance", "Coinbase"],
      riskScore: 65,
    },
  },
];

const links = [
  ["job-post", "recruiter-email"],
  ["recruiter-email", "domain"],
  ["domain", "scam-reports"],
  ["scam-reports", "wallet-address"],
  ["job-post", "wallet-address"],
];

// Helper component for node icons
const NodeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "job":
      return <FileText className="h-3 w-3" />;
    case "recruiter":
      return <Mail className="h-3 w-3" />;
    case "domain":
      return <Globe className="h-3 w-3" />;
    case "reports":
      return <AlertTriangle className="h-3 w-3" />;
    case "wallet":
      return <Wallet className="h-3 w-3" />;
    default:
      return null;
  }
};

// Hover tooltip component
const HoverTooltip = ({ node, position }: { node: GraphNode; position: MousePosition }) => {
  const getQuickInfo = () => {
    switch (node.type) {
      case "domain":
        return {
          title: node.details.domain,
          lines: [`Age: ${node.details.age}`, `Reports: ${node.details.reports}`, `Trust Score: ${node.details.trustScore}%`],
        };
      case "recruiter":
        return {
          title: node.details.email,
          lines: [`Domain: ${node.details.domain}`, `Reputation: ${node.details.reputation}`, `Blacklisted: ${node.details.blacklistCount}x`],
        };
      case "reports":
        return {
          title: "Scam Reports",
          lines: [`Total: ${node.details.totalReports}`, `Confirmed: ${node.details.confirmedScams}`, `Severity: ${node.details.severity}`],
        };
      case "wallet":
        return {
          title: "Crypto Wallet",
          lines: [`Transactions: ${node.details.transactions}`, `Received: ${node.details.totalReceived}`, `Risk Score: ${node.details.riskScore}%`],
        };
      case "job":
        return {
          title: node.details.title,
          lines: [`Company: ${node.details.company}`, `Location: ${node.details.location}`, `Applicants: ${node.details.applicants}`],
        };
      default:
        return { title: node.label, lines: [] };
    }
  };

  const quickInfo = getQuickInfo();

  return (
    <div
      className="absolute z-50 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 p-3 shadow-xl pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%) translateY(-10px)",
      }}
    >
      <div className="text-white font-semibold text-sm mb-1">{quickInfo.title}</div>
      {quickInfo.lines.map((line, idx) => (
        <div key={idx} className="text-gray-300 text-xs">{line}</div>
      ))}
      <div className="mt-2">
        <Badge
          variant="outline"
          className={`text-xs ${
            node.threatLevel === "high"
              ? "border-red-500 text-red-400 bg-red-500/10"
              : node.threatLevel === "medium"
              ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
              : "border-green-500 text-green-400 bg-green-500/10"
          }`}
        >
          {node.threatLevel.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
};

// Expanded detail panel component
const DetailPanel = ({ node, onClose }: { node: GraphNode; onClose: () => void }) => {
  const getDetailContent = () => {
    switch (node.type) {
      case "domain":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Domain Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Domain:</span>
                  <span className="text-white ml-2">{node.details.domain}</span>
                </div>
                <div>
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white ml-2">{node.details.age}</span>
                </div>
                <div>
                  <span className="text-gray-400">Registrar:</span>
                  <span className="text-white ml-2">{node.details.registrar}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">{node.details.created}</span>
                </div>
                <div>
                  <span className="text-gray-400">SSL Valid:</span>
                  <span className={`ml-2 ${node.details.sslValid ? "text-green-400" : "text-red-400"}`}>
                    {node.details.sslValid ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Trust Score:</span>
                  <span className="text-white ml-2">{node.details.trustScore}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Threat Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Scam Reports:</span>
                  <span className="text-red-400">{node.details.reports}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">VirusTotal (Malicious):</span>
                  <span className="text-red-400">{node.details.virusTotal?.malicious || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">VirusTotal (Suspicious):</span>
                  <span className="text-yellow-400">{node.details.virusTotal?.suspicious || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Safe Browsing:</span>
                  <span className={node.details.safeBrowsing ? "text-green-400" : "text-red-400"}>
                    {node.details.safeBrowsing ? "Safe" : "Flagged"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-2">Name Servers</h4>
              <div className="space-y-1">
                {node.details.nameServers?.map((ns: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-300 font-mono">{ns}</div>
                )) || <div className="text-sm text-gray-400">No name servers available</div>}
              </div>
            </div>
          </div>
        );
      
      case "recruiter":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Email Analysis</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white ml-2">{node.details.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">Domain:</span>
                  <span className="text-white ml-2">{node.details.domain}</span>
                </div>
                <div>
                  <span className="text-gray-400">Verified:</span>
                  <span className={`ml-2 ${node.details.verified ? "text-green-400" : "text-red-400"}`}>
                    {node.details.verified ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Reputation:</span>
                  <span className="text-white ml-2">{node.details.reputation}</span>
                </div>
                <div>
                  <span className="text-gray-400">Blacklisted:</span>
                  <span className="text-red-400 ml-2">{node.details.blacklistCount} times</span>
                </div>
                <div>
                  <span className="text-gray-400">First Seen:</span>
                  <span className="text-white ml-2">{node.details.firstSeen}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Suspicious Patterns</h4>
              <div className="space-y-1">
                {node.details.suspiciousPatterns?.map((pattern: string, idx: number) => (
                  <div key={idx} className="text-sm text-yellow-400">⚠️ {pattern}</div>
                )) || <div className="text-sm text-gray-400">No suspicious patterns detected</div>}
              </div>
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Report Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Total Reports:</span>
                  <span className="text-white ml-2">{node.details.totalReports}</span>
                </div>
                <div>
                  <span className="text-gray-400">Confirmed Scams:</span>
                  <span className="text-red-400 ml-2">{node.details.confirmedScams}</span>
                </div>
                <div>
                  <span className="text-gray-400">Pending Review:</span>
                  <span className="text-yellow-400 ml-2">{node.details.pendingReview}</span>
                </div>
                <div>
                  <span className="text-gray-400">Severity:</span>
                  <span className="text-red-400 ml-2">{node.details.severity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Last Report:</span>
                  <span className="text-white ml-2">{node.details.lastReport}</span>
                </div>
                <div>
                  <span className="text-gray-400">Affected Users:</span>
                  <span className="text-orange-400 ml-2">{node.details.affectedUsers}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Report Types</h4>
              <div className="space-y-1">
                {node.details.reportTypes?.map((type: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-300">• {type}</div>
                )) || <div className="text-sm text-gray-400">No report types available</div>}
              </div>
            </div>
          </div>
        );

      case "wallet":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Wallet Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white ml-2 font-mono text-xs">{node.details.address}</span>
                </div>
                <div>
                  <span className="text-gray-400">Blockchain:</span>
                  <span className="text-white ml-2">{node.details.blockchain}</span>
                </div>
                <div>
                  <span className="text-gray-400">First Seen:</span>
                  <span className="text-white ml-2">{node.details.firstSeen}</span>
                </div>
                <div>
                  <span className="text-gray-400">Transactions:</span>
                  <span className="text-white ml-2">{node.details.transactions}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Received:</span>
                  <span className="text-white ml-2">{node.details.totalReceived}</span>
                </div>
                <div>
                  <span className="text-gray-400">Risk Score:</span>
                  <span className="text-yellow-400 ml-2">{node.details.riskScore}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Exchange Connections</h4>
              <div className="space-y-1">
                {node.details.exchangeConnections?.map((exchange: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-300">• {exchange}</div>
                )) || <div className="text-sm text-gray-400">No exchange connections</div>}
              </div>
            </div>
          </div>
        );

      case "job":
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Job Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2">
                  <span className="text-gray-400">Title:</span>
                  <span className="text-white ml-2">{node.details.title}</span>
                </div>
                <div>
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white ml-2">{node.details.company}</span>
                </div>
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white ml-2">{node.details.location}</span>
                </div>
                <div>
                  <span className="text-gray-400">Salary:</span>
                  <span className="text-white ml-2">{node.details.salary}</span>
                </div>
                <div>
                  <span className="text-gray-400">Posted:</span>
                  <span className="text-white ml-2">{node.details.posted}</span>
                </div>
                <div>
                  <span className="text-gray-400">Applicants:</span>
                  <span className="text-white ml-2">{node.details.applicants}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">Suspicious Phrases</h4>
              <div className="space-y-1">
                {node.details.suspiciousPhrases?.map((phrase: string, idx: number) => (
                  <div key={idx} className="text-sm text-yellow-400">⚠️ {phrase}</div>
                )) || <div className="text-sm text-gray-400">No suspicious phrases detected</div>}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-white">No details available</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-black/95 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <NodeIcon type={node.type} />
            <h3 className="text-xl font-bold text-white">{node.label}</h3>
            <Badge
              variant="outline"
              className={`
                ${node.threatLevel === "high"
                  ? "border-red-500 text-red-400 bg-red-500/10"
                  : node.threatLevel === "medium"
                  ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                  : "border-green-500 text-green-400 bg-green-500/10"
                }
              `}
            >
              {node.threatLevel.toUpperCase()}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {getDetailContent()}
      </motion.div>
    </motion.div>
  );
};

export function ScamGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  return (
    <>
      <Card className="glass-card-accent shadow-xl overflow-hidden relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Share2 className="h-5 w-5 text-primary" />
            Threat Intelligence Map
          </CardTitle>
          <CardDescription>
            Live threat correlation mapping showing scam network relationships and connections. Hover for details, click to expand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/5 -z-10" />
          
          <div 
            className="relative h-[320px] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 shadow-inner"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Animated background grid */}
            <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="threatthreat-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(96,125,255,0.2)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#threat-grid)" />
            </svg>

            {/* Connection lines - Now animated */}
            <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="lineGradient">
                  <stop offset="0%" stopColor="rgba(96,125,255,0.2)" />
                  <stop offset="50%" stopColor="rgba(147,51,234,0.3)" />
                  <stop offset="100%" stopColor="rgba(96,125,255,0.2)" />
                </linearGradient>
              </defs>
              {links.map(([from, to], idx) => {
                const start = nodes.find((node) => node.id === from);
                const end = nodes.find((node) => node.id === to);

                if (!start || !end) {
                  return null;
                }

                return (
                  <g key={`${from}-${to}`}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke="url(#lineGradient)"
                      strokeWidth="1.2"
                      className="animate-pulse"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    />
                    {/* Animated data packet */}
                    <circle
                      cx={start.x}
                      cy={start.y}
                      r="1"
                      fill="rgba(96,125,255,0.8)"
                      className="animate-pulse"
                      style={{
                        animation: `float ${2}s ease-in-out infinite`,
                        animationDelay: `${idx * 0.2}s`,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Nodes - Enhanced with interactivity */}
            {nodes.map((node, idx) => (
              <div
                key={node.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-xs font-bold tracking-wide backdrop-blur-md transition-all cursor-pointer shadow-lg ${node.tone} ${
                  hoveredNode === node.id ? "scale-110 shadow-[0_0_25px_rgba(96,125,255,0.8)] z-20" : "hover:scale-105"
                }`}
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  animation: `float ${4 + idx}s ease-in-out infinite`,
                  borderColor:
                    node.threatLevel === "high"
                      ? "rgba(239, 68, 68, 0.8)"
                      : node.threatLevel === "medium"
                      ? "rgba(245, 158, 11, 0.8)"
                      : "rgba(34, 197, 94, 0.8)",
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
              >
                <div className="flex items-center gap-1.5">
                  <NodeIcon type={node.type} />
                  <span className="truncate max-w-[80px]">{node.label}</span>
                </div>
                
                {/* Threat level indicator */}
                <div className="mt-1 flex justify-center">
                  <div
                    className={`h-1 w-8 rounded-full ${
                      node.threatLevel === "high"
                        ? "bg-red-500"
                        : node.threatLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                </div>
              </div>
            ))}

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredNode && (
                <HoverTooltip
                  node={nodes.find((n) => n.id === hoveredNode)!}
                  position={mousePosition}
                />
              )}
            </AnimatePresence>

            {/* Info overlay */}
            <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-[10px] font-medium text-muted-foreground backdrop-blur-md hover:border-white/20 transition-colors">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Interactive Threat Map</span>
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[10px] font-medium">
              {[
                { label: "Job Post", type: "job" },
                { label: "Recruiter", type: "recruiter" },
                { label: "Domain", type: "domain" },
                { label: "Network", type: "reports" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <NodeIcon type={item.type} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            
            {/* Threat level legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-medium">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-red-400">High Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-yellow-400">Medium Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-green-400">Low Risk</span>
              </div>
            </div>
          </div>
        </CardContent>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
        `}</style>
      </Card>

      {/* Detail panel modal */}
      <AnimatePresence>
        {selectedNode && (
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>
    </>
  );
}