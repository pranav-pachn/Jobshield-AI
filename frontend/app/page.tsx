import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Search, 
  Network, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Users,
  AlertTriangle
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "AI-Powered Analysis",
    description: "Advanced NLP models detect fraudulent job postings with 94% accuracy using semantic pattern matching."
  },
  {
    icon: Network,
    title: "Network Intelligence",
    description: "Map relationships between recruiters, domains, and scam reports to expose coordinated fraud campaigns."
  },
  {
    icon: Zap,
    title: "Real-time Detection",
    description: "Instant risk scoring with sub-second response times. Protect yourself before engaging with suspicious offers."
  },
  {
    icon: Shield,
    title: "Explainable AI",
    description: "Understand exactly why a job posting was flagged with highlighted suspicious phrases and clear reasoning."
  }
];

const stats = [
  { value: "50K+", label: "Jobs Analyzed", trend: "+12% this month" },
  { value: "94.2%", label: "Detection Rate", trend: "Industry leading" },
  { value: "8.2K", label: "Scams Blocked", trend: "+23% this quarter" },
  { value: "420ms", label: "Avg Response", trend: "Real-time" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">JobShield AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analyzer
              </Link>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link href="/analyze">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyber-purple/5" />
        <div className="absolute inset-0 surface-grid opacity-30" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Fraud Intelligence Platform</span>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Detect fake job offers before they become a breach.
              </h1>
              
              <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
                JobShield AI combines NLP risk scoring, recruiter verification, and relationship mapping to expose scam campaigns across job posts, domains, and contact identities.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/analyze" className="flex items-center gap-2">
                    Open Analyzer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-cyber-purple/80 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-white">{['JD', 'AK', 'MT', 'SR'][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">12,400+</span> job seekers protected
                </div>
              </div>
            </div>
            
            {/* Hero Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-cyber-purple/20 blur-3xl opacity-50" />
              <Card className="relative border-border bg-card/80 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Live Threat Signal</span>
                    <span className="flex h-2 w-2 rounded-full bg-risk-high animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Scam Probability", value: "89%", color: "text-risk-high" },
                      { label: "Flagged Domains", value: "27", color: "text-risk-medium" },
                      { label: "Linked Recruiters", value: "14", color: "text-cyber-purple" },
                      { label: "Response Time", value: "420ms", color: "text-risk-low" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-border bg-accent/50 p-4">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-risk-high mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">High-Risk Pattern Detected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Job posting contains registration fee requests and unverifiable recruiter domain
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                <div className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Enterprise-grade fraud detection
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for job seekers, recruiters, and HR teams who need to verify job postings at scale.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 lg:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyber-purple/10" />
            <div className="absolute inset-0 surface-grid opacity-20" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
                  Ready to protect yourself from job scams?
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Start analyzing job postings for free. No credit card required.
                </p>
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-4 w-4 text-risk-low" />
                  <span className="text-sm text-muted-foreground">Free to use</span>
                  <CheckCircle className="h-4 w-4 text-risk-low" />
                  <span className="text-sm text-muted-foreground">Instant results</span>
                  <CheckCircle className="h-4 w-4 text-risk-low" />
                  <span className="text-sm text-muted-foreground">No signup required</span>
                </div>
              </div>
              
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <Link href="/analyze" className="flex items-center gap-2">
                  Start Analyzing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">JobShield AI</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analyzer
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
