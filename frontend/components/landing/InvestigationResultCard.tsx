"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Building2, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export const InvestigationResultCard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Ambient background glow behind card */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/10 to-red-500/10 blur-xl opacity-50 pointer-events-none" />

      {/* Main teaser card */}
      <div className="relative rounded-2xl bg-[#090d16]/95 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden font-sans">
        
        {/* Top bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#060a12] flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-300 font-semibold tracking-wider">JOBSHIELD</span>
          </div>
          <span className="text-slate-500 text-[10px]">ANALYSIS PREVIEW</span>
        </div>

        {/* Job Title & Risk Score */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                Sample Job
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Software Engineer
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Apex Innovations LLC
              </p>
            </div>

            {/* High Risk Score Box */}
            <div className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-right">
              <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-semibold">
                HIGH RISK
              </div>
              <div className="text-2xl font-bold font-mono text-red-400 leading-none mt-0.5">
                85<span className="text-xs text-red-500/70 font-normal"> / 100</span>
              </div>
            </div>
          </div>

          {/* Key teaser signals */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-medium">Registration fee requested</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">Suspicious domain registered 6 days ago</span>
            </div>
          </div>
        </div>

        {/* Card footer teaser link */}
        <div 
          onClick={() => {
            const el = document.getElementById("result");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-3 bg-[#060a12] border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white cursor-pointer group transition-colors"
        >
          <span>See why this was flagged</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </div>

      </div>
    </motion.div>
  );
};
