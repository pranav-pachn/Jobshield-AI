import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Loader2,
  Server,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DomainIntelligenceData {
  domain: string;
  analyzedAt: string;
  sslCertificate?: {
    valid: boolean;
    issuer?: string;
    daysUntilExpiry?: number;
    error?: string;
  };
  whoisData?: {
    domainAge?: number;
    registrar?: string;
    creationDate?: string;
    expirationDate?: string;
    error?: string;
  };
  safeBrowsing?: {
    safe: boolean;
    threatTypes?: string[];
    error?: string;
  };
  virusTotal?: {
    malicious: number;
    suspicious: number;
    harmless: number;
    error?: string;
  };
  trustScore?: {
    score: number;
    level: 'high' | 'medium' | 'low';
    factors: string[];
  };
}

interface DomainIntelligenceCardProps {
  domain?: string;
  email?: string;
  url?: string;
  onDataReceived?: (data: DomainIntelligenceData) => void;
}

export const DomainIntelligenceCard: React.FC<DomainIntelligenceCardProps> = ({
  domain,
  email,
  url,
  onDataReceived
}) => {
  const [data, setData] = useState<DomainIntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  const analyzeDomain = async () => {
    if (!domain && !email && !url) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendBaseUrl}/api/domains/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, url })
      });

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        onDataReceived?.(result.data);
        toast.success(`Domain analysis complete: ${result.data.trustScore?.score}/100`);
      } else {
        toast.error('Domain analysis failed');
      }
    } catch (error) {
      console.error('Domain analysis error:', error);
      toast.error('Failed to analyze domain');
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

  if (!domain && !email && !url) {
    return null;
  }

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Domain Intelligence
        </CardTitle>
        <CardDescription>
          Security analysis of {domain || email || url}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data && !loading && (
          <Button 
            onClick={analyzeDomain}
            className="w-full"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            Analyze Domain
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing domain security...
            </span>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Trust Score */}
            {data.trustScore && (
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
            )}

            {/* Quick Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* SSL Certificate */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <Lock className={`h-4 w-4 ${data.sslCertificate?.valid ? 'text-green-500' : 'text-red-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">SSL</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.sslCertificate?.valid ? 'Valid' : 'Invalid'}
                  </p>
                </div>
              </div>

              {/* Domain Age */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <Clock className={`h-4 w-4 ${data.whoisData?.domainAge && data.whoisData.domainAge > 30 ? 'text-green-500' : 'text-yellow-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Age</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.whoisData?.domainAge ? `${data.whoisData.domainAge}d` : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Safe Browsing */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <Shield className={`h-4 w-4 ${data.safeBrowsing?.safe ? 'text-green-500' : 'text-red-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">Safe</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.safeBrowsing?.safe ? 'Clean' : 'Flagged'}
                  </p>
                </div>
              </div>

              {/* VirusTotal */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/40">
                <AlertTriangle className={`h-4 w-4 ${data.virusTotal?.malicious === 0 ? 'text-green-500' : 'text-red-500'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium">VT</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.virusTotal?.malicious || 0} bad
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
              {expanded ? 'Hide' : 'Show'} Technical Details
              <Eye className="h-4 w-4" />
            </Button>

            {expanded && (
              <div className="space-y-3 p-4 rounded-lg border border-border/30 bg-card/40">
                {/* WHOIS Data */}
                {data.whoisData && !data.whoisData.error && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Registration Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Registrar:</span>
                        <p className="font-mono">{data.whoisData.registrar || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-mono">
                          {data.whoisData.creationDate ? 
                            new Date(data.whoisData.creationDate).toLocaleDateString() : 
                            'Unknown'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SSL Certificate Details */}
                {data.sslCertificate && data.sslCertificate.valid && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      SSL Certificate
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Issuer:</span>
                        <p className="font-mono truncate">{data.sslCertificate.issuer || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires in:</span>
                        <p className="font-mono">{data.sslCertificate.daysUntilExpiry || 'Unknown'} days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust Score Factors */}
                {data.trustScore && data.trustScore.factors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Trust Factors</p>
                    <ul className="space-y-1">
                      {data.trustScore.factors.map((factor, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {factor}
                        </li>
                      ))}
                    </ul>
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
