import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Globe, Mail, Phone, MessageCircle, AlertTriangle, Building2, Search, Link2 } from "lucide-react";

interface ThreatIndicatorProps {
  indicator: {
    _id: string;
    type: string;
    value: string;
    normalizedValue: string;
    riskLevel: string;
    firstSeen: string;
    lastSeen: string;
    occurrenceCount: number;
    source: string;
    confidence: number;
    linkedInvestigations: string[];
  };
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "DOMAIN": return <Globe className="h-4 w-4" />;
    case "EMAIL": return <Mail className="h-4 w-4" />;
    case "PHONE": return <Phone className="h-4 w-4" />;
    case "TELEGRAM":
    case "WHATSAPP": return <MessageCircle className="h-4 w-4" />;
    case "COMPANY": return <Building2 className="h-4 w-4" />;
    case "SCAM_PHRASE": return <AlertTriangle className="h-4 w-4" />;
    default: return <Search className="h-4 w-4" />;
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "CRITICAL": return "bg-red-900 text-red-100 hover:bg-red-800";
    case "HIGH": return "bg-red-500 text-white hover:bg-red-600";
    case "MEDIUM": return "bg-amber-500 text-white hover:bg-amber-600";
    case "LOW": return "bg-emerald-500 text-white hover:bg-emerald-600";
    default: return "bg-slate-500 text-white";
  }
};

export function ThreatIndicatorCard({ indicator }: ThreatIndicatorProps) {
  return (
    <Card className="hover:border-blue-500/50 transition-colors bg-slate-900/50 border-slate-800">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            {getTypeIcon(indicator.type)}
            <span className="text-sm">{indicator.type}</span>
          </div>
          <Badge className={getRiskColor(indicator.riskLevel)}>
            {indicator.riskLevel}
          </Badge>
        </div>

        <h3 className="font-semibold text-lg text-white mb-4 truncate" title={indicator.value}>
          {indicator.value}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Link2 className="h-4 w-4 text-slate-500" />
            <span>Seen in <strong>{indicator.linkedInvestigations?.length || 0}</strong> investigations</span>
          </div>
          
          <div className="flex justify-between text-slate-500 text-xs">
            <span>First seen: {formatDistanceToNow(new Date(indicator.firstSeen), { addSuffix: true })}</span>
            <span>Last seen: {formatDistanceToNow(new Date(indicator.lastSeen), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
