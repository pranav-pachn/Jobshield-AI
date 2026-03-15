"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-transparent backdrop-blur-md border-b border-blue-500/10">
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
            className="text-slate-400 hover:text-white transition-colors duration-150 active:scale-95"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-150 active:scale-95"
            onClick={() => router.push("/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};
