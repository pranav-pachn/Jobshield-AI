"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Shield, AlertTriangle, Building2, Globe, Mail, Phone, MessageCircle } from "lucide-react";
import { ThreatSearch } from "@/components/intelligence/ThreatSearch";
import { ThreatFilters } from "@/components/intelligence/ThreatFilters";
import { ThreatResults } from "@/components/intelligence/ThreatResults";
import { useThreatIndicators, useThreatStats } from "@/hooks/useThreatIndicators";
import { Card, CardContent } from "@/components/ui/card";

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
    setPage(1); // Reset to page 1 on new search
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1); // Reset to page 1 on new filter
  };

  return (
    <AuthGuard>
      <div className="flex-1 space-y-6 p-8 md:p-12 pt-6 bg-slate-950 min-h-screen">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              Threat Intelligence
            </h2>
            <p className="text-slate-400 mt-2 text-lg">
              Search and analyze known threat indicators across all investigations.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Globe className="h-5 w-5 text-blue-400" />} label="Domains" value={stats.byType?.DOMAIN || 0} />
            <StatCard icon={<Mail className="h-5 w-5 text-indigo-400" />} label="Emails" value={stats.byType?.EMAIL || 0} />
            <StatCard icon={<MessageCircle className="h-5 w-5 text-emerald-400" />} label="Comms" value={(stats.byType?.TELEGRAM || 0) + (stats.byType?.WHATSAPP || 0) + (stats.byType?.PHONE || 0)} />
            <StatCard icon={<AlertTriangle className="h-5 w-5 text-red-400" />} label="Phrases" value={stats.byType?.SCAM_PHRASE || 0} />
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
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

        {/* Results */}
        <div className="mt-8">
          <ThreatResults 
            indicators={indicators} 
            isLoading={isLoading} 
            pagination={pagination} 
            onPageChange={setPage} 
          />
        </div>
      </div>
    </AuthGuard>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <Card className="bg-slate-900/80 border-slate-800">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
