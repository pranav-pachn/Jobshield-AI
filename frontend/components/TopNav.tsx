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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-background/60 px-6 backdrop-blur-xl">
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
            className="h-10 w-full rounded-full border-white/10 bg-white/5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 focus-visible:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 lg:flex hover:bg-white/10 transition-colors">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          </div>
          <span className="text-xs font-semibold tracking-wider text-green-300 uppercase">
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

        <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 md:flex hover:bg-white/10 transition-colors">
          <span className="max-w-40 truncate text-xs font-medium text-foreground">{user?.email ?? "Unknown user"}</span>
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
