"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VerdictHeader } from "@/components/investigation/VerdictHeader";
import { InvestigationTimeline } from "@/components/investigation/InvestigationTimeline";
import { RiskBreakdown } from "@/components/investigation/explainabilityV2/RiskBreakdown";
import { EvidenceSummary } from "@/components/investigation/explainabilityV2/EvidenceSummary";
import { EvidenceCard } from "@/components/investigation/explainabilityV2/EvidenceCard";
import { ConfidenceIndicator } from "@/components/investigation/explainabilityV2/ConfidenceIndicator";
import { ContradictionsView } from "@/components/investigation/ContradictionsView";
import { InvestigationReplay } from "@/components/investigation/InvestigationReplay";
import { FeedbackPanel } from "@/components/investigation/explainabilityV2/FeedbackPanel";
import { PlayCircle } from "lucide-react";

export default function InvestigationPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchInvestigation = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${getBackendUrl()}/api/investigations/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch investigation");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestigation();
  }, [id]);

  return (
    <AuthGuard>
      <div className="flex-1 bg-slate-950 min-h-screen p-8 pt-6">
        <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
          <Link href="/reports">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              ← Back to Reports
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            {data && data.mode && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase ${
                data.mode === 'LIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                data.mode === 'DEGRADED' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                data.mode === 'MOCK' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {data.mode === 'LIVE' ? '● LIVE INTELLIGENCE' :
                 data.mode === 'DEGRADED' ? '⚠ DEGRADED ANALYSIS' :
                 data.mode === 'MOCK' ? 'TEST MOCK AGENT' :
                 'DISABLED'}
              </div>
            )}
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-1 rounded">
              Trace ID: {id}
            </div>
            {data && data.replayEvents && data.replayEvents.length > 0 && (
              <Button 
                onClick={() => setIsReplaying(!isReplaying)} 
                variant={isReplaying ? "default" : "outline"}
                className={isReplaying ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800"}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isReplaying ? "Exit Replay" : "Replay Investigation"}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
            <p>Loading investigation trace...</p>
          </div>
        ) : error ? (
          <div className="max-w-5xl mx-auto bg-red-900/20 border border-red-500/30 p-8 rounded-xl text-center text-red-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Error Loading Investigation</h3>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {isReplaying && data.replayEvents ? (
              <div className="mb-12">
                <InvestigationReplay 
                  events={data.replayEvents} 
                  campaignData={data.campaigns?.[0]} 
                  entityData={data.recruiter ? { type: 'recruiter', value: data.recruiter.name } : null}
                />
              </div>
            ) : (
              <>
                <VerdictHeader 
                  finalDecision={{ 
                    verdict: data.verdict?.label || data.analysis?.riskLevel || "INCONCLUSIVE", 
                    riskScore: data.verdict?.riskScore || data.analysis?.riskScore || 0, 
                    confidence: (data.verdict?.confidence || data.analysis?.confidence || 0) / 100,
                  } as any} 
                />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <EvidenceSummary 
                  evidence={data.explainability?.evidence || []} 
                  contradictions={data.explainability?.contradictions || []} 
                />
                
                {data.explainability?.contradictions && data.explainability.contradictions.length > 0 && (
                  <ContradictionsView trace={data} />
                )}
                
                <EvidenceCard evidence={data.explainability?.evidence || []} />
              </div>
              
              <div className="space-y-6">
                <ConfidenceIndicator 
                  confidence={data.analysis.confidence} 
                  quality={data.explainability?.evidenceQuality || 50} 
                />
                
                <RiskBreakdown breakdown={data.explainability?.riskBreakdown || []} />
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Original Job Text</h3>
                  <div className="text-sm text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono bg-slate-950 p-3 rounded border border-slate-800">
                    {data.job_text || "No text available"}
                  </div>
                </div>
                
                <FeedbackPanel analysisId={id as string} />
              </div>
            </div>
            
            {data.explainability?.timeline && data.explainability.timeline.length > 0 && (
              <div className="mt-8">
                <InvestigationTimeline events={data.explainability.timeline} />
              </div>
            )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
