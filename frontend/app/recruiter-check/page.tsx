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
        body: JSON.stringify({ email, domain }),
        onUnauthorized: () => router.replace("/login"),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string" ? data.message : "Failed to check recruiter"
        );
      }

      setResult({
        email: data.email || email,
        domain: data.domain || domain,
        riskScore: data.riskScore ?? data.risk_score ?? 0,
        riskLevel: data.riskLevel ?? data.risk_level ?? "Low",
        isVerified: data.isVerified ?? data.is_verified ?? false,
        relatedScams: data.relatedScams ?? data.related_scams ?? 0,
        lastSeen: data.lastSeen ?? data.last_seen ?? "N/A",
        indicators: data.indicators ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-widest text-primary">
                Threat Intelligence
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Verify Recruiter Authenticity
              </h1>
            </div>
            <Button
              asChild
              variant="outline"
              className="rounded-full hover:bg-primary/10"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
            Check the authenticity and reputation of recruiter email addresses and domains. Our threat
            intelligence system cross-references data against known scam networks and provides risk
            assessments based on historical fraud patterns.
          </p>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Form */}
            <div className="space-y-6">
              <RecruiterCheckForm onSubmit={handleCheck} isLoading={isLoading} />

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
