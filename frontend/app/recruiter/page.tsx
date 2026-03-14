import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  UserCheck, 
  Search, 
  AlertTriangle, 
  Shield, 
  Mail, 
  Globe, 
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  TrendingUp
} from "lucide-react";

const recentRecruiters = [
  {
    id: 1,
    email: "sarah.johnson@legitcorp.com",
    domain: "legitcorp.com",
    status: "verified",
    linkedIn: true,
    reports: 0,
    lastChecked: "2 hours ago",
  },
  {
    id: 2,
    email: "hr-fasttrack@consultant-mail.net",
    domain: "consultant-mail.net",
    status: "suspicious",
    linkedIn: false,
    reports: 23,
    lastChecked: "1 hour ago",
  },
  {
    id: 3,
    email: "recruiting@techstartup.io",
    domain: "techstartup.io",
    status: "verified",
    linkedIn: true,
    reports: 0,
    lastChecked: "3 hours ago",
  },
  {
    id: 4,
    email: "jobs@urgentwork-now.xyz",
    domain: "urgentwork-now.xyz",
    status: "flagged",
    linkedIn: false,
    reports: 47,
    lastChecked: "30 mins ago",
  },
  {
    id: 5,
    email: "talent@enterprise.com",
    domain: "enterprise.com",
    status: "verified",
    linkedIn: true,
    reports: 0,
    lastChecked: "5 hours ago",
  },
];

const domainStats = [
  { label: "Verified Domains", value: 1247, trend: "+12%", color: "text-risk-low" },
  { label: "Suspicious Domains", value: 342, trend: "-8%", color: "text-risk-medium" },
  { label: "Flagged Domains", value: 89, trend: "-15%", color: "text-risk-high" },
  { label: "Total Checks", value: 4521, trend: "+23%", color: "text-primary" },
];

export default function RecruiterPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5" />
            Recruiter Intelligence
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Recruiter Verification
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Verify recruiter identities, check email domains, and cross-reference against our database of known scam contacts.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainStats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card glass-card glass-card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-risk-low" />
                      <span className="text-risk-low">{stat.trend}</span>
                      <span>this month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search Section */}
        <Card className="border-border bg-card glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5" />
              Verify Recruiter
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter an email address or domain to check against our threat intelligence database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="recruiter@company.com or domain.com"
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Search className="mr-2 h-4 w-4" />
                Verify
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Quick checks:</span>
              <button className="text-xs text-primary hover:underline">gmail.com</button>
              <button className="text-xs text-primary hover:underline">consultant-mail.net</button>
              <button className="text-xs text-primary hover:underline">protonmail.com</button>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          {/* Recent Verifications Table */}
          <Card className="border-border bg-card glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5" />
                Recent Verifications
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest recruiter checks from the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRecruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center
                        ${recruiter.status === "verified" ? "bg-risk-low/10" : 
                          recruiter.status === "suspicious" ? "bg-risk-medium/10" : "bg-risk-high/10"}
                      `}>
                        {recruiter.status === "verified" ? (
                          <CheckCircle className="h-5 w-5 text-risk-low" />
                        ) : recruiter.status === "suspicious" ? (
                          <AlertTriangle className="h-5 w-5 text-risk-medium" />
                        ) : (
                          <XCircle className="h-5 w-5 text-risk-high" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{recruiter.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{recruiter.domain}</span>
                          {recruiter.linkedIn && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              LinkedIn
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`
                          ${recruiter.status === "verified" ? "border-risk-low/30 bg-risk-low/10 text-risk-low" :
                            recruiter.status === "suspicious" ? "border-risk-medium/30 bg-risk-medium/10 text-risk-medium" :
                            "border-risk-high/30 bg-risk-high/10 text-risk-high"}
                        `}
                      >
                        {recruiter.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{recruiter.lastChecked}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Domain Intelligence */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="h-5 w-5" />
                  Domain Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-risk-high/10 border border-risk-high/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-risk-high" />
                      <span className="text-sm text-foreground">consultant-mail.net</span>
                    </div>
                    <span className="text-xs text-risk-high">47 reports</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-risk-high/10 border border-risk-high/30">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-risk-high" />
                      <span className="text-sm text-foreground">urgentwork-now.xyz</span>
                    </div>
                    <span className="text-xs text-risk-high">89 reports</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-risk-medium/10 border border-risk-medium/30">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-risk-medium" />
                      <span className="text-sm text-foreground">fasttrack-jobs.co</span>
                    </div>
                    <span className="text-xs text-risk-medium">12 reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Tips */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5" />
                  Verification Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <CheckCircle className="h-4 w-4 text-risk-low mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Check if the recruiter has a LinkedIn profile matching the company</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <CheckCircle className="h-4 w-4 text-risk-low mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Verify the email domain matches the company website</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <AlertTriangle className="h-4 w-4 text-risk-medium mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">Be cautious of free email domains for corporate recruiters</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
