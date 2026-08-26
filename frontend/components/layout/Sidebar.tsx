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
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext } from "react";
import { getStoredUser } from "@/lib/auth";

// ── Sidebar collapse context ────────────────────────────────────────────────
interface SidebarCtx {
  collapsed: boolean;
}
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const NAV_ITEMS = [
  { name: "Command Center", href: "/dashboard", icon: LayoutDashboard },
  { name: "Threat Scanner", href: "/analyze", icon: Search },
  { name: "Deep Investigation", href: "/investigate", icon: Search },
  { name: "Recruiter Intel", href: "/recruiter-check", icon: Users },
  { name: "Company Intel", href: "/company-check", icon: Building2 },
  { name: "Global Intelligence", href: "/threat-intelligence", icon: ShieldAlert },
  { name: "Intel Reports", href: "/reports", icon: FileText },
  { name: "Evaluation Center", href: "/evaluation", icon: Activity },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Security", href: "/settings", icon: Settings },
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
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-slate-800 bg-[#05080f] lg:flex",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-slate-800 hover:bg-slate-800/50 transition-colors",
          collapsed ? "justify-center px-0" : "gap-2.5 px-6"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            <Shield className="h-5 w-5 text-blue-400" />
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
            <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Operations
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const user = getStoredUser();
            const userRole = user?.role || "USER";

            // Restrict Evaluation Center to ANALYST or ADMIN
            if (item.name === "Evaluation Center" && !["ANALYST", "ADMIN"].includes(userRole)) {
              return null;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                  collapsed && "justify-center px-0"
                )}
              >
                {/* Active left border indicator */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-all duration-200",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.name}</span>
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

      {/* Footer Area */}
      <div className="mt-auto border-t border-slate-800 bg-[#05080f] p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0b1220] p-3 shadow-inner">
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00ff88]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">Security Engine</span>
              <span className="text-[10px] font-mono text-[#00ff88]">ONLINE</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00ff88]"></span>
            </span>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-[#0b1220] text-slate-400 shadow-md transition-all hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 z-50 absolute -right-4 top-4"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
