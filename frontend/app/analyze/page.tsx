import Link from "next/link";

import { JobAnalyzer } from "@/components/JobAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Eye, Lock, Zap, Brain } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";

const indicators = [
  {
    icon: AlertTriangle,
    title: "Fee Requests",
    description: "Upfront payments, registration, or onboarding fees are major red flags",
  },
  {
    icon: Lock,
    title: "Unverifiable Contacts",
    description: "Recruiter domains that can't be verified or throwaway email accounts",
  },
  {
    icon: Zap,
    title: "Pressure Tactics",
    description: "Artificial urgency, unrealistic salary promises, or suspicious guarantees",
  },
  {
    icon: Brain,
    title: "Template Patterns",
    description: "Near-duplicate language matched against known scam templates",
  },
];

export default function AnalyzePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen relative">
        <div className="flex w-full flex-col gap-8 relative z-10">
          {/* Hero Section */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
                  Threat Investigation Console
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                  Submit suspicious job communications for multi-layer threat analysis
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
            <p className="max-w-3xl text-base leading-relaxed text-slate-400">
              Paste a job description, recruiter message, or onboarding request. Our advanced AI threat intelligence will cross-reference payloads against known adversary patterns and provide detailed reasoning.
            </p>
          </section>

          {/* Main Content */}
          <div className="w-full">
            {/* Analyzer */}
            <JobAnalyzer />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
