"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTA: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-28 px-6 bg-[#05080f] relative border-t border-slate-800/80 overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-[#090d16] text-slate-400 text-xs font-mono tracking-wider">
          <Lock className="w-3 h-3 text-[#00ff88]" />
          <span>CYBERSECURITY INVESTIGATION PLATFORM</span>
        </div>

        {/* Editorial Headline */}
        <h2 className="text-4xl sm:text-6xl font-serif text-white tracking-tight leading-[1.1]">
          Stop Guessing. <br />
          <span className="text-[#00ff88] italic font-normal">Start Investigating.</span>
        </h2>

        {/* Supporting description */}
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          Deploy deterministic threat detection, domain intelligence, and campaign correlation to safeguard your career from predatory employment fraud.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg px-8 py-6 font-mono text-sm shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)] transition-all"
            onClick={() => router.push("/signup")}
          >
            Analyze a Job Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-slate-800 hover:bg-slate-900/80 text-slate-300 hover:text-white rounded-lg px-8 py-6 font-mono text-sm"
            onClick={() => router.push("/login")}
          >
            Analyst Sign In
          </Button>
        </div>

        {/* Micro-guarantee */}
        <div className="pt-4 text-xs font-mono text-slate-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
            Audited Risk Weights
          </span>
          <span>•</span>
          <span>Zero Hallucinated Scores</span>
          <span>•</span>
          <span>No Credit Card Required</span>
        </div>

      </div>
    </section>
  );
};
