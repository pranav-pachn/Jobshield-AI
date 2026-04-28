"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, Globe, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThreatSummary {
  top_domains: Array<{ domain: string; count: number; risk_level: string }>;
  top_phrases: Array<{ phrase: string; count: number; risk_boost: number }>;
  top_email_domains: Array<{ domain: string; count: number; avg_risk_score: number }>;
  recent_high_risk: Array<{
    job_title?: string;
    website_domain?: string;
    email_domain?: string;
    final_risk_score: number;
    created_at: string;
  }>;
  threat_trends: {
    total_analyzed: number;
    high_risk_percentage: number;
    most_active_threat_category: string;
    avg_intelligence_boost: number;
  };
}

export function ThreatIntelligenceWidget() {
  const [threatData, setThreatData] = useState<ThreatSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreatIntelligence = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/threat/summary');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch threat intelligence: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setThreatData(data.data);
        } else {
          throw new Error(data.error || 'Failed to load threat intelligence');
        }
      } catch (err) {
        console.error('Error fetching threat intelligence:', err);
        setError(err instanceof Error ? err.message : 'Failed to load threat intelligence data');
      } finally {
        setLoading(false);
      }
    };

    fetchThreatIntelligence();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchThreatIntelligence, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Threat Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Threat Intelligence Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 p-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!threatData) {
    return null;
  }

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getThreatCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'financial_scam': return 'text-red-600';
      case 'phishing': return 'text-orange-600';
      case 'fake_job': return 'text-yellow-600';
      case 'identity_theft': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{threatData.threat_trends.total_analyzed}</p>
                <p className="text-xs text-muted-foreground">Jobs Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{threatData.threat_trends.high_risk_percentage}%</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{threatData.threat_trends.avg_intelligence_boost.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Intelligence Boost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <div>
                <p className={`text-sm font-semibold capitalize ${getThreatCategoryColor(threatData.threat_trends.most_active_threat_category)}`}>
                  {threatData.threat_trends.most_active_threat_category.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground">Top Threat Category</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Threats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Scam Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-red-500" />
              Top Scam Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatData.top_domains.slice(0, 5).map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{domain.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getRiskLevelColor(domain.risk_level)} bg-opacity-10`}>
                      {domain.risk_level}
                    </span>
                    <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                      {domain.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Scam Phrases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-500" />
              Common Scam Phrases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatData.top_phrases.slice(0, 5).map((phrase, index) => (
                <div key={phrase.phrase} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span className="text-sm italic">&quot;{phrase.phrase}&quot;</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {phrase.count}
                      </span>
                      {phrase.risk_boost > 0 && (
                        <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                          +{phrase.risk_boost}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suspicious Email Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-yellow-500" />
              Suspicious Email Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatData.top_email_domains.slice(0, 5).map((email, index) => (
                <div key={email.domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm">{email.domain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {email.count}
                    </span>
                    <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                      {email.avg_risk_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent High-Risk Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Recent High-Risk Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threatData.recent_high_risk.slice(0, 5).map((activity, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-3 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {activity.job_title && (
                      <p className="text-sm font-medium">{activity.job_title}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {activity.website_domain && (
                        <span className="text-xs text-muted-foreground">
                          <Globe className="h-3 w-3 inline mr-1" />
                          {activity.website_domain}
                        </span>
                      )}
                      {activity.email_domain && (
                        <span className="text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 inline mr-1" />
                          {activity.email_domain}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      {activity.final_risk_score}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
