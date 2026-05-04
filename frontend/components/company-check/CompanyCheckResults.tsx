import { Building2, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CompanyCheckResult } from "./types";

interface CompanyCheckResultsProps {
  result: CompanyCheckResult;
}

export function CompanyCheckResults({ result }: CompanyCheckResultsProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Analysis Result for <span className="text-indigo-400 drop-shadow-md">{result.domain}</span></h2>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm",
          result.riskLevel === "High" ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/20" :
          result.riskLevel === "Medium" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-yellow-500/20" :
          "bg-green-500/10 border-green-500/30 text-green-400 shadow-green-500/20"
        )}>
          {result.riskLevel} Risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(96,125,255,0.15)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Domain Age</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{result.domainAge}</p>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)] transition-all duration-300 delay-150 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">SSL Status</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{result.sslStatus}</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "glass-card group transition-all duration-300 delay-300 animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-1",
          result.blacklistStatus === "Flagged" 
            ? "border-red-500/30 hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)]" 
            : "hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]"
        )}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110",
                result.blacklistStatus === "Flagged" 
                  ? "bg-red-500/10 text-red-400 border-red-500/20 group-hover:bg-red-500/20" 
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20"
              )}>
                {result.blacklistStatus === "Flagged" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Blacklist Status</p>
            <p className={cn(
              "text-2xl font-bold mt-1 tracking-tight",
              result.blacklistStatus === "Flagged" ? "text-red-400" : "text-foreground"
            )}>{result.blacklistStatus}</p>
          </CardContent>
        </Card>

        <Card className="glass-card group hover:-translate-y-1 transition-all duration-300 delay-500 animate-in fade-in slide-in-from-bottom-4 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2.5 rounded-xl border transition-all duration-300 group-hover:scale-110",
                result.similarityMatch > 50 
                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20 group-hover:bg-orange-500/20" 
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20"
              )}>
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Impersonation Risk</p>
            <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{result.similarityMatch}%</p>
          </CardContent>
        </Card>
      </div>

      {result.knownAliases.length > 0 && (
        <Card className="glass-card border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.1)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-700">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-orange-400 text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/20">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Known Threat Aliases
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              This domain has been associated with the following suspicious entities
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2.5">
              {result.knownAliases.map((alias) => (
                <span key={alias} className="px-3.5 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-300 font-mono text-sm shadow-sm hover:bg-orange-500/20 hover:scale-105 transition-all cursor-default">
                  {alias}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
