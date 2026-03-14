"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { TopNav } from "@/components/TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64">
        <TopNav />
        <main className="min-h-[calc(100vh-4rem)] pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
