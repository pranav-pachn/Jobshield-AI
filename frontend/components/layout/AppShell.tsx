"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

      {/* Main Content */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar onCollapseChange={setSidebarCollapsed} />

        {/* Content area — offset by sidebar width on large screens */}
        <div
          className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            paddingLeft: undefined, // handled by class below
          }}
        >
          <div
            className="flex flex-1 flex-col overflow-hidden lg:transition-all lg:duration-300 lg:ease-in-out"
            style={{
              marginLeft: `${sidebarCollapsed ? 64 : 256}px`,
            }}
            // On mobile, no offset needed (sidebar is hidden)
          >
            {/* ── Top Navigation Bar ── */}
            <Topbar />

            {/* ── Page content ── */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
