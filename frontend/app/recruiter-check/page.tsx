"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecruiterCheckForm } from "@/components/RecruiterCheckForm";
import { RecruiterResultCard } from "@/components/RecruiterResultCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

import { getBackendUrl } from "@/lib/apiConfig";
// ─── Types matching the new API response ─────────────────────────────────────

interface RecruiterFlag {
  type: "critical" | "warning" | "info";
  message: string;
  category: "email" | "domain" | "company" | "url" | "pattern";
}

interface CheckDetail {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
}

interface RecruiterCheckResult {
  trust_score: number;
  risk_level: "High" | "Medium" | "Low";
  flags: RecruiterFlag[];
  checks: {
    email: CheckDetail[];
    domain: CheckDetail[];
    company: CheckDetail[];
    url: CheckDetail[];
    patterns: CheckDetail[];
  };
  recommendation: string;
  recruiterName?: string;
  company?: string;
  email?: string;
  website?: string;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function RecruiterCheckPage() {
  const router = useRouter();
  const [result, setResult] = useState<RecruiterCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = getBackendUrl();

  async function handleCheck(data: {
    recruiterName: string;
    company: string;
    email: string;
    website: string;
    phone: string;
  }) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiFetch(`${backendBaseUrl}/api/recruiters/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recruiterName: data.recruiterName || undefined,
          company: data.company || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          phone: data.phone || undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.error || json?.message || `Error: ${response.status} ${response.statusText}`
        );
      }

      setResult(json as RecruiterCheckResult);
    } catch (err) {
      console.error("Recruiter check error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during recruiter verification");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen">
        <div className="flex w-full flex-col gap-8">
          {/* Enhanced Hero Section */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#05080f] p-8 shadow-inner lg:p-12">

            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#00ff88] opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00ff88]"></span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00ff88]">Recruiter Intelligence Active</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-100 lg:text-5xl">
                  Recruiter Intel Console
                </h1>
                <p className="max-w-3xl text-base text-slate-400 lg:text-lg">
                  Verify identities, cross-reference domains, and detect impersonation attempts to expose fraudulent hiring campaigns.
                </p>
              </div>

              {/* Quick Stats in Hero */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-4 shadow-inner">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Intelligence Checks</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-blue-400">5</div>
                  <div className="text-xs text-slate-400 mt-1">Verification layers</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-4 shadow-inner">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Known Companies</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">100+</div>
                  <div className="text-xs text-slate-400 mt-1">Verified database</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0b1220] p-4 shadow-inner">
                  <div className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">Detection</div>
                  <div className="mt-2 text-2xl font-bold font-mono text-[#00ff88]">Real-time</div>
                  <div className="text-xs text-slate-400 mt-1">Instant analysis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Form */}
            <div className="space-y-6">
              <RecruiterCheckForm 
                onSubmit={handleCheck} 
                isLoading={isLoading}
              />

              {/* System Error */}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Check Failed</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <LoadingSpinner
                    message="Analyzing recruiter intelligence..."
                    size="lg"
                  />
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border border-border/30 bg-card/40 p-4">
                <p className="font-semibold text-foreground mb-2">What We Check</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Email domain vs company identity alignment</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Domain age, SSL certificate & reputation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Company verification against known database</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Lookalike domain impersonation detection</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Google Safe Browsing & VirusTotal scans</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Suspicious pattern & red-flag analysis</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border/30 bg-card/40 p-4">
                <p className="font-semibold text-foreground mb-2">How It Works</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">1.</span>
                    <span>Enter recruiter details (email is strongest signal)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">2.</span>
                    <span>System runs 5 intelligence checks simultaneously</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">3.</span>
                    <span>Get a trust score with detailed findings</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400 font-bold">4.</span>
                    <span>Clear recommendation: Safe / Suspicious / High Risk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Intelligence Report
                </h2>
              </div>
              <RecruiterResultCard {...result} />
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
