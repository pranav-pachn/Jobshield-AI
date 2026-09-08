"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Network, Search, AlertTriangle, ShieldCheck, Link as LinkIcon, Calendar, ArrowRight } from "lucide-react";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { MetricCard } from "@/components/security/MetricCard";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch(`${getBackendUrl()}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.campaignId.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = campaigns.length;
  const confirmedCount = campaigns.filter(c => c.status === "CONFIRMED").length;
  const highRiskCount = campaigns.filter(c => c.riskLevel === "CRITICAL" || c.riskLevel === "HIGH").length;
  const linkedInvCount = campaigns.reduce((acc, c) => acc + (c.linkedInvestigationIds?.length || 0), 0);

  return (
    <AuthGuard>
      <div className="flex-1 space-y-8 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
            <Network className="w-4 h-4" />
            Threat Campaigns
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Campaign Intelligence</h1>
          <p className="text-sm text-slate-400 font-mono">Track and analyze coordinated multi-job scam networks</p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Loading threat campaigns..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center text-red-400 font-mono">
            INTELLIGENCE SOURCE UNAVAILABLE<br/>{error}
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Active Campaigns" value={activeCount} icon={Network} accentColor="primary" />
              <MetricCard title="Confirmed" value={confirmedCount} icon={ShieldCheck} accentColor="success" />
              <MetricCard title="High Risk" value={highRiskCount} icon={AlertTriangle} accentColor="danger" />
              <MetricCard title="Linked Investigations" value={linkedInvCount} icon={LinkIcon} accentColor="warning" />
            </div>

            {/* Search */}
            <div className="bg-[#080f1d] p-4 rounded-xl border border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search campaign / domain / recruiter..." 
                className="bg-transparent border-none outline-none flex-1 text-slate-200 font-mono text-sm placeholder:text-slate-600"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 border-b border-slate-800 pb-2">Active Threat Campaigns</h2>
              
              {filteredCampaigns.length === 0 ? (
                <div className="p-12 text-center border border-slate-800 border-dashed rounded-xl">
                  <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">NO CAMPAIGNS DETECTED</p>
                  <p className="text-slate-600 text-sm mt-2">No correlated threat campaigns are currently available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCampaigns.map(c => (
                    <div key={c._id} className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] hover:border-blue-500/50 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-blue-400 font-mono font-bold tracking-widest mb-1">{c.campaignId}</div>
                        <h3 className="text-lg font-bold text-slate-100 mb-4">{c.name}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          <span className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded border ${
                            c.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                            c.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>● {c.riskLevel}</span>
                          {c.status === "CONFIRMED" && (
                            <span className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                              ● ANALYST CONFIRMED
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-400 mb-6">
                          <div><strong className="text-white">{c.linkedInvestigationIds?.length || 0}</strong> Investigations</div>
                          <div><strong className="text-white">{c.linkedRecruiterProfileIds?.length || 0}</strong> Recruiters</div>
                          <div><strong className="text-white">{c.sharedDomains?.length || 0}</strong> Domains</div>
                          <div><strong className="text-white">{c.sharedSignals?.length || 0}</strong> Signals</div>
                        </div>

                        {c.sharedSignals && c.sharedSignals.length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Shared Signals</div>
                            <div className="flex flex-wrap gap-2">
                              {c.sharedSignals.slice(0, 3).map((sig: string, i: number) => (
                                <span key={i} className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded font-mono">[{sig}]</span>
                              ))}
                              {c.sharedSignals.length > 3 && <span className="text-[10px] text-slate-500 py-1">+{c.sharedSignals.length - 3} more</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                        <Link href={`/campaigns/${c.campaignId}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
                          VIEW DOSSIER <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
