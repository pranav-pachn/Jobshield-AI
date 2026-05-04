"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  CompanyCheckHeader,
  CompanyCheckInput,
  CompanyCheckResults,
  CompanyCheckEmptyState,
  type CompanyCheckResult
} from "@/components/company-check";

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
        <CompanyCheckHeader />

        <CompanyCheckInput 
          url={url} 
          isScanning={isScanning} 
          onUrlChange={setUrl} 
          onAnalyze={handleAnalyze} 
        />

        {isScanning ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Querying global threat intelligence networks..." size="lg" />
          </div>
        ) : result ? (
          <CompanyCheckResults result={result} />
        ) : (
          <CompanyCheckEmptyState />
        )}
      </div>
    </AuthGuard>
  );
}
