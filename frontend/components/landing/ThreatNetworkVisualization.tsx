"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  UserCheck, 
  Globe, 
  Database, 
  Share2, 
  Cpu, 
  ShieldAlert,
  Search,
  Activity
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  glowColor: string;
}

const NODES: NodeData[] = [
  {
    id: "job",
    label: "JOB POSTING",
    sublabel: "Target Document",
    x: 80,
    y: 190,
    icon: FileText,
    color: "#38bdf8",
    borderColor: "rgba(56, 189, 248, 0.4)",
    glowColor: "rgba(56, 189, 248, 0.2)",
  },
  {
    id: "recruiter",
    label: "RECRUITER",
    sublabel: "Identity & Freemail",
    x: 230,
    y: 80,
    icon: UserCheck,
    color: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.4)",
    glowColor: "rgba(245, 158, 11, 0.2)",
  },
  {
    id: "domain",
    label: "DOMAIN INTEL",
    sublabel: "DNS & WHOIS Age",
    x: 230,
    y: 300,
    icon: Globe,
    color: "#f43f5e",
    borderColor: "rgba(244, 63, 94, 0.4)",
    glowColor: "rgba(244, 63, 94, 0.2)",
  },
  {
    id: "threat_kb",
    label: "THREAT KB",
    sublabel: "RAG Vector Store",
    x: 370,
    y: 80,
    icon: Database,
    color: "#a855f7",
    borderColor: "rgba(168, 85, 247, 0.4)",
    glowColor: "rgba(168, 85, 247, 0.2)",
  },
  {
    id: "campaign",
    label: "CAMPAIGN",
    sublabel: "Pattern Correlation",
    x: 370,
    y: 300,
    icon: Share2,
    color: "#ec4899",
    borderColor: "rgba(236, 72, 153, 0.4)",
    glowColor: "rgba(236, 72, 153, 0.2)",
  },
  {
    id: "risk_engine",
    label: "RISK ENGINE",
    sublabel: "Deterministic Rules",
    x: 480,
    y: 190,
    icon: Cpu,
    color: "#00ff88",
    borderColor: "rgba(0, 255, 136, 0.5)",
    glowColor: "rgba(0, 255, 136, 0.25)",
  },
];

const EDGES = [
  { from: "job", to: "recruiter" },
  { from: "job", to: "domain" },
  { from: "recruiter", to: "threat_kb" },
  { from: "domain", to: "campaign" },
  { from: "threat_kb", to: "risk_engine" },
  { from: "campaign", to: "risk_engine" },
];

export const ThreatNetworkVisualization: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const getNode = (id: string) => NODES.find((n) => n.id === id)!;

  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Decorative Outer Shell */}
      <div className="rounded-xl border border-slate-800 bg-[#090d16]/90 backdrop-blur-md shadow-2xl overflow-hidden relative">
        {/* Terminal Header Bar */}
        <div className="bg-[#05080f] px-4 py-3 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="text-slate-500 ml-2">CORRELATION_TOPOLOGY.v2</span>
          </div>
          <div className="flex items-center gap-2 text-[#00ff88]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE GRAPH</span>
          </div>
        </div>

        {/* SVG Network Canvas */}
        <div className="relative w-full aspect-[560/380] p-2">
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          <svg 
            viewBox="0 0 560 380" 
            className="w-full h-full overflow-visible"
            role="img"
            aria-label="JobShield Threat Network Topology: Job to Recruiter, Domain, Threat KB, Campaign, and Risk Engine"
          >
            <title>JobShield Threat Correlation Topology</title>
            <defs>
              <linearGradient id="gradient-blue-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Edges */}
            {EDGES.map((edge, idx) => {
              const start = getNode(edge.from);
              const end = getNode(edge.to);
              const isFlowing = 
                (activeStep === 0 && edge.from === "job") ||
                (activeStep === 1 && (edge.from === "recruiter" || edge.from === "domain")) ||
                (activeStep >= 2 && (edge.to === "risk_engine"));

              return (
                <g key={`edge-${edge.from}-${edge.to}`}>
                  {/* Background base edge */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="rgba(51, 65, 85, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Animated Flow Pulse Line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isFlowing ? "#00ff88" : "rgba(100, 116, 139, 0.3)"}
                    strokeWidth={isFlowing ? "2" : "1"}
                    strokeDasharray="6 8"
                    className={isFlowing ? "animate-[data-flow_1.5s_linear_infinite]" : ""}
                    filter={isFlowing ? "url(#glow)" : undefined}
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const Icon = node.icon;
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Outer pulse circle */}
                  <circle
                    r="24"
                    fill={node.glowColor}
                    className="animate-[node-pulse_3s_ease-in-out_infinite]"
                  />
                  {/* Core circle */}
                  <circle
                    r="18"
                    fill="#05080f"
                    stroke={node.borderColor}
                    strokeWidth="1.5"
                  />
                  {/* Center Dot or Icon */}
                  <circle
                    r="4"
                    fill={node.color}
                  />

                  {/* Labels */}
                  <text
                    y="-26"
                    textAnchor="middle"
                    className="text-[10px] font-mono font-semibold tracking-wider fill-slate-200"
                  >
                    {node.label}
                  </text>
                  <text
                    y="-15"
                    textAnchor="middle"
                    className="text-[8px] font-mono fill-slate-500"
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Live Evidence Ticker in Terminal */}
          <div className="absolute bottom-3 left-3 right-3 bg-[#05080f]/95 border border-slate-800 rounded-lg p-3 font-mono text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="text-[#00ff88] font-bold">SIGNAL:</span>
              <span className="text-slate-300 truncate">
                {activeStep === 0 && "Parsing target document for risk indicators..."}
                {activeStep === 1 && "Verifying recruiter identity against legitimate domain..."}
                {activeStep === 2 && "Querying threat intelligence vector embeddings..."}
                {activeStep === 3 && "Matching recurring campaign fingerprint in knowledge base..."}
                {activeStep === 4 && "Evaluating deterministic risk score rules (riskSignalRules)..."}
                {activeStep === 5 && "Scam campaign cluster confirmed: Advance Fee Pattern"}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px]">
              <ShieldAlert className="w-3 h-3" />
              <span>ACTIVE INTEL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute -z-10 -inset-4 bg-gradient-to-tr from-[#00ff88]/5 via-blue-500/5 to-purple-500/5 blur-2xl rounded-3xl pointer-events-none" />
    </div>
  );
};
