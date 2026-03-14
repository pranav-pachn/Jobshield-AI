import { AppShell } from "@/components/AppShell";
import { JobAnalyzer } from "@/components/JobAnalyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, AlertTriangle, Zap, Shield, Eye } from "lucide-react";

const indicators = [
  { text: "Fee requests or onboarding payments", icon: AlertTriangle },
  { text: "Unverifiable recruiter domains or throwaway emails", icon: AlertTriangle },
  { text: "Urgent pressure tactics and unusual salary promises", icon: AlertTriangle },
  { text: "Near-duplicate language from known scam templates", icon: AlertTriangle },
];

const features = [
  { 
    title: "NLP Analysis", 
    description: "Deep semantic analysis of job descriptions",
    icon: Search 
  },
  { 
    title: "Pattern Matching", 
    description: "Compare against known scam templates",
    icon: Eye 
  },
  { 
    title: "Real-time Detection", 
    description: "Instant AI-powered risk scoring",
    icon: Zap 
  },
];

export default function AnalyzePage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            Job Analysis
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Analyze Job Posting
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Paste a job description, recruiter message, or onboarding request. Our AI combines phrase-rule detection, zero-shot classification, and semantic template matching to identify potential scams.
          </p>
        </div>

        {/* Features Banner */}
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <JobAnalyzer />

          {/* What gets flagged */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5" />
                  What Gets Flagged
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Common scam indicators detected by our AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {indicators.map((item, index) => (
                  <div key={index} className="rounded-lg border border-border bg-accent/50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <item.icon className="h-4 w-4 text-risk-medium mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{item.text}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Detection Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                  <span className="text-sm font-semibold text-foreground">94.2%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[94.2%] rounded-full bg-gradient-to-r from-primary to-cyber-purple" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <div className="text-xl font-bold text-foreground">50K+</div>
                    <div className="text-xs text-muted-foreground">Jobs Analyzed</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent/50">
                    <div className="text-xl font-bold text-risk-high">8.2K</div>
                    <div className="text-xs text-muted-foreground">Scams Detected</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
