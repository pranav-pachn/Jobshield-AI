"use client";

import { Bell, Search, HelpCircle, Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopNav() {
  return (
    <header className="hidden lg:flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search analyses, domains, recruiters..."
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-risk-low/10 border border-risk-low/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-risk-low opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-risk-low" />
          </span>
          <span className="text-xs font-medium text-risk-low">All Systems Operational</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-risk-high animate-pulse" />
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Threat Monitor</p>
            <p className="text-xs text-muted-foreground">Enterprise</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-cyber-purple flex items-center justify-center ring-2 ring-primary/20">
            <span className="text-xs font-semibold text-white">TM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
