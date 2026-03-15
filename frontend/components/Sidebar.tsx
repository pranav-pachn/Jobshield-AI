"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  ShieldAlert, 
  FileText, 
  Settings,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyze Job", href: "/analyze", icon: Search },
  { name: "Recruiter Check", href: "/recruiter-check", icon: Users },
  { name: "Threat Intelligence", href: "/threat-intelligence", icon: ShieldAlert },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/5 bg-card/40 backdrop-blur-xl lg:flex">
      {/* Logo Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-6 hover:bg-white/5 transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-mono text-sm font-bold tracking-tighter text-foreground block">
            JobShield
          </span>
          <span className="text-xs text-primary font-semibold">AI SHIELD</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex flex-col gap-0.5 px-3">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground letter-spacing">
            Platform Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-3 border-primary shadow-[inset_0_0_12px_rgba(96,125,255,0.1),inset_-3px_0_8px_rgba(96,125,255,0.2)] pl-2"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover:border-l-2 hover:border-primary/50 hover:pl-2 border-l-3 border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive ? "text-primary drop-shadow-lg" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security Status Footer */}
      <div className="border-t border-white/5 p-4 space-y-3">
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="rounded-lg border border-white/5 bg-white/[3%] px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
            Docs
          </button>
          <button className="rounded-lg border border-white/5 bg-white/[3%] px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
            Support
          </button>
        </div>

        {/* Status Indicator */}
        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 p-4 hover:border-primary/40 transition-all">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 flex-shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]"></span>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Security Engine</p>
              <p className="text-[11px] text-green-400 font-medium">Online & Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
