"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";

interface AuthShellProps {
  children: React.ReactNode;
  mode: "login" | "signup";
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

export function AuthShell({ children, mode }: AuthShellProps) {
  const router = useRouter();

  return (
    <main className="relative w-full min-h-screen bg-[#05080f] text-slate-200 antialiased selection:bg-[#00ff88]/20 selection:text-[#00ff88] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Very subtle ambient green glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Quiet Product Statement & Signal Motif (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-12 pr-6">
          <div className="space-y-8">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus:outline-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-20 group-hover:opacity-60 transition-opacity duration-200" />
                <div className="relative bg-[#090d16] px-2.5 py-2 rounded-lg border border-slate-800 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00ff88]" />
                </div>
              </div>
              <span className="text-white font-bold text-xl tracking-tight font-sans">
                JobShield
              </span>
            </Link>

            {/* Editorial Statement */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-serif text-white tracking-tight leading-[1.12]">
                Every fake job <br />
                leaves a <span className="text-[#00ff88] italic font-normal">signal.</span>
              </h1>

              <p className="text-slate-400 text-base leading-relaxed max-w-md font-sans">
                Investigate suspicious employment opportunities before they cost you time, money, or personal data.
              </p>
            </div>
          </div>

          {/* Minimal Abstract Signal Motif */}
          <div className="pt-6 border-t border-slate-900/90 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                <div className="w-8 h-px bg-emerald-500/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <div className="w-8 h-px bg-slate-800" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-[11px] font-mono text-slate-500 tracking-wider">
                TRACE INVESTIGATION
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Enter the system to inspect recruiter authenticity, domain origin, and payment requests.
            </p>
          </div>
        </div>

        {/* Right Column: Clean Authentication Form */}
        <div className="w-full lg:col-span-6 max-w-[430px] mx-auto">
          {/* Top navigation (Back & mode switch) */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            {/* Mode switch */}
            <div className="inline-flex items-center rounded-lg bg-[#090d16] p-0.5 border border-slate-800 text-xs font-mono">
              <Link
                href="/login"
                className={`px-3 py-1 rounded-md transition-all ${
                  mode === "login"
                    ? "bg-slate-800 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`px-3 py-1 rounded-md transition-all ${
                  mode === "signup"
                    ? "bg-slate-800 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Form Container Card */}
          <div className="relative rounded-2xl bg-[#080c14] border border-slate-800/90 shadow-2xl p-7 sm:p-9">
            {/* Mobile-only logo */}
            <div className="flex lg:hidden items-center justify-center gap-2.5 mb-6">
              <div className="bg-[#090d16] p-1.5 rounded-lg border border-slate-800">
                <Shield className="w-4 h-4 text-[#00ff88]" />
              </div>
              <span className="text-white font-bold text-lg font-sans">JobShield</span>
            </div>

            {children}
          </div>
        </div>

      </div>
    </main>
  );
}
