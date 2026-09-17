"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ShieldAlert,
  FileText,
  Settings,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Sidebar collapse context ────────────────────────────────────────────────
interface SidebarCtx {
  collapsed: boolean;
}
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

type NavItem = { name: string; href: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { name: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    name: "WORKSPACE",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analyze", href: "/investigate", icon: Search },
      { name: "Investigations", href: "/investigations", icon: ShieldAlert },
    ],
  },
  {
    name: "INTELLIGENCE",
    items: [
      { name: "Threat Intel", href: "/threat-intelligence", icon: Activity },
      { name: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    name: "SYSTEM",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onCollapseChange, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    onCollapseChange?.(next);
  }

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#05080f] text-foreground select-none",
        isMobile
          ? "h-full w-full border-r border-slate-800/80"
          : cn(
              "fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-800/80 lg:flex",
              "transition-all duration-300 ease-in-out",
              collapsed ? "w-16" : "w-64"
            )
      )}
    >
      {/* Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-slate-800/80 transition-colors",
          isMobile ? "justify-between px-5" : (collapsed ? "justify-center px-0" : "gap-3 px-5")
        )}
      >
        <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-2.5 min-w-0 group">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:border-blue-500/40 transition-colors">
            <Shield className="h-4 w-4" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 overflow-hidden">
              <span className="font-serif text-base tracking-tight text-slate-100 block whitespace-nowrap">
                JobShield
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block leading-none">
                Intelligence
              </span>
            </div>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 overflow-x-hidden">
        <nav className={cn("flex flex-col gap-5", !isMobile && collapsed ? "px-1.5" : "px-3")}>
          {NAV_GROUPS.map((group) => {
            return (
              <div key={group.name} className="flex flex-col gap-1">
                {(!collapsed || isMobile) && (
                  <div className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {group.name}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleLinkClick}
                      title={!isMobile && collapsed ? item.name : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-slate-800/90 text-white font-semibold"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                        !isMobile && collapsed && "justify-center px-0"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (!collapsed || isMobile) && (
                        <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-500" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                        )}
                      />
                      {(!collapsed || isMobile) && (
                        <span className="flex-1 truncate text-xs font-sans tracking-tight">{item.name}</span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {!isMobile && collapsed && (
                        <div className="absolute left-full ml-2 hidden group-hover:flex items-center whitespace-nowrap rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-xl z-50">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with User Avatar & Info (No neon status) */}
      <div className="mt-auto border-t border-slate-800/80 bg-[#05080f] p-3 flex flex-col gap-2">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-slate-800/40 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1 truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.email || "analyst@jobshield.ai"}</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{user?.role || "OPERATOR"}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200" title={user?.email || "User"}>
              {userInitial}
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button (desktop only) */}
      {!isMobile && (
        <button
          onClick={toggle}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900 text-slate-400 shadow-md transition-all hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 z-50 absolute -right-3.5 top-4.5"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </aside>
  );
}
