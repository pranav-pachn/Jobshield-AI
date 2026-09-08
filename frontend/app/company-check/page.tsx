"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Building2, Search, AlertTriangle, ShieldCheck, Globe, Calendar } from "lucide-react";
import { getBackendUrl } from "@/lib/apiConfig";
import { getStoredToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EntityExplainPanel } from "@/components/intelligence/EntityExplainPanel";
import { MetricCard } from "@/components/security/MetricCard";
import { Badge } from "@/components/ui/badge";

export default function CompanyCheckPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [domainIntel, setDomainIntel] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError("");
    setDomainIntel(null);
    
    try {
      const token = getStoredToken();
      
      const res = await fetch(`${getBackendUrl()}/api/domains/analyze`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ domain: search })
      });
      
      if (!res.ok) throw new Error("Failed to analyze domain infrastructure");
      const data = await res.json();
      setDomainIntel(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const domainStr = domainIntel?.domain || search;

  return (
    <AuthGuard>
      <div className="flex-1 space-y-8 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
            <Building2 className="w-4 h-4" />
            Corporate Infrastructure
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Company Intelligence</h1>
          <p className="text-sm text-slate-400 font-mono">Verify corporate domains and associated internal threat intelligence</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-[#080f1d] p-6 rounded-xl border border-slate-800 space-y-4 shadow-xl">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block">Domain Search</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Enter company domain (e.g., example.com)..." 
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
              Analyze
            </button>
          </div>
        </form>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Querying global infrastructure OSINT..." />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center text-red-400 font-mono">
            INTELLIGENCE SOURCE UNAVAILABLE<br/>{error}
          </div>
        ) : domainIntel ? (
          <div className="space-y-6">
            
            {/* Trust Score Header */}
            <div className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] relative overflow-hidden shadow-xl">
              <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 mb-1 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> DOMAIN
                  </div>
                  <h2 className="text-3xl font-black text-slate-100 tracking-tight">{domainIntel.domain}</h2>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                      domainIntel.trustScore?.level === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                      domainIntel.trustScore?.level === 'HIGH' ? 'text-orange-400 border-orange-500/30 bg-orange-500/10' :
                      domainIntel.trustScore?.level === 'LOW' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                      'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}>
                      ● {domainIntel.trustScore?.level || 'UNKNOWN'} RISK
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-1">Trust Score</div>
                  <div className="text-4xl font-black text-white">{domainIntel.trustScore?.score || 0}<span className="text-slate-500 text-xl">/100</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* OSINT Data */}
              <div className="bg-[#080f1d] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Infrastructure OSINT
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase mb-1">Domain Age</div>
                    <div className="text-lg font-mono text-slate-200">
                      {domainIntel.whoisData?.domainAge ? `${domainIntel.whoisData.domainAge} days` : 'Unknown'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase mb-1">SSL Certificate</div>
                    <div className={`text-lg font-mono ${domainIntel.sslCertificate?.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {domainIntel.sslCertificate?.valid ? 'VALID' : 'INVALID'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase mb-1">VirusTotal Flags</div>
                    <div className={`text-lg font-mono ${domainIntel.virusTotal?.malicious > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {domainIntel.virusTotal?.malicious || 0}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase mb-1">SafeBrowsing</div>
                    <div className={`text-lg font-mono ${domainIntel.safeBrowsing?.safe ? 'text-emerald-400' : 'text-red-400'}`}>
                      {domainIntel.safeBrowsing?.safe ? 'CLEAN' : 'FLAGGED'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Intelligence Integration */}
              <div>
                <EntityExplainPanel entityType="domain" entityValue={domainStr} />
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
