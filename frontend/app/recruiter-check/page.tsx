"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecruiterCheckForm } from "@/components/RecruiterCheckForm";
import { RecruiterResultCard } from "@/components/RecruiterResultCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthGuard } from "@/components/AuthGuard";
import { AlertCircle, Shield } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface RecruiterCheckResult {
  email?: string;
  domain?: string;
  riskScore: number;
  riskLevel: "High" | "Medium" | "Low";
  isVerified: boolean;
  relatedScams: number;
  lastSeen?: string;
  indicators: string[];
}

export default function RecruiterCheckPage() {
  const router = useRouter();
  const [result, setResult] = useState<RecruiterCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  async function handleCheck(email: string, domain: string) {
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
          email: email || "", 
          domain: domain || ""
        }),
      });

      // Handle 401 unauthorized separately
      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `Error: ${response.status} ${response.statusText}`
        );
      }

      setResult({
        email: data.email || email || "",
        domain: data.domain || domain || "",
        riskScore: data.riskScore ?? 0,
        riskLevel: data.riskLevel ?? "Low",
        isVerified: data.isVerified ?? false,
        relatedScams: data.relatedScams ?? 0,
        lastSeen: data.lastSeen ?? new Date().toLocaleDateString(),
        indicators: data.indicators ?? [],
      });
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
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          {/* Enhanced Hero Section */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/10 via-card/50 to-background p-8 backdrop-blur-sm shadow-2xl lg:p-12">
            {/* Background gradient decorations */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-secondary/20 blur-3xl opacity-20" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-20" />
            </div>

            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400"></span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Identity Verification Active</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                  Recruiter Threat Intelligence
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground lg:text-lg">
                  Cross-reference recruiter identities against threat databases, verify domain authenticity, 
                  and expose fraudulent hiring campaigns through advanced network analysis and historical pattern matching.
                </p>
              </div>

              {/* Quick Stats in Hero */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Threat DB</div>
                  <div className="mt-2 text-2xl font-bold text-secondary">2.4M+</div>
                  <div className="text-xs text-muted-foreground">Known threats</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Accuracy</div>
                  <div className="mt-2 text-2xl font-bold text-cyan-400">96.2%</div>
                  <div className="text-xs text-muted-foreground">Detection rate</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Response Time</div>
                  <div className="mt-2 text-2xl font-bold text-green-400">~150 ms</div>
                  <div className="text-xs text-muted-foreground">Verification</div>
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
                onSuccess={() => setResult(null)}
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
                    message="Querying threat intelligence database..."
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
                    <span>Domain reputation and age</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Email domain verification</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Scam network associations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Communication patterns</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-border/30 bg-card/40 p-4">
                <p className="font-semibold text-foreground mb-2">Pro Tips</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Check both email and domain</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Verify LinkedIn independently</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary/60">•</span>
                    <span>Cross-reference multiple sources</span>
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
                  Results from Analysis
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
