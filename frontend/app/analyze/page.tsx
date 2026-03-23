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
      <div className="min-h-screen relative">
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

        <div className="flex w-full flex-col gap-8 relative z-10">
          {/* Hero Section */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-widest text-primary">
                  AI-Powered Analysis
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Evaluate Job Postings Before Engagement
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
              Paste a job description, recruiter message, or onboarding request. Our advanced AI combines
              phrase-rule detection, zero-shot classification, and semantic template matching to produce a
              unified risk score with transparent, explainable reasoning.
            </p>
          </section>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Analyzer */}
            <JobAnalyzer />

            {/* Info Panel */}
            <div className="flex flex-col gap-4">
              <Card className="glass-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Eye className="h-5 w-5 text-primary" />
                    Detection Indicators
                  </CardTitle>
                  <CardDescription>Common patterns in fraudulent postings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {indicators.map((indicator, idx) => {
                    const Icon = indicator.icon;
                    return (
                      <div key={idx} className="group overflow-hidden rounded-lg border border-border/30 bg-card/40 p-3 transition-colors hover:bg-card/60 hover:border-border/50">
                        <div className="flex gap-3">
                          <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
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

              {/* Tips Card */}
              <Card className="glass-card border-border bg-gradient-to-br from-card/60 to-card/30">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary/60 font-bold">•</span>
                      <span>Include the full job description for best results</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary/60 font-bold">•</span>
                      <span>Paste recruiter emails and cover letters too</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary/60 font-bold">•</span>
                      <span>AI reasoning explains each detection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}