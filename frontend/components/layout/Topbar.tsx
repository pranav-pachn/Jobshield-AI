"use client";

import { Bell, Menu, Shield, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Overview";
    if (pathname.startsWith("/investigate")) return "Analyze";
    if (pathname.startsWith("/investigations")) return "Investigations";
    if (pathname.startsWith("/threat-intelligence")) return "Threat Intelligence";
    if (pathname.startsWith("/reports")) return "Investigation Reports";
    if (pathname.startsWith("/campaigns")) return "Campaigns";
    if (pathname.startsWith("/recruiters")) return "Recruiter Intelligence";
    if (pathname.startsWith("/company-check")) return "Company Verification";
    if (pathname.startsWith("/settings")) return "Settings";
    return "JobShield";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-[#05080f]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3 lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <span className="font-serif text-base text-slate-100">
            JobShield
          </span>
        </div>
      </div>

      <div className="hidden flex-1 items-center lg:flex">
        <h1 className="text-base font-serif text-slate-100 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-md border border-slate-800 bg-surface px-3 py-1.5 md:flex">
          <div className="flex flex-col items-end">
            <span className="max-w-40 truncate text-xs font-sans text-slate-200">{user?.email ?? "User"}</span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{user?.role ?? "OPERATOR"}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-rose-400 transition-colors"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
