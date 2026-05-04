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
  Shield,
  Building2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext } from "react";

// ── Sidebar collapse context ────────────────────────────────────────────────
interface SidebarCtx {
  collapsed: boolean;
}
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Scan Job", href: "/analyze", icon: Search },
  { name: "Recruiter Check", href: "/recruiter-check", icon: Users },
  { name: "Company Check", href: "/company-check", icon: Building2 },
  { name: "Threat Intelligence", href: "/threat-intelligence", icon: ShieldAlert },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapseChange?.(next);
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/5 bg-card/40 backdrop-blur-xl lg:flex",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/5 hover:bg-white/5 transition-colors",
          collapsed ? "justify-center px-0" : "gap-2.5 px-6"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_12px_rgba(96,125,255,0.4)]">
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <span className="font-mono text-sm font-bold tracking-tighter text-foreground block whitespace-nowrap">
                JobShield
              </span>
              <span className="text-xs text-primary font-semibold whitespace-nowrap">AI SHIELD</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 overflow-x-hidden">
        <nav className={cn("flex flex-col gap-0.5", collapsed ? "px-1" : "px-3")}>
          {!collapsed && (
            <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Platform Menu
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-[inset_0_0_12px_rgba(96,125,255,0.1)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {/* Active left bar */}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all duration-200",
                    isActive ? "text-primary drop-shadow-lg" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]" />
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 hidden group-hover:flex items-center whitespace-nowrap rounded-md border border-white/10 bg-card/90 backdrop-blur-xl px-2 py-1 text-xs font-medium text-foreground shadow-lg z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security Status Footer */}
      <div className="border-t border-white/5 p-3 space-y-2">
        {!collapsed && (
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-white/5 bg-white/[3%] px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
              Docs
            </button>
            <button className="rounded-lg border border-white/5 bg-white/[3%] px-2 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all">
              Support
            </button>
          </div>
        )}

        {/* Status Indicator */}
        {!collapsed ? (
          <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 p-3 hover:border-primary/40 transition-all">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">Security Engine</p>
                <p className="text-[10px] text-green-400 font-medium">Online &amp; Monitoring</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(96,125,255,0.6)]"></span>
            </span>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-card/90 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 shadow-md"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
