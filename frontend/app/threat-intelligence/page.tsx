"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Network, Users, Building2, Globe, ArrowRight } from "lucide-react";
import { ThreatSearch } from "@/components/intelligence/ThreatSearch";
import { ThreatFilters } from "@/components/intelligence/ThreatFilters";
import { ThreatResults } from "@/components/intelligence/ThreatResults";
import { useThreatIndicators, useThreatStats } from "@/hooks/useThreatIndicators";
import { MetricCard } from "@/components/security/MetricCard";
import Link from "next/link";

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
      <div className="flex-1 space-y-10 p-6 md:p-10 bg-background min-h-screen max-w-6xl mx-auto">
        {/* Header section */}
        <div className="space-y-1.5 border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl font-serif text-slate-100 tracking-tight">Threat Intelligence</h1>
          <p className="text-sm text-slate-400 font-sans">
            Search across JobShield's investigated threat network, domains, identities, and scam patterns.
          </p>
        </div>

        {/* 1. SEARCH */}
        <div className="bg-surface-elevated p-5 sm:p-6 rounded-lg border border-slate-800/80 shadow-sm">
          <div className="space-y-4">
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

        {/* 2. EXPLORE INTELLIGENCE */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-serif text-slate-100 tracking-tight">Explore Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link href="/campaigns" className="p-5 rounded-lg border border-slate-800/80 bg-surface-elevated hover:border-blue-500/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-md">
                  <Network className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-serif text-slate-100 mb-2">Threat Campaigns</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed flex-1">
                Track coordinated scam networks and shared infrastructure.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end text-blue-400 text-xs font-semibold items-center gap-1 group-hover:text-blue-300 transition-colors">
                View campaigns <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link href="/recruiters" className="p-5 rounded-lg border border-slate-800/80 bg-surface-elevated hover:border-indigo-500/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-md">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-serif text-slate-100 mb-2">Recruiters</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed flex-1">
                Investigate recruiter identities, contact channels, and threat associations.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end text-indigo-400 text-xs font-semibold items-center gap-1 group-hover:text-indigo-300 transition-colors">
                Explore recruiters <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            <Link href="/company-check" className="p-5 rounded-lg border border-slate-800/80 bg-surface-elevated hover:border-emerald-500/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-md">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-serif text-slate-100 mb-2">Company Verification</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed flex-1">
                Verify corporate entities and detect impersonation or suspicious domains.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end text-emerald-400 text-xs font-semibold items-center gap-1 group-hover:text-emerald-300 transition-colors">
                Verify a company <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>

        {/* 3. THREAT OVERVIEW */}
        {stats && (
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h2 className="text-xl font-serif text-slate-100 tracking-tight">Threat Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard title="Malicious Domains" value={stats.byType?.DOMAIN || 0} icon={Globe} accentColor="danger" />
              <MetricCard title="Suspicious Emails" value={stats.byType?.EMAIL || 0} icon={Users} accentColor="warning" />
              <MetricCard title="Threat Comms" value={(stats.byType?.TELEGRAM || 0) + (stats.byType?.WHATSAPP || 0) + (stats.byType?.PHONE || 0)} icon={Network} accentColor="warning" />
              <MetricCard title="Scam Phrases" value={stats.byType?.SCAM_PHRASE || 0} icon={Network} accentColor="danger" />
            </div>
          </div>
        )}

        {/* 4. INDICATOR REPOSITORY */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div>
            <h2 className="text-xl font-serif text-slate-100 tracking-tight">
              Indicator Repository
            </h2>
          </div>
          
          <div className="mt-4">
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
