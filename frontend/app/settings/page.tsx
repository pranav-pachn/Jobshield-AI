import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Globe,
  User,
  Mail,
  Zap,
  CheckCircle
} from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Configure your JobShield AI platform preferences and integrations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
          {/* Main Settings */}
          <div className="space-y-6">
            {/* Profile */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Organization Name</label>
                    <Input 
                      defaultValue="Threat Monitor Enterprise" 
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contact Email</label>
                    <Input 
                      defaultValue="admin@threatmonitor.io" 
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure how you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "High-risk job alerts", description: "Get notified when high-risk jobs are detected", enabled: true },
                  { label: "New campaign detection", description: "Alerts for new scam campaigns", enabled: true },
                  { label: "Weekly digest", description: "Summary of weekly threat activity", enabled: false },
                  { label: "API usage alerts", description: "Notifications for API rate limits", enabled: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    <div className={`h-6 w-11 rounded-full p-0.5 transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                      <div className={`h-5 w-5 rounded-full bg-white transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* API Settings */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Key className="h-5 w-5" />
                  API Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage API keys and integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">API Key</label>
                  <div className="flex gap-2">
                    <Input 
                      type="password" 
                      defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxx" 
                      className="bg-secondary border-border text-foreground font-mono"
                    />
                    <Button variant="outline" className="border-border hover:bg-accent shrink-0">
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg border border-risk-low/30 bg-risk-low/10">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                  <div>
                    <p className="text-sm font-medium text-foreground">API Status: Operational</p>
                    <p className="text-xs text-muted-foreground">Last request: 2 minutes ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Info */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Zap className="h-5 w-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">Enterprise</span>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Calls</span>
                    <span className="text-foreground">45,234 / Unlimited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team Members</span>
                    <span className="text-foreground">8 / 25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="text-foreground">12.4 GB / 100 GB</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-border hover:bg-accent">
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-border bg-card glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-risk-low/10 border border-risk-low/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-risk-low" />
                    <span className="text-sm text-foreground">Two-Factor Auth</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-risk-low/10 border border-risk-low/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-risk-low" />
                    <span className="text-sm text-foreground">SSO Integration</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">IP Allowlist</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Configure</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
