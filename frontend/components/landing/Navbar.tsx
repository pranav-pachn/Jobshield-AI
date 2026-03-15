"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-xl border-b border-blue-500/20 shadow-lg shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-150" />
            <div className="relative bg-slate-950 px-2 py-1 rounded-lg">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            JobShield<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">AI</span>
          </span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-blue-300 transition-colors duration-200 active:scale-95"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            className="group relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-200 active:scale-95 overflow-hidden"
            onClick={() => router.push("/signup")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-300/15 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <span className="relative">Get Started</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
