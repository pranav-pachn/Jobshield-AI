import { Card, CardContent } from "@/components/ui/card";
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
    case "DOMAIN": return <Globe className="h-3.5 w-3.5" />;
    case "EMAIL": return <Mail className="h-3.5 w-3.5" />;
    case "PHONE": return <Phone className="h-3.5 w-3.5" />;
    case "TELEGRAM":
    case "WHATSAPP": return <MessageCircle className="h-3.5 w-3.5" />;
    case "COMPANY": return <Building2 className="h-3.5 w-3.5" />;
    case "SCAM_PHRASE": return <AlertTriangle className="h-3.5 w-3.5" />;
    default: return <Search className="h-3.5 w-3.5" />;
  }
};

export function ThreatIndicatorCard({ indicator }: ThreatIndicatorProps) {
  const isHigh = indicator.riskLevel === "CRITICAL" || indicator.riskLevel === "HIGH";
  const isMedium = indicator.riskLevel === "MEDIUM";

  let firstSeenStr = "Unknown";
  let lastSeenStr = "Unknown";
  try {
    if (indicator.firstSeen) firstSeenStr = formatDistanceToNow(new Date(indicator.firstSeen), { addSuffix: true });
    if (indicator.lastSeen) lastSeenStr = formatDistanceToNow(new Date(indicator.lastSeen), { addSuffix: true });
  } catch {
    // Fallback on invalid dates
  }

  return (
    <Card className="hover:border-slate-700 transition-colors bg-surface-elevated border-slate-800/80 rounded-lg shadow-sm">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-sans">
            {getTypeIcon(indicator.type)}
            <span className="font-mono uppercase text-[10px] tracking-wider">{indicator.type}</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold tracking-wider ${
            isHigh ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            isMedium ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-slate-800 text-slate-300 border border-slate-700"
          }`}>
            {indicator.riskLevel}
          </span>
        </div>

        <div>
          <h3 className="font-mono text-sm text-slate-100 truncate" title={indicator.value}>
            {indicator.value}
          </h3>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Link2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Seen in <strong className="font-mono text-slate-100">{indicator.linkedInvestigations?.length || 0}</strong> investigations</span>
          </div>
          
          <div className="flex justify-between text-slate-500 text-[11px] font-sans pt-1">
            <span>First: {firstSeenStr}</span>
            <span>Last: {lastSeenStr}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
