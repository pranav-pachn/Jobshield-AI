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

            {/* Enhanced Quick Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* SSL Certificate - Enhanced */}
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                data.sslCertificate?.valid 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-green-100/50' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100/50'
              } shadow-sm`}>
                <div className={`p-2 rounded-full ${
                  data.sslCertificate?.valid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {data.sslCertificate?.valid ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">SSL Certificate</p>
                  <p className={`text-sm font-bold ${
                    data.sslCertificate?.valid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {data.sslCertificate?.valid ? 'Valid' : 'Invalid'}
                  </p>
                  {data.sslCertificate?.daysUntilExpiry !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">
                      {data.sslCertificate.daysUntilExpiry > 0 
                        ? `${data.sslCertificate.daysUntilExpiry} days left`
                        : 'Expired'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Domain Age - Enhanced */}
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                data.whoisData?.domainAge && data.whoisData.domainAge > 365
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-green-100/50'
                  : data.whoisData?.domainAge && data.whoisData.domainAge > 30
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-yellow-100/50'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100/50'
              } shadow-sm`}>
                <div className={`p-2 rounded-full ${
                  data.whoisData?.domainAge && data.whoisData.domainAge > 365
                    ? 'bg-green-500 text-white'
                    : data.whoisData?.domainAge && data.whoisData.domainAge > 30
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">Domain Age</p>
                  {data.whoisData?.domainAge ? (
                    <>
                      <p className={`text-sm font-bold ${
                        data.whoisData.domainAge > 365 
                          ? 'text-green-700'
                          : data.whoisData.domainAge > 30
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        {data.whoisData.domainAge >= 365 
                          ? `${Math.floor(data.whoisData.domainAge / 365)}y`
                          : data.whoisData.domainAge >= 30
                          ? `${Math.floor(data.whoisData.domainAge / 30)}mo`
                          : `${data.whoisData.domainAge}d`
                        }
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {data.whoisData.domainAge >= 365 
                          ? `${Math.floor(data.whoisData.domainAge / 365)} year${Math.floor(data.whoisData.domainAge / 365) > 1 ? 's' : ''}`
                          : data.whoisData.domainAge >= 30
                          ? `${Math.floor(data.whoisData.domainAge / 30)} month${Math.floor(data.whoisData.domainAge / 30) > 1 ? 's' : ''}`
                          : `${data.whoisData.domainAge} day${data.whoisData.domainAge > 1 ? 's' : ''}`
                        }
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-gray-500">Unknown</p>
                  )}
                </div>
              </div>

              {/* Safe Browsing - Enhanced */}
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                data.safeBrowsing?.safe 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-green-100/50' 
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100/50'
              } shadow-sm`}>
                <div className={`p-2 rounded-full ${
                  data.safeBrowsing?.safe ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {data.safeBrowsing?.safe ? (
                    <Shield className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">Safe Browsing</p>
                  <p className={`text-sm font-bold ${
                    data.safeBrowsing?.safe ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {data.safeBrowsing?.safe ? 'Safe' : 'Threat'}
                  </p>
                  {data.safeBrowsing?.threatTypes && data.safeBrowsing.threatTypes.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {data.safeBrowsing.threatTypes.length} threat{data.safeBrowsing.threatTypes.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* VirusTotal - Enhanced */}
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
                data.virusTotal?.malicious === 0
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-green-100/50'
                  : data.virusTotal?.malicious && data.virusTotal.malicious <= 3
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-yellow-100/50'
                  : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-red-100/50'
              } shadow-sm`}>
                <div className={`p-2 rounded-full ${
                  data.virusTotal?.malicious === 0
                    ? 'bg-green-500 text-white'
                    : data.virusTotal?.malicious && data.virusTotal.malicious <= 3
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">VirusTotal</p>
                  <p className={`text-sm font-bold ${
                    data.virusTotal?.malicious === 0
                      ? 'text-green-700'
                      : data.virusTotal?.malicious && data.virusTotal.malicious <= 3
                      ? 'text-yellow-700'
                      : 'text-red-700'
                  }`}>
                    {data.virusTotal?.malicious || 0}/{data.virusTotal?.malicious !== undefined ? (data.virusTotal.harmless + data.virusTotal.malicious + (data.virusTotal.suspicious || 0)) : 70}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {data.virusTotal?.malicious === 0 
                      ? 'Clean'
                      : data.virusTotal?.malicious === 1
                      ? '1 threat'
                      : `${data.virusTotal?.malicious || 0} threats`
                    }
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
