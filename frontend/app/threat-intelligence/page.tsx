"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Shield, Network, Users, Building2, Globe } from "lucide-react";
import { ThreatSearch } from "@/components/intelligence/ThreatSearch";
import { ThreatFilters } from "@/components/intelligence/ThreatFilters";
import { ThreatResults } from "@/components/intelligence/ThreatResults";
import { useThreatIndicators, useThreatStats } from "@/hooks/useThreatIndicators";
import { MetricCard } from "@/components/security/MetricCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ThreatIntelligencePage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data: indicators, pagination, isLoading } = useThreatIndicators({
    query: searchQuery,
    type: selectedType,
    page,
  });

  const { stats } = useThreatStats();

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-8 p-8 md:p-12 pt-6 bg-[#050912] min-h-screen">
        {/* Header section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
            <Shield className="w-4 h-4" />
            Intelligence Center
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Threat Intelligence</h1>
          <p className="text-sm text-slate-400 font-mono">Centralized repository for threat actors, campaigns, and indicators of compromise.</p>
        </div>

        {/* Intelligence Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/campaigns" className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Network className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Threat Campaigns</h3>
            <p className="text-sm text-slate-400 font-mono">Track coordinated multi-job scam networks and their shared infrastructure.</p>
          </Link>

          <Link href="/recruiters" className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Recruiters</h3>
            <p className="text-sm text-slate-400 font-mono">Investigate specific identities, contact methods, and threat associations.</p>
          </Link>

          <Link href="/company-check" className="card-primary p-6 rounded-xl border border-slate-800 bg-[#080f1d] hover:border-blue-500/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Companies</h3>
            <p className="text-sm text-slate-400 font-mono">Verify corporate entities and detect spoofed or malicious company domains.</p>
          </Link>
        </div>

        {/* Global Stats Row */}
        {stats && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 border-b border-slate-800 pb-2">Global Indicators</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Malicious Domains" value={stats.byType?.DOMAIN || 0} icon={Globe} accentColor="danger" />
              <MetricCard title="Suspicious Emails" value={stats.byType?.EMAIL || 0} icon={Users} accentColor="warning" />
              <MetricCard title="Threat Comms" value={(stats.byType?.TELEGRAM || 0) + (stats.byType?.WHATSAPP || 0) + (stats.byType?.PHONE || 0)} icon={Network} accentColor="warning" />
              <MetricCard title="Scam Phrases" value={stats.byType?.SCAM_PHRASE || 0} icon={Shield} accentColor="danger" />
            </div>
          </div>
        )}

        {/* Indicator Search */}
        <div className="space-y-4 mt-12">
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500 border-b border-slate-800 pb-2">Indicator Search</h2>
          
          <div className="bg-[#080f1d] p-6 rounded-xl border border-slate-800 shadow-xl">
            <div className="space-y-6">
              <ThreatSearch 
                value={searchInput} 
                onChange={setSearchInput} 
                onSearch={handleSearch} 
              />
              <ThreatFilters 
                selectedType={selectedType} 
                onTypeChange={handleTypeChange} 
              />
            </div>
          </div>

          <div className="mt-8">
            <ThreatResults 
              indicators={indicators} 
              isLoading={isLoading} 
              pagination={pagination} 
              onPageChange={setPage} 
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
