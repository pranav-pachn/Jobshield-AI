"use client";

import { useState } from "react";
import Link from "next/link";
import { EvidenceBundle, Signal, ThreatMatch } from "@/lib/investigationTypes";
import { Shield, FileText, UserSearch, AlertCircle, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from "lucide-react";

interface EvidenceBundleViewProps {
  bundle?: EvidenceBundle;
}

function formatSignalName(name: string): string {
  if (!name) return "Detected Signal";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function EvidenceBundleView({ bundle }: EvidenceBundleViewProps) {
  const [expandedTech, setExpandedTech] = useState<Record<string, boolean>>({});

  if (!bundle) return null;

  const hasEvidence = 
    (bundle.contentEvidence && bundle.contentEvidence.length > 0) || 
    (bundle.recruiterEvidence && bundle.recruiterEvidence.length > 0) || 
    (bundle.threatEvidence && bundle.threatEvidence.length > 0);

  if (!hasEvidence) {
    return (
      <div className="mt-8 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 text-center font-mono">
          FLAGGED SIGNALS & EVIDENCE
        </h3>
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">No strong evidence signals detected across all investigators.</p>
        </div>
      </div>
    );
  }

  const toggleTech = (key: string) => {
    setExpandedTech((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSignalCard = (signal: Signal, sourceTitle: string, Icon: any, iconColor: string, keyPrefix: string) => {
    const cardKey = `${keyPrefix}-${signal.signal}`;
    const isTechOpen = Boolean(expandedTech[cardKey]);
    const isHigh = signal.severity === "critical" || signal.severity === "high";
    const isMedium = signal.severity === "medium";

    return (
      <div key={cardKey} className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col gap-3 shadow-md hover:border-slate-700/80 transition-colors">
        {/* Top: Signal Title and Severity Badge */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-2.5 w-2.5 rounded-full ${
              isHigh ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
              isMedium ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
              "bg-slate-400"
            }`} />
            <h4 className="font-semibold text-slate-100 text-sm font-sans">
              {formatSignalName(signal.signal)}
            </h4>
          </div>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
            isHigh ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            isMedium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-slate-800 text-slate-300 border border-slate-700"
          }`}>
            {signal.severity}
          </span>
        </div>

        {/* Primary Evidence Quote (Clear and readable) */}
        {signal.evidence && (
          <div className="p-3 bg-black/40 rounded-lg border border-slate-800/60 font-mono text-xs text-slate-300 italic leading-relaxed">
            "{signal.evidence}"
          </div>
        )}

        {/* Progressive Disclosure: Technical details toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => toggleTech(cardKey)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono flex items-center gap-1"
          >
            {isTechOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isTechOpen ? "Hide technical telemetry" : "Technical details"}
          </button>

          {isTechOpen && (
            <div className="mt-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-200">
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Confidence</span>
                <span className="text-slate-300 font-semibold">{Math.round(signal.confidence * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Source Agent</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <Icon className={`h-3 w-3 ${iconColor}`} />
                  {sourceTitle}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderThreatCard = (threat: ThreatMatch) => {
    const cardKey = `threat-${threat.sourceId}`;
    const isTechOpen = Boolean(expandedTech[cardKey]);
    const isHigh = threat.relevance === "high";

    return (
      <div key={cardKey} className="p-5 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col gap-3 shadow-md hover:border-slate-700/80 transition-colors">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-2.5 w-2.5 rounded-full ${
              isHigh ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            }`} />
            <h4 className="font-semibold text-slate-100 text-sm font-sans">
              Known Threat Match: {threat.sourceId}
            </h4>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {threat.relevance} Relevance
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Matched against historical threat intelligence database with {Math.round(threat.similarity * 100)}% semantic vector similarity.
        </p>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleTech(cardKey)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-mono flex items-center gap-1"
          >
            {isTechOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isTechOpen ? "Hide technical telemetry" : "Technical details"}
          </button>

          <Link 
            href={`/threat-intelligence?search=${encodeURIComponent(threat.sourceId)}`}
            className="text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors flex items-center gap-1"
          >
            Intelligence Database
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isTechOpen && (
          <div className="mt-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-200">
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Similarity Score</span>
              <span className="text-slate-300 font-semibold">{(threat.similarity * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Evidence Quality</span>
              <span className="text-slate-300 font-semibold">{threat.evidenceQuality}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-12 mb-8 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#00ff88]" />
          Why This Job Was Flagged (Evidence & Signals)
        </h3>
        <span className="text-xs font-mono text-slate-500">
          Progressive Disclosure
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundle.contentEvidence && bundle.contentEvidence.map(s => 
          renderSignalCard(s, "Content Investigator", FileText, "text-blue-400", "content")
        )}
        
        {bundle.recruiterEvidence && bundle.recruiterEvidence.map(s => 
          renderSignalCard(s, "Recruiter Investigator", UserSearch, "text-purple-400", "recruiter")
        )}

        {bundle.threatEvidence && bundle.threatEvidence.map(t => 
          renderThreatCard(t)
        )}
      </div>
    </div>
  );
}

