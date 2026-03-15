import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Loader2,
  Building,
  User,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmailAnalysisData {
  email: string;
  analyzedAt: string;
  domain: string;
  isFreeProvider: boolean;
  suspiciousPatterns: {
    suspicious: boolean;
    pattern?: string;
    reason?: string;
  };
  corporatePatterns: {
    corporate: boolean;
    pattern?: string;
    reason?: string;
  };
  domainIntelligence?: {
    domain: string;
    trustScore?: {
      score: number;
      level: 'high' | 'medium' | 'low';
    };
  };
  trustScore: {
    score: number;
    level: 'high' | 'medium' | 'low';
    factors: string[];
  };
}

interface EmailAnalysisCardProps {
  email?: string;
  onDataReceived?: (data: EmailAnalysisData) => void;
}

export const EmailAnalysisCard: React.FC<EmailAnalysisCardProps> = ({
  email,
  onDataReceived
}) => {
  const [data, setData] = useState<EmailAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  const analyzeEmail = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendBaseUrl}/api/emails/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        onDataReceived?.(result.data);
        toast.success(`Email analysis complete: ${result.data.trustScore.score}/100`);
      } else {
        toast.error('Email analysis failed');
      }
    } catch (error) {
      console.error('Email analysis error:', error);
      toast.error('Failed to analyze email');
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (level?: string) => {
    switch (level) {
      case 'high': return 'text-green-500 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTrustScoreIcon = (level?: string) => {
    switch (level) {
      case 'high': return CheckCircle;
      case 'medium': return AlertTriangle;
      case 'low': return AlertTriangle;
      default: return Shield;
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Analysis
        </CardTitle>
        <CardDescription>
          Security analysis of {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data && !loading && (
          <Button 
            onClick={analyzeEmail}
            className="w-full"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            Analyze Email
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing email security...
            </span>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Trust Score */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/40">
              <div className="flex items-center gap-3">
                {React.createElement(getTrustScoreIcon(data.trustScore.level), {
                  className: `h-5 w-5 ${getTrustScoreColor(data.trustScore.level).split(' ')[0]}`
                })}
                <div>
                  <p className="font-semibold">Trust Score</p>
                  <p className="text-sm text-muted-foreground">
                    {data.trustScore.score}/100 ({data.trustScore.level})
                  </p>
                </div>
              </div>
              <Badge className={getTrustScoreColor(data.trustScore.level)}>
                {data.trustScore.score}%
              </Badge>
            </div>

            {/* Quick Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Email Provider Type */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                {data.isFreeProvider ? (
                  <User className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Building className="h-4 w-4 text-green-500" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium">Provider</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.isFreeProvider ? 'Free' : 'Corporate'}
                  </p>
                </div>
              </div>

              {/* Suspicious Patterns */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <AlertTriangle className={`h-4 w-4 ${data.suspiciousPatterns.suspicious ? 'text-red-500' : 'text-green-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Pattern</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.suspiciousPatterns.suspicious ? 'Suspicious' : 'Normal'}
                  </p>
                </div>
              </div>

              {/* Corporate Pattern */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <Building className={`h-4 w-4 ${data.corporatePatterns.corporate ? 'text-green-500' : 'text-gray-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Corporate</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.corporatePatterns.corporate ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Domain Trust */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <Globe className={`h-4 w-4 ${data.domainIntelligence?.trustScore?.level === 'high' ? 'text-green-500' : data.domainIntelligence?.trustScore?.level === 'medium' ? 'text-yellow-500' : 'text-red-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Domain</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.domainIntelligence?.trustScore?.score || 'N/A'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between"
            >
              {expanded ? 'Hide' : 'Show'} Analysis Details
              <Eye className="h-4 w-4" />
            </Button>

            {expanded && (
              <div className="space-y-3 p-4 rounded-lg border border-border/30 bg-card/40">
                {/* Trust Score Factors */}
                {data.trustScore.factors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Trust Factors</p>
                    <ul className="space-y-1">
                      {data.trustScore.factors.map((factor, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          {factor.includes('Uses custom') || factor.includes('Follows corporate') || factor.includes('Domain reputation') ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pattern Analysis */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Pattern Analysis</p>
                  
                  {data.suspiciousPatterns.suspicious && (
                    <div className="p-2 rounded bg-red-50 border border-red-200">
                      <p className="text-xs font-medium text-red-700">Suspicious Pattern Detected</p>
                      <p className="text-xs text-red-600">{data.suspiciousPatterns.reason}</p>
                    </div>
                  )}

                  {data.corporatePatterns.corporate && (
                    <div className="p-2 rounded bg-green-50 border border-green-200">
                      <p className="text-xs font-medium text-green-700">Corporate Pattern Detected</p>
                      <p className="text-xs text-green-600">{data.corporatePatterns.reason}</p>
                    </div>
                  )}

                  {!data.suspiciousPatterns.suspicious && !data.corporatePatterns.corporate && (
                    <div className="p-2 rounded bg-gray-50 border border-gray-200">
                      <p className="text-xs text-gray-600">No specific patterns detected</p>
                    </div>
                  )}
                </div>

                {/* Domain Intelligence */}
                {data.domainIntelligence && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Domain Intelligence</p>
                    <div className="text-xs text-muted-foreground">
                      <p>Domain: {data.domain}</p>
                      {data.domainIntelligence.trustScore && (
                        <p>Domain Trust: {data.domainIntelligence.trustScore.score}/100 ({data.domainIntelligence.trustScore.level})</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
