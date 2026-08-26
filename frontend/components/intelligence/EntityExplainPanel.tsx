import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Link as LinkIcon, Calendar, Info, Target, Users } from 'lucide-react';
import axios from 'axios';

interface EntityExplainPanelProps {
  entityType: 'domain' | 'email' | 'phone' | 'recruiter';
  entityValue: string;
}

export function EntityExplainPanel({ entityType, entityValue }: EntityExplainPanelProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchExplainability = async () => {
      setLoading(true);
      try {
        // We will just hit a search endpoint in the API for this prototype
        const typeMap = {
          'domain': `domain=${entityValue}`,
          'email': `email=${entityValue}`,
          'phone': `phone=${entityValue}`,
          'recruiter': `email=${entityValue}`
        };
        
        const res = await axios.get(`http://localhost:5000/api/recruiter-profiles/search?${typeMap[entityType]}`);
        
        if (res.data && res.data.length > 0) {
          // If we found a profile, get the full intelligence for the first match
          const fullRes = await axios.get(`http://localhost:5000/api/recruiter-profiles/${res.data[0]._id}`);
          setData(fullRes.data);
        } else {
          setData(null);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    
    if (entityValue) {
      fetchExplainability();
    }
  }, [entityType, entityValue]);

  if (loading) {
    return <Card className="w-full animate-pulse"><CardContent className="h-64 flex items-center justify-center">Loading intelligence...</CardContent></Card>;
  }

  if (!data) {
    return (
      <Card className="w-full bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-300">Entity Intelligence</CardTitle>
          <CardDescription>No aggregated intelligence found for {entityValue}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { profile, riskAnalysis } = data;
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 text-white border-red-400';
      case 'HIGH': return 'bg-orange-600 text-white border-orange-400';
      case 'MEDIUM': return 'bg-yellow-600 text-white border-yellow-400';
      default: return 'bg-green-600 text-white border-green-400';
    }
  };

  return (
    <Card className="w-full bg-slate-900 border-slate-700 shadow-xl overflow-hidden">
      <div className={`h-2 w-full ${getRiskColor(riskAnalysis.level).split(' ')[0]}`} />
      
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
              Suspicious {entityType}
            </div>
            <CardTitle className="text-xl font-bold text-white break-all">
              {entityValue}
            </CardTitle>
          </div>
          <Badge className={`${getRiskColor(riskAnalysis.level)} font-bold`}>
            Risk: {riskAnalysis.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Target className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-2xl font-bold text-white">{profile.linkedInvestigationIds?.length || 0}</span>
            <span className="text-xs text-slate-400">Linked Jobs</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Users className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-2xl font-bold text-white">{profile.names?.length || 1}</span>
            <span className="text-xs text-slate-400">Identities</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <AlertTriangle className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-2xl font-bold text-white">{profile.linkedCampaignIds?.length || 0}</span>
            <span className="text-xs text-slate-400">Campaigns</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Info className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-2xl font-bold text-white">{riskAnalysis.score}/100</span>
            <span className="text-xs text-slate-400">Risk Score</span>
          </div>
        </div>

        {/* Signals */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center border-b border-slate-700 pb-2">
            Shared Signals
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.signals.slice(0, 5).map((s: any, idx: number) => (
              <Badge key={idx} variant="outline" className="bg-slate-800 border-slate-600 text-slate-200">
                {s.signal} <span className="ml-1 text-slate-500">x{s.count}</span>
              </Badge>
            ))}
            {profile.signals.length === 0 && <span className="text-sm text-slate-500">No signals recorded</span>}
          </div>
        </div>

        {/* Temporal */}
        <div>
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center border-b border-slate-700 pb-2">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            Observed
          </h4>
          <div className="grid grid-cols-2 text-sm text-slate-300">
            <div>
              <span className="text-slate-500 block mb-1">First Seen</span>
              {new Date(profile.firstSeen).toLocaleDateString()}
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Last Seen</span>
              {new Date(profile.lastSeen).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 border-l-4 border-l-blue-500">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center">
            <LinkIcon className="w-4 h-4 mr-2 text-blue-400" />
            Connection Rationale
          </h4>
          <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside ml-1">
            <li>Associated with <strong className="text-white">{profile.linkedInvestigationIds?.length || 0}</strong> investigations</li>
            {profile.linkedCampaignIds?.length > 0 && (
              <li>Appears in <strong className="text-white">{profile.linkedCampaignIds.length}</strong> threat campaigns</li>
            )}
            {profile.signals.length > 0 && (
              <li>Shares <strong className="text-white">{profile.signals.length}</strong> high-risk signals</li>
            )}
            {profile.emails.length > 1 && (
              <li>Linked to <strong className="text-white">{profile.emails.length}</strong> distinct email addresses</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
