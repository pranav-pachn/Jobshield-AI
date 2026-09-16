"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTA: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-28 px-6 bg-[#05080f] relative border-t border-slate-900 overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-[#080c14] text-slate-400 text-xs font-mono tracking-wider">
          <Lock className="w-3 h-3 text-[#00ff88]" />
          <span>CYBERSECURITY INVESTIGATION PLATFORM</span>
        </div>

        {/* Editorial Headline */}
        <h2 className="text-4xl sm:text-6xl font-serif text-white tracking-tight leading-[1.1]">
          Before you trust the job, <br />
          <span className="text-[#00ff88] italic font-normal">investigate it.</span>
        </h2>

        {/* Supporting description */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          JobShield checks the signals a human might miss.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg px-8 py-6 font-mono text-sm shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)] transition-all cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Analyze a Job →
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-slate-800 hover:bg-slate-900/80 text-slate-300 hover:text-white rounded-lg px-8 py-6 font-mono text-sm cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>

        {/* Quiet reassurance strip */}
        <div className="pt-4 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
            Specific Risk Signals
          </span>
          <span>•</span>
          <span>Clear Evidence Behind Every Verdict</span>
          <span>•</span>
          <span>No Guesswork</span>
        </div>

      </div>
    </section>
  );
};
