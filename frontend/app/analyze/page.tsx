import Link from "next/link";

import { JobAnalyzer } from "@/components/JobAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Eye, Lock, Zap, Brain } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { AmbientParticleGrid } from "@/components/animations/AmbientParticleGrid";
import { DataStreamLines } from "@/components/animations/DataStreamLines";

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
      <main className="min-h-screen relative">
        {/* Ambient Particle Grid Background */}
        <AmbientParticleGrid 
          opacity={0.08} 
          particleCount={45} 
          animationSpeed={0.25}
          className="z-0"
        />

        {/* Data Stream Lines Animation */}
        <DataStreamLines 
          opacity={0.1} 
          lineCount={5}
          className="z-0"
        />

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <section className="space-y-5 animate-fade-in">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Real-time Intelligence
                </p>
                <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Analyze Job Postings in Seconds
                </h1>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full hover:bg-primary/10 flex-shrink-0 px-6 py-2"
              >
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4" />
                  View Dashboard
                </Link>
              </Button>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              Paste a job description, recruiter email, or onboarding request. Our AI-powered threat intelligence combines
              phrase-pattern detection, zero-shot classification, and semantic matching to deliver explainable risk analysis in real-time.
            </p>
          </section>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] animate-slide-up">
            {/* Analyzer */}
            <JobAnalyzer />

            {/* Info Panel */}
            <div className="flex flex-col gap-6">
              {/* Detection Indicators Card */}
              <Card className="glass-card border-blue-500/20 h-fit">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg">
                    <Eye className="h-5 w-5 text-blue-400" />
                    Detection Indicators
                  </CardTitle>
                  <CardDescription className="text-xs">Common patterns in fraudulent postings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {indicators.map((indicator, idx) => {
                    const Icon = indicator.icon;
                    return (
                      <div key={idx} className="group overflow-hidden rounded-lg border border-slate-600/30 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-3.5 transition-all hover:border-blue-500/40 hover:from-slate-900/70 hover:to-slate-800/50">
                        <div className="flex gap-3">
                          <Icon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground group-hover:text-blue-300 transition-colors">
                              {indicator.title}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                              {indicator.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Pro Tips Card */}
              <Card className="glass-card border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-blue-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="text-purple-400/60 font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground leading-relaxed">Include the full job description for best results</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-400/60 font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground leading-relaxed">Paste recruiter emails and cover letters too</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-purple-400/60 font-bold flex-shrink-0">✓</span>
                      <span className="text-muted-foreground leading-relaxed">AI reasoning explains each detection transparently</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
