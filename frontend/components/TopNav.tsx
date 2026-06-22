"use client";

import { Search, Bell, Menu, ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function TopNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

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
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search intelligence reports, domains, or jobs..."
            className="h-10 w-full rounded-full border-slate-800 bg-[#0b1220] pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
          />
        </div>
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

        <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-[#0b1220] px-4 py-2 md:flex hover:bg-slate-800/50 transition-colors">
          <span className="max-w-40 truncate text-xs font-medium text-slate-200">{user?.email ?? "Unknown user"}</span>
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
