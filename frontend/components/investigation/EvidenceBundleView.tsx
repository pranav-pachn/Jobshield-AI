"use client";

import { EvidenceBundle, Signal, ThreatMatch } from "@/lib/investigationTypes";
import { Shield, FileText, UserSearch, AlertCircle, ExternalLink } from "lucide-react";

interface EvidenceBundleViewProps {
  bundle?: EvidenceBundle;
}

export function EvidenceBundleView({ bundle }: EvidenceBundleViewProps) {
  if (!bundle) return null;

  const hasEvidence = 
    (bundle.contentEvidence && bundle.contentEvidence.length > 0) || 
    (bundle.recruiterEvidence && bundle.recruiterEvidence.length > 0) || 
    (bundle.threatEvidence && bundle.threatEvidence.length > 0);

  if (!hasEvidence) {
    return (
      <div className="mt-8 mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">
          EVIDENCE BUNDLE
        </h3>
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
          <p className="text-slate-400">No strong evidence signals detected across all investigators.</p>
        </div>
      </div>
    );
  }

  const renderSignalCard = (signal: Signal, sourceTitle: string, Icon: any, iconColor: string) => (
    <div key={signal.signal} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 relative">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {signal.severity === "critical" || signal.severity === "high" ? (
            <span className="flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          ) : signal.severity === "medium" ? (
            <span className="flex h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          ) : (
            <span className="flex h-3 w-3 rounded-full bg-slate-500" />
          )}
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-sm">{signal.signal}</h4>
        </div>
        <span className="text-xs font-bold text-slate-400">{Math.round(signal.confidence * 100)}% confidence</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        <div className="flex flex-col gap-1">
          <span>Severity</span>
          <span className={`font-bold ${
            signal.severity === "critical" || signal.severity === "high" ? "text-red-400" :
            signal.severity === "medium" ? "text-amber-400" : "text-slate-300"
          }`}>{signal.severity}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>Source</span>
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Icon className={`h-3 w-3 ${iconColor}`} />
            {sourceTitle}
          </span>
        </div>
      </div>

      <div className="p-3 bg-black/40 rounded-lg border border-slate-800/60 font-mono text-sm text-slate-300 italic">
        "{signal.evidence}"
      </div>
    </div>
  );

  const renderThreatCard = (threat: ThreatMatch) => (
    <div key={threat.sourceId} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4 relative">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {threat.relevance === "high" ? (
            <span className="flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          ) : threat.relevance === "medium" ? (
            <span className="flex h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          ) : (
            <span className="flex h-3 w-3 rounded-full bg-slate-500" />
          )}
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-sm">{threat.sourceId}</h4>
        </div>
        <span className="text-xs font-bold text-slate-400">{Math.round(threat.similarity * 100)}% similarity</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        <div className="flex flex-col gap-1">
          <span>Relevance</span>
          <span className={`font-bold ${
            threat.relevance === "high" ? "text-red-400" :
            threat.relevance === "medium" ? "text-amber-400" : "text-slate-300"
          }`}>{threat.relevance}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>Quality</span>
          <span className="font-bold text-slate-300">{threat.evidenceQuality}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span>Source</span>
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-400" />
            Threat Intel
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors w-fit flex items-center gap-1 cursor-pointer">
        <ExternalLink className="h-3 w-3" />
        View original threat document
      </div>
    </div>
  );

  return (
    <div className="mt-12 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-center gap-2 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
        <Shield className="h-4 w-4" />
        Evidence Bundle
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundle.contentEvidence && bundle.contentEvidence.map(s => 
          renderSignalCard(s, "Content Investigator", FileText, "text-blue-400")
        )}
        
        {bundle.recruiterEvidence && bundle.recruiterEvidence.map(s => 
          renderSignalCard(s, "Recruiter Investigator", UserSearch, "text-purple-400")
        )}

        {bundle.threatEvidence && bundle.threatEvidence.map(t => 
          renderThreatCard(t)
        )}
      </div>
    </div>
  );
}
