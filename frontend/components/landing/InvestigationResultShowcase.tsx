"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const InvestigationResultShowcase: React.FC = () => {
  const router = useRouter();

  const signals = [
    { title: "Registration fee requested", score: "+40" },
    { title: "Suspicious domain", score: "+20" },
    { title: "Generic recruiter email", score: "+15" },
    { title: "Unrealistic salary", score: "+15" },
  ];

  return (
    <section id="result" className="py-28 px-6 bg-[#05080f] relative overflow-hidden border-t border-slate-900 scroll-mt-16">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono tracking-widest uppercase text-red-400">
            THE RESULT
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
            Don&apos;t just get a score. <br />
            <span className="text-white italic">See why.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-sans pt-2">
            Every point is tied to a specific risk signal, so you can see why the job was flagged.
          </p>
        </motion.div>

        {/* Large Result Card (Full Explanation) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto rounded-2xl bg-[#080c14] border border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Card Top Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-gradient-to-b from-red-500/5 to-transparent flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
                Investigation Verdict
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-2xl font-bold font-mono text-red-400 tracking-tight">
                  HIGH RISK
                </h3>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-3xl sm:text-4xl font-bold text-red-400">
                85 <span className="text-base font-normal text-slate-500">/ 100</span>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Why was this flagged?
              </span>

              <div className="divide-y divide-slate-800/60 border-y border-slate-800/60">
                {signals.map((sig) => (
                  <div 
                    key={sig.title} 
                    className="py-3 flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <ShieldAlert className="w-4 h-4 text-red-400/80 shrink-0" />
                      <span>{sig.title}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-red-400">
                      {sig.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Evidence Excerpt */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Evidence</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800/80 font-mono text-xs text-slate-300 italic leading-relaxed">
                &ldquo;Applicants are required to pay a mandatory $65 onboarding compliance & background verification fee prior to hardware dispatch.&rdquo;
              </div>
            </div>

            {/* Why This Matters */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Why this matters
              </span>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Multiple signals suggest this opportunity may not be what it appears to be.
              </p>
            </div>

            {/* Action */}
            <div className="pt-4">
              <Button
                className="w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-xl py-6 font-mono text-xs tracking-wider transition-all cursor-pointer"
                onClick={() => router.push("/signup")}
              >
                View Full Investigation →
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
