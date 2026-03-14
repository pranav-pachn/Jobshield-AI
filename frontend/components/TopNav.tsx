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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-mono font-bold tracking-tight text-foreground">
            JobShield <span className="text-primary">AI</span>
          </span>
        </div>
      </div>

      <div className="hidden flex-1 items-center lg:flex">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search intelligence reports, domains, or jobs..."
            className="h-10 w-full rounded-full border-border bg-white/5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1.5 lg:flex">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Systems Nominal
          </span>
        </div>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background"></span>
        </Button>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1.5 md:flex">
          <span className="max-w-40 truncate text-xs text-muted-foreground">{user?.email ?? "Unknown user"}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
