"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, CheckCircle, Loader2, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_RESULT = {
  score: 82,
  verdict: "High Risk — Likely Scam",
  tags: ["Suspicious Domain", "Fake HR Email", "Vague Compensation", "Urgency Pressure"],
  explanation:
    "This job posting exhibits multiple high-confidence scam indicators: the recruiter email domain was registered 11 days ago and has no corporate footprint, the salary range is implausibly high for the listed role, and the application demands personal documentation before any interview stage.",
};

function ShimmerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-2/3 rounded-lg bg-slate-700/60" />
      <div className="h-4 w-full rounded-lg bg-slate-700/40" />
      <div className="h-4 w-5/6 rounded-lg bg-slate-700/40" />
      <div className="flex gap-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-28 rounded-full bg-slate-700/50" />
        ))}
      </div>
    </div>
  );
}

function RiskScoreBar({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-gradient-to-r from-red-600 to-rose-500" :
    score >= 40 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
    "bg-gradient-to-r from-emerald-500 to-green-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">Scam Probability</span>
        <motion.span
          className={`text-2xl font-extrabold ${score >= 70 ? "text-red-400" : score >= 40 ? "text-amber-400" : "text-emerald-400"}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        >
          {score}%
        </motion.span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}

const PLACEHOLDER = `Senior Software Engineer – Remote\n\nCompany: TechVentures Global Ltd\nSalary: $180,000 – $220,000/year\n\nWe need an engineer immediately. Apply ASAP. Send your CV + SSN + bank details to hr@techventures-global.careers to get started today...`;

export function LiveDemoSection() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleAnalyze = () => {
    if (!input.trim()) {
      setInput(PLACEHOLDER);
      return;
    }
    setStatus("loading");
    setTimeout(() => setStatus("done"), 2600);
  };

  const handleReset = () => {
    setStatus("idle");
    setInput("");
  };

  return (
    <section id="live-demo" className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14 space-y-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">
              Try It Live
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            See the AI in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Action
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Paste a job description below and watch our AI analyze it for scam indicators in real-time.
          </p>
        </motion.div>

        {/* Panel */}
        <motion.div
          className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Panel header bar */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-blue-500/10 bg-slate-900/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
            <span className="ml-3 text-xs text-slate-500 font-mono">JobShield AI — Scam Analyzer</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Input area */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300">
                Job Description or URL
              </label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste a job post here, or click Analyze to load a demo..."
                  rows={6}
                  disabled={status === "loading"}
                  className="w-full rounded-xl border border-blue-500/20 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 font-mono disabled:opacity-60"
                />
                {status === "done" && (
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                      <AlertTriangle className="w-3 h-3" /> Analyzed
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={handleAnalyze}
                  disabled={status === "loading"}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl px-7 py-5 shadow-lg hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Analyze
                    </span>
                  )}
                </Button>
              </motion.div>
              {status === "done" && (
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Reset
                </Button>
              )}
              <span className="text-xs text-slate-600 ml-auto">
                Demo uses mock data — no job post is stored.
              </span>
            </div>

            {/* Results area */}
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6"
                >
                  <ShimmerSkeleton />
                </motion.div>
              )}

              {status === "done" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="rounded-xl border border-red-500/25 bg-gradient-to-br from-red-950/30 to-slate-900/60 p-6 space-y-5"
                >
                  {/* Verdict header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-base font-bold text-red-300">
                        {DEMO_RESULT.verdict}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> AI Verified
                    </span>
                  </div>

                  {/* Risk score bar */}
                  <RiskScoreBar score={DEMO_RESULT.score} />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {DEMO_RESULT.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-300"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* AI Explanation */}
                  <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400 tracking-wide uppercase">
                        AI Explanation
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {DEMO_RESULT.explanation}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg text-xs px-4"
                    >
                      Full Report <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                    <span className="text-xs text-slate-500">or sign up for unlimited scans</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
