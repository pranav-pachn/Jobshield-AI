import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon, ShieldAlert, ShieldCheck, AlertTriangle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface UrlIntelligenceData {
  is_url: boolean;
  original_url: string;
  domain: string;
  platform: string;
  platform_trust: "High" | "Medium" | "Low";
  url_risk: "High" | "Medium" | "Low";
  url_risk_reason?: string;
  fetch_successful: boolean;
}

interface JobSourcePanelProps {
  urlIntelligence: UrlIntelligenceData;
}

export function JobSourcePanel({ urlIntelligence }: JobSourcePanelProps) {
  if (!urlIntelligence || !urlIntelligence.is_url) return null;

  const { original_url, domain, platform, platform_trust, url_risk, url_risk_reason, fetch_successful } = urlIntelligence;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'Medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'Low': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getTrustIcon = (trust: string) => {
    switch (trust) {
      case 'High': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'Medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Low': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="glass-card border-white/10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
      <CardHeader className="bg-black/20 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-mono flex items-center gap-2 text-blue-100">
            <LinkIcon className="w-5 h-5 text-blue-400" />
            Job Source Intelligence
          </CardTitle>
          <div className="flex gap-2">
            {!fetch_successful && (
               <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                 Anti-Bot Active (Limited Scan)
               </Badge>
            )}
            <Badge variant="outline" className={`text-xs ${getRiskColor(url_risk)}`}>
              URL Risk: {url_risk}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        
        {/* Source URL */}
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 font-mono text-sm break-all">
          <span className="text-blue-400 mr-2 flex-shrink-0">URL:</span>
          <a href={original_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline decoration-white/20 underline-offset-4">
            {original_url}
          </a>
        </div>

        {/* Platform Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-gray-400 font-mono mb-1">PLATFORM / DOMAIN</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-200">{platform}</span>
              <span className="text-xs text-gray-500">({domain})</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-gray-400 font-mono mb-1">PLATFORM TRUST</p>
            <div className="flex items-center gap-2">
              {getTrustIcon(platform_trust)}
              <span className={`font-semibold ${
                platform_trust === 'High' ? 'text-emerald-400' : 
                platform_trust === 'Medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {platform_trust} Trust
              </span>
            </div>
          </div>
        </div>

        {/* Risk Reason if Medium/High */}
        {url_risk_reason && (url_risk === 'High' || url_risk === 'Medium') && (
          <div className={`mt-2 p-3 rounded-lg border text-sm ${
            url_risk === 'High' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200'
          }`}>
            <strong className="block mb-1 font-mono text-xs opacity-80">RISK FACTOR IDENTIFIED:</strong>
            {url_risk_reason}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
