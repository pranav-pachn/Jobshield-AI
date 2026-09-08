"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Users, Search, ArrowRight } from "lucide-react";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function RecruitersPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    
    try {
      const token = getStoredToken();
      // Simple heuristic: if it has @ it's email, if it has numbers only it's phone, else domain
      let queryType = "domain";
      if (search.includes("@")) queryType = "email";
      else if (/^\d+$/.test(search.replace(/\D/g, ""))) queryType = "phone";

      const res = await fetch(`${getBackendUrl()}/api/recruiter-profiles/search?${queryType}=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to search identities");
      const data = await res.json();
      setProfiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-8 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
            <Users className="w-4 h-4" />
            Identity Intelligence
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Recruiter Intelligence</h1>
          <p className="text-sm text-slate-400 font-mono">Investigate identities, contact methods, and threat associations</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-[#080f1d] p-6 rounded-xl border border-slate-800 space-y-4 shadow-xl">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">Identity Search</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search email, phone, or domain..." 
                className="w-full bg-[#050912] border border-slate-800 rounded-lg py-3 pl-12 pr-4 text-slate-200 font-mono text-sm placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !search.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold tracking-widest text-xs uppercase transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Querying identity databases..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center text-red-400 font-mono">
            INTELLIGENCE SOURCE UNAVAILABLE<br/>{error}
          </div>
        ) : hasSearched && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 border-b border-slate-800 pb-2">Threat Actors Found ({profiles.length})</h2>
            
            {profiles.length === 0 ? (
              <div className="p-12 text-center border border-slate-800 border-dashed rounded-xl">
                <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">NO IDENTITIES FOUND</p>
                <p className="text-slate-600 text-sm mt-2">No matching recruiter profiles were found in the intelligence database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profiles.map((p, idx) => {
                  const primaryIdentity = p.emails[0] || p.phones[0] || p.names[0] || "Unknown Identity";
                  
                  return (
                    <div key={p._id || idx} className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] hover:border-blue-500/50 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-100 mb-4 truncate" title={primaryIdentity}>{primaryIdentity}</div>
                        
                        <div className="flex flex-col gap-2 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                              <div 
                                className={`h-full ${p.riskScore >= 80 ? 'bg-red-500' : p.riskScore >= 60 ? 'bg-orange-500' : p.riskScore >= 35 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${p.riskScore}%` }} 
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-400">{p.riskScore || 0} / 100</span>
                          </div>
                          <Badge variant="outline" className={`w-fit text-[10px] uppercase font-bold ${
                            p.riskLevel === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                            p.riskLevel === 'HIGH' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                            p.riskLevel === 'MEDIUM' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                            'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          }`}>
                            {p.riskLevel}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-400 mb-6">
                          <div><strong className="text-white">{p.totalInvestigations || 0}</strong> Investigations</div>
                          <div><strong className="text-white">{p.suspiciousCount || 0}</strong> Suspicious</div>
                          <div><strong className="text-white">{p.confirmedScamCount || 0}</strong> Confirmed Scams</div>
                          <div><strong className="text-white">{p.linkedCampaignIds?.length || 0}</strong> Campaigns</div>
                        </div>

                        <div className="flex gap-4 text-xs font-mono text-slate-500 mb-6 border-t border-slate-800 pt-4">
                          <div>{p.domains?.length || 0} Domains</div>
                          <div>{p.companies?.length || 0} Companies</div>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-800 flex justify-end">
                        <Link href={`/recruiters/${p._id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1">
                          VIEW PROFILE <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
