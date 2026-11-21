"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  mode?: "login" | "signup";
}

export function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative w-full min-h-screen bg-[#05080f] text-slate-200 antialiased selection:bg-[#00ff88]/20 selection:text-[#00ff88] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Centered Brand Header */}
      <div className="relative z-10 mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/40 rounded-xl p-1 transition-transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.12)] group-hover:border-emerald-400/50 group-hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] transition-all duration-200">
            <Shield className="w-5 h-5 text-[#00ff88]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight font-sans">
            JobShield
          </span>
        </Link>
      </div>

      {/* Clean Card Container */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto">
        <div className="rounded-2xl bg-[#090d16]/95 border border-slate-800/90 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl p-7 sm:p-9">
          {children}
        </div>
      </div>
    </main>
  );
}
