"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Handle Escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (PUBLIC_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#05080f] relative text-foreground">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-in drawer container */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#05080f] shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-300">
            <Sidebar isMobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar onCollapseChange={setSidebarCollapsed} />

        {/* Content area — offset by sidebar width on large screens */}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out min-w-0",
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          {/* Top Navigation Bar */}
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
