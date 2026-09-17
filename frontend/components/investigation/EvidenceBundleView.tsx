"use client";

import { useState } from "react";
import Link from "next/link";
import { EvidenceBundle, Signal, ThreatMatch } from "@/lib/investigationTypes";
import { FileText, UserSearch, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

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
      <section aria-label="Key Evidence" className="space-y-4">
        <div>
          <h3 className="text-base font-serif text-slate-100 tracking-tight">Key Evidence</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Corroborating signals detected during automated analysis.</p>
        </div>
        <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800 text-center">
          <p className="text-slate-400 text-sm font-sans">No suspicious evidence signals detected across evaluated dimensions.</p>
        </div>
      </section>
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
      <div key={cardKey} className="p-4 sm:p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col gap-3 transition-colors hover:border-slate-700/80">
        {/* Top: Signal Title and Severity Badge */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
              isHigh ? "bg-red-500" :
              isMedium ? "bg-amber-500" :
              "bg-slate-400"
            }`} />
            <h4 className="font-medium text-slate-100 text-sm font-sans">
              {formatSignalName(signal.signal)}
            </h4>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
            isHigh ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            isMedium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-slate-800 text-slate-300 border border-slate-700"
          }`}>
            {signal.severity}
          </span>
        </div>

        {/* Primary Evidence Quote */}
        {signal.evidence && (
          <div className="p-3 bg-black/30 rounded border border-slate-800/70 font-sans text-xs text-slate-300 italic leading-relaxed">
            &ldquo;{signal.evidence}&rdquo;
          </div>
        )}

        {/* Progressive Disclosure: Technical details toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => toggleTech(cardKey)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-sans flex items-center gap-1"
          >
            {isTechOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isTechOpen ? "Hide technical telemetry" : "Technical details"}
          </button>

          {isTechOpen && (
            <div className="mt-3 p-3 bg-black/40 rounded border border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-200">
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Confidence</span>
                <span className="text-slate-300 font-semibold">{Math.round(signal.confidence * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Source Agent</span>
                <span className="text-slate-300 flex items-center gap-1 font-sans">
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
      <div key={cardKey} className="p-4 sm:p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col gap-3 transition-colors hover:border-slate-700/80">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
              isHigh ? "bg-red-500" : "bg-amber-500"
            }`} />
            <h4 className="font-medium text-slate-100 text-sm font-sans">
              Known Threat Pattern: <span className="font-mono text-xs text-purple-300">{threat.sourceId}</span>
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            {threat.relevance} Relevance
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Matched against historical threat repository with <span className="font-mono font-medium text-slate-100">{Math.round(threat.similarity * 100)}%</span> semantic pattern similarity.
        </p>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleTech(cardKey)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-sans flex items-center gap-1"
          >
            {isTechOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isTechOpen ? "Hide technical telemetry" : "Technical details"}
          </button>

          <Link 
            href={`/threat-intelligence?search=${encodeURIComponent(threat.sourceId)}`}
            className="text-xs text-blue-400 hover:text-blue-300 font-sans transition-colors flex items-center gap-1"
          >
            Threat Intelligence
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isTechOpen && (
          <div className="mt-2 p-3 bg-black/40 rounded border border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono animate-in fade-in duration-200">
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Similarity Score</span>
              <span className="text-slate-300 font-semibold">{(threat.similarity * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Evidence Quality</span>
              <span className="text-slate-300 font-semibold">{threat.evidenceQuality || "Standard"}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section aria-label="Key Evidence" className="space-y-4">
      <div>
        <h3 className="text-base font-serif text-slate-100 tracking-tight">Key Evidence</h3>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Specific indicators and corroborating findings extracted from content and telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundle.contentEvidence && bundle.contentEvidence.map(s => 
          renderSignalCard(s, "Content Analysis", FileText, "text-blue-400", "content")
        )}
        
        {bundle.recruiterEvidence && bundle.recruiterEvidence.map(s => 
          renderSignalCard(s, "Recruiter Verification", UserSearch, "text-purple-400", "recruiter")
        )}

        {bundle.threatEvidence && bundle.threatEvidence.map(t => 
          renderThreatCard(t)
        )}
      </div>
    </section>
  );
}
