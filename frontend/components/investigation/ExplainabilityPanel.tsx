"use client";

import { useEffect, useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Cpu, 
  Scale,
  BrainCircuit,
  FileSearch,
  Bot
} from "lucide-react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { InvestigationExplanation } from "@/lib/intelligenceTypes";

export function ExplainabilityPanel({ investigationId }: { investigationId: string }) {
  const [explanation, setExplanation] = useState<InvestigationExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("policy");

  useEffect(() => {
    intelligenceApi.getExplanation(investigationId)
      .then(setExplanation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [investigationId]);

  if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse bg-slate-900 rounded-xl border border-slate-800 h-64 flex items-center justify-center">Loading explanation layers...</div>;
  if (!explanation) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-rose-500";
    if (score >= 40) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center">
          <BrainCircuit className="w-5 h-5 mr-2 text-indigo-400" />
          Why was this detected?
        </h3>
      </div>
      
      <div className="divide-y divide-slate-800">
        
        {/* Layer 1: Decision Policy */}
        <div>
          <button 
            onClick={() => toggleSection("policy")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center">
              <Scale className="w-5 h-5 mr-3 text-emerald-400" />
              <div className="text-left">
                <h4 className="font-medium text-slate-200">1. Decision Policy</h4>
                <p className="text-xs text-slate-400 mt-0.5">The final rule or policy that triggered the verdict</p>
              </div>
            </div>
            {expandedSection === "policy" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          {expandedSection === "policy" && (
            <div className="px-5 pb-5 pt-2 ml-11">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold mb-2 ${
                      explanation.decisionPolicy.decision === 'SCAM' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      explanation.decisionPolicy.decision === 'LEGITIMATE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {explanation.decisionPolicy.decision}
                    </span>
                    <p className="text-slate-300 text-sm mt-2">{explanation.decisionPolicy.reason}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-xs text-slate-400 mb-1">Risk Score</div>
                    <div className={`text-xl font-bold ${getRiskColor(explanation.decisionPolicy.riskScore)}`}>
                      {explanation.decisionPolicy.riskScore.toFixed(0)}/100
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-mono">Policy Version: {explanation.decisionPolicy.policyVersion}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 2: Aggregated Evidence */}
        <div>
          <button 
            onClick={() => toggleSection("evidence")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center">
              <FileSearch className="w-5 h-5 mr-3 text-blue-400" />
              <div className="text-left">
                <h4 className="font-medium text-slate-200">2. Aggregated Evidence</h4>
                <p className="text-xs text-slate-400 mt-0.5">Summary of supporting signals and contradictions</p>
              </div>
            </div>
            {expandedSection === "evidence" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          {expandedSection === "evidence" && (
            <div className="px-5 pb-5 pt-2 ml-11 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex items-center">
                  <ShieldCheck className="w-8 h-8 text-blue-400 mr-3 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold text-slate-200">{explanation.evidence.supportingSignals}</div>
                    <div className="text-xs text-slate-400">Supporting Signals</div>
                  </div>
                </div>
                <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex items-center">
                  <AlertTriangle className={`w-8 h-8 mr-3 opacity-80 ${explanation.evidence.contradictions > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-2xl font-bold text-slate-200">{explanation.evidence.contradictions}</div>
                    <div className="text-xs text-slate-400">Contradictions</div>
                  </div>
                </div>
              </div>
              
              {explanation.evidence.missingEvidence.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">Missing Evidence</h5>
                  <ul className="space-y-1">
                    {explanation.evidence.missingEvidence.map((msg, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start">
                        <span className="text-rose-500 mr-2">•</span>
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Layer 3: Agent Findings */}
        <div>
          <button 
            onClick={() => toggleSection("agents")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center">
              <Bot className="w-5 h-5 mr-3 text-indigo-400" />
              <div className="text-left">
                <h4 className="font-medium text-slate-200">3. Individual Agent Findings</h4>
                <p className="text-xs text-slate-400 mt-0.5">Raw output from the multi-agent system</p>
              </div>
            </div>
            {expandedSection === "agents" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          {expandedSection === "agents" && (
            <div className="px-5 pb-5 pt-2 ml-11 space-y-3">
              {explanation.agentFindings.map((finding, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-slate-200 text-sm">{finding.agent}</div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span title="Confidence">{(finding.confidence * 100).toFixed(0)}% conf.</span>
                      <span title="Latency">{(finding.latencyMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{finding.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Layer 4: Signals */}
        <div>
          <button 
            onClick={() => toggleSection("signals")}
            className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center">
              <Search className="w-5 h-5 mr-3 text-amber-400" />
              <div className="text-left">
                <h4 className="font-medium text-slate-200">4. Raw Extracted Signals</h4>
                <p className="text-xs text-slate-400 mt-0.5">The atomic scam indicators found in the text</p>
              </div>
            </div>
            {expandedSection === "signals" ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          {expandedSection === "signals" && (
            <div className="px-5 pb-5 pt-2 ml-11">
              {explanation.signals.length === 0 ? (
                <div className="text-sm text-slate-500 italic p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-center">
                  No explicit risk signals detected.
                </div>
              ) : (
                <div className="space-y-2">
                  {explanation.signals.map((signal, idx) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-start">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 mr-3 ${
                        signal.severity === 'critical' ? 'bg-rose-600' :
                        signal.severity === 'high' ? 'bg-rose-500' :
                        signal.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />
                      <div>
                        <div className="font-medium text-slate-200 text-sm mb-1">
                          {signal.type}
                          <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                            {signal.source.split('_')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{signal.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
