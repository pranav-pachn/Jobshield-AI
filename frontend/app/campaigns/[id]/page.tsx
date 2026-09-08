"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { EntityHeader } from "@/components/intelligence/EntityHeader";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChevronLeft, Network, Link as LinkIcon, ShieldAlert, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function CampaignDossierPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchCampaign = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${getBackendUrl()}/api/campaigns/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch campaign intelligence");
        const data = await res.json();
        setCampaign(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#050912] flex items-center justify-center flex-col gap-4">
          <LoadingSpinner message="Decrypting campaign dossier..." size="lg" />
        </div>
      </AuthGuard>
    );
  }

  if (error || !campaign) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#050912] p-8 md:p-12 pt-6">
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center text-red-400 font-mono">
            <h2 className="text-xl font-bold mb-2">INTELLIGENCE SOURCE UNAVAILABLE</h2>
            <p className="mb-4">Unable to retrieve campaign intelligence.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/50 transition-colors uppercase tracking-widest text-xs font-bold">
              [Retry]
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex-1 space-y-6 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
          <Link href="/threat-intelligence" className="hover:text-blue-400 transition-colors">INTELLIGENCE</Link>
          <span>/</span>
          <Link href="/campaigns" className="hover:text-blue-400 transition-colors">CAMPAIGNS</Link>
          <span>/</span>
          <span className="text-slate-300">{campaign.campaignId}</span>
        </div>

        <button onClick={() => router.push('/campaigns')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Campaigns
        </button>

        <EntityHeader
          type="CAMPAIGN"
          id={campaign.campaignId}
          title={campaign.name}
          riskLevel={campaign.riskLevel}
          status={campaign.status === "CONFIRMED" ? "ANALYST CONFIRMED" : campaign.status}
          confidence={campaign.confidence}
          icon={Network}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          
          {/* Left Column: Correlation & Timeline */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                Correlation Summary
              </h3>
              <p className="text-sm text-slate-300 mb-4">This campaign was linked through deterministic pattern matching on the following shared infrastructure:</p>
              
              <ul className="space-y-3 font-mono text-sm">
                <li className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                  <span>✓</span> {campaign.sharedDomains?.length || 0} Shared Domains
                </li>
                <li className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                  <span>✓</span> {campaign.sharedEmails?.length || 0} Shared Emails
                </li>
                <li className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                  <span>✓</span> {campaign.sharedPhones?.length || 0} Shared Phones
                </li>
                <li className="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/50">
                  <span>✓</span> {campaign.sharedSignals?.length || 0} Shared Scam Signals
                </li>
              </ul>
            </div>

            <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Timeline
              </h3>
              <div className="space-y-4 text-sm font-mono relative pl-4 border-l border-slate-800">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-500 block text-xs">{new Date(campaign.firstObserved).toLocaleDateString()}</span>
                  <span className="text-slate-300">First observed</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-500 block text-xs">{new Date(campaign.lastObserved).toLocaleDateString()}</span>
                  <span className="text-slate-300">Last activity detected</span>
                </div>
                {campaign.status === "CONFIRMED" && (
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-slate-500 block text-xs">{new Date(campaign.updatedAt).toLocaleDateString()}</span>
                    <span className="text-emerald-400 font-bold">Analyst confirmed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Shared Indicators & Entities */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                Shared Indicators
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.sharedDomains?.map((d: string, i: number) => (
                      <span key={i} className="text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded">[{d}]</span>
                    ))}
                    {(!campaign.sharedDomains || campaign.sharedDomains.length === 0) && <span className="text-xs text-slate-600">None detected</span>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Emails</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.sharedEmails?.map((e: string, i: number) => (
                      <span key={i} className="text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded">[{e}]</span>
                    ))}
                    {(!campaign.sharedEmails || campaign.sharedEmails.length === 0) && <span className="text-xs text-slate-600">None detected</span>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Scam Signals</h4>
                  <div className="flex flex-wrap gap-2">
                    {campaign.sharedSignals?.map((s: string, i: number) => (
                      <span key={i} className="text-xs font-mono bg-red-950 border border-red-900/50 text-red-300 px-2 py-1 rounded">[{s}]</span>
                    ))}
                    {(!campaign.sharedSignals || campaign.sharedSignals.length === 0) && <span className="text-xs text-slate-600">None detected</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-400" />
                  Linked Investigations ({campaign.linkedInvestigationIds?.length || 0})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {campaign.linkedInvestigationIds?.map((inv: any, i: number) => (
                    <Link key={i} href={`/investigations/${inv.investigationId}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-colors group">
                      <div className="font-mono text-xs text-slate-300 group-hover:text-blue-400 transition-colors">{inv.investigationId}</div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold ${
                        inv.finalDecision === 'CRITICAL' ? 'text-red-400 border-red-500/30' :
                        inv.finalDecision === 'HIGH' ? 'text-orange-400 border-orange-500/30' :
                        'text-amber-400 border-amber-500/30'
                      }`}>
                        {inv.finalDecision}
                      </Badge>
                    </Link>
                  ))}
                  {(!campaign.linkedInvestigationIds || campaign.linkedInvestigationIds.length === 0) && (
                    <div className="text-sm text-slate-600 font-mono">No linked investigations found.</div>
                  )}
                </div>
              </div>

              <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400" />
                  Threat Actors ({campaign.linkedRecruiterProfileIds?.length || 0})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {campaign.linkedRecruiterProfileIds?.map((rec: any, i: number) => (
                    <Link key={i} href={`/recruiters/${rec._id}`} className="block p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-colors group">
                      <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 truncate mb-1">
                        {rec.names && rec.names.length > 0 ? rec.names[0] : (rec.emails && rec.emails.length > 0 ? rec.emails[0] : 'Unknown Identity')}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-500 font-mono">{rec.totalInvestigations || 0} Investigations</span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${
                          rec.riskLevel === 'CRITICAL' ? 'text-red-400 border-red-500/30' :
                          rec.riskLevel === 'HIGH' ? 'text-orange-400 border-orange-500/30' :
                          'text-amber-400 border-amber-500/30'
                        }`}>
                          {rec.riskLevel}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                  {(!campaign.linkedRecruiterProfileIds || campaign.linkedRecruiterProfileIds.length === 0) && (
                    <div className="text-sm text-slate-600 font-mono">No identified actors found.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
