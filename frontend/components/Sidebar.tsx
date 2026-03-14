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
  { name: "Threat Intelligence", href: "#", icon: ShieldAlert },
  { name: "Reports", href: "#", icon: FileText },
  { name: "Settings", href: "#", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-mono text-lg font-bold tracking-tight text-foreground">
          JobShield <span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="flex flex-col gap-1 px-3">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_var(--color-primary)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Security Engine</p>
              <p className="text-[10px] text-primary">Active & Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
