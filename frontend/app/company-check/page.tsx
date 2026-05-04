"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Building2, Search, Calendar, ShieldCheck, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface CompanyCheckResult {
  domain: string;
  domainAge: string;
  sslStatus: "Secure" | "Insecure" | "Unknown";
  blacklistStatus: "Clean" | "Flagged";
  similarityMatch: number;
  riskLevel: "Low" | "Medium" | "High";
  knownAliases: string[];
}

export default function CompanyCheckerPage() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<CompanyCheckResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsScanning(true);
    setResult(null);
    
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 2000));
    
    // Mock result generator
    const domainPart = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split("/")[0];
    const isSketchy = domainPart.includes("-") || domainPart.length > 15;
    
    const mockResult: CompanyCheckResult = {
      domain: domainPart,
      domainAge: isSketchy ? "2 months" : "5 years",
      sslStatus: "Secure",
      blacklistStatus: isSketchy ? "Flagged" : "Clean",
      similarityMatch: isSketchy ? 85 : 5,
      riskLevel: isSketchy ? "High" : "Low",
      knownAliases: isSketchy ? ["sketchy-corp.net", "corp-jobs.io"] : [],
    };
    
    setResult(mockResult);
    setIsScanning(false);
  };

  return (
    <AuthGuard>
      <div className="flex w-full flex-col gap-8">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-card/50 to-background p-8 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Building2 className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Company Intelligence
                </h1>
                <p className="text-muted-foreground">
                  Verify company domain authenticity and detect impersonators
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Input */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Globe className="h-5 w-5 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Enter company website URL (e.g., techcorp.com)"
              className="block w-full rounded-xl border border-white/10 bg-card/60 backdrop-blur-md p-4 pl-12 text-sm text-foreground shadow-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              disabled={isScanning}
            />
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={!url.trim() || isScanning}
            className="h-[54px] px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Analyze Domain
              </span>
            )}
          </Button>
        </div>

        {/* Results */}
        {isScanning ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Querying global threat intelligence networks..." size="lg" />
          </div>
        ) : result ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-foreground">Analysis Result for <span className="text-indigo-400">{result.domain}</span></h2>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
                result.riskLevel === "High" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                result.riskLevel === "Medium" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                "bg-green-500/10 border-green-500/20 text-green-400"
              )}>
                {result.riskLevel} Risk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Domain Age</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{result.domainAge}</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">SSL Status</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{result.sslStatus}</p>
                </CardContent>
              </Card>

              <Card className={cn(
                "glass-card",
                result.blacklistStatus === "Flagged" && "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              )}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      result.blacklistStatus === "Flagged" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    )}>
                      {result.blacklistStatus === "Flagged" ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Blacklist Status</p>
                  <p className={cn(
                    "text-2xl font-bold mt-1",
                    result.blacklistStatus === "Flagged" ? "text-red-400" : "text-foreground"
                  )}>{result.blacklistStatus}</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      result.similarityMatch > 50 ? "bg-orange-500/10 text-orange-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Impersonation Risk</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{result.similarityMatch}%</p>
                </CardContent>
              </Card>
            </div>

            {result.knownAliases.length > 0 && (
              <Card className="glass-card border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-orange-400 text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Known Threat Aliases
                  </CardTitle>
                  <CardDescription>
                    This domain has been associated with the following suspicious entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.knownAliases.map((alias) => (
                      <span key={alias} className="px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-300 font-mono text-sm">
                        {alias}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">Ready to Scan</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              Enter a company URL above to verify its authenticity, check domain age, and detect potential impersonation campaigns.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
