"use client";

import { Search, Bell, Menu, ShieldCheck, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Command Center";
    if (pathname.startsWith("/scanner")) return "Threat Scanner";
    if (pathname.startsWith("/investigations")) return "Investigations";
    if (pathname.startsWith("/investigate")) return "Deep Investigation";
    if (pathname.startsWith("/threat-intelligence")) return "Threat Intelligence";
    if (pathname.startsWith("/campaigns")) return "Campaigns";
    if (pathname.startsWith("/recruiters")) return "Recruiter Intelligence";
    if (pathname.startsWith("/recruiter-check")) return "Recruiter Intelligence";
    if (pathname.startsWith("/company-check")) return "Company Intelligence";
    if (pathname.startsWith("/reports")) return "Intel Reports";
    if (pathname.startsWith("/evaluation")) return "Evaluation Center";
    if (pathname.startsWith("/review")) return "Review Queue";
    if (pathname.startsWith("/security")) return "Security Center";
    if (pathname.startsWith("/settings") || pathname.startsWith("/account")) return "Account Settings";
    return "";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#05080f]/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            JobShield <span className="text-primary">AI</span>
          </span>
        </div>
      </div>

      <div className="hidden flex-1 items-center lg:flex">
        <h1 className="text-lg font-bold font-display tracking-tight text-slate-100">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-[#0b1220] px-3 py-1.5 lg:flex hover:bg-slate-800/50 transition-colors">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.6)]"></span>
          </div>
          <span className="text-xs font-semibold tracking-wider text-[#00ff88] uppercase">
            Systems Nominal
          </span>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all rounded-lg"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background shadow-[0_0_8px_rgba(96,125,255,0.6)]"></span>
        </Button>

        <div className="hidden items-center gap-3 rounded-lg border border-slate-800 bg-[#0b1220] px-4 py-1.5 md:flex hover:bg-slate-800/50 transition-colors">
          <div className="flex flex-col items-end">
            <span className="max-w-40 truncate text-xs font-medium text-slate-200">{user?.email ?? "Unknown user"}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{user?.role ?? "USER"}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
