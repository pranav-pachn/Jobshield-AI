"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Zap, AlertTriangle, Shield, CheckCircle, RotateCcw, ArrowRight, Loader2, FileText, Check, AlertOctagon, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AutoAnalysisDemo() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-150px" });

  useEffect(() => {
    if (isInView && !hasStarted && step === 0) {
      // Start auto-play after a brief delay when scrolled into view
      const timer = setTimeout(() => {
        setHasStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasStarted, step]);

  // Auto-play sequence
  useEffect(() => {
    if (!hasStarted) return;

    const timings = [
      1500, // Step 0 -> 1: Show job offer, wait 1.5s
      2000, // Step 1 -> 2: "Analyzing job content..."
      2500, // Step 2 -> 3: "Scanning threat signals..."
      2000, // Step 3 -> 4: "Checking recruiter intelligence..."
      1000, // Step 4 -> 5: "Reveal Risk Score"
      2000, // Step 5 -> 6: "Explainability card"
      800,  // Step 6 -> 7: "WOW Network Effect"
    ];

    let timer: NodeJS.Timeout;

    const advanceStep = (currentStep: number) => {
      if (currentStep < timings.length) {
        timer = setTimeout(() => {
          setStep((s) => s + 1);
          advanceStep(currentStep + 1);
        }, timings[currentStep]);
      }
    };

    advanceStep(0);

    return () => clearTimeout(timer);
  }, [hasStarted]);

  const handleReplay = () => {
    setHasStarted(false);
    setStep(0);
    setTimeout(() => {
      setHasStarted(true);
    }, 100);
  };

  return (
    <section id="live-demo" className="relative py-28 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto w-full" ref={containerRef}>
        {/* Header */}
        <motion.div
          className="text-center mb-12 space-y-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">
              See JobShield AI in Action
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Instant Threat Detection
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Watch how our Hybrid Threat Analysis Engine dissects a real-world scam.
          </p>
        </motion.div>

        {/* Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input / Output Display */}
          <motion.div
            className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Panel header bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-blue-500/10 bg-slate-900/50">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-mono">Incoming Job Offer</span>
              {hasStarted && step < 4 && (
                <span className="ml-auto flex items-center gap-2 text-xs text-blue-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                </span>
              )}
            </div>

            <div className="p-6 md:p-8">
              {/* Fake Textarea content */}
              <div className="relative mb-6">
                <div className="w-full rounded-xl border border-blue-500/20 bg-slate-900/60 p-5 text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                  <span className="font-semibold text-slate-200 block mb-2">Subject: Remote Data Entry Position - Hiring Immediately!</span>
                  We are hiring immediately for a Remote Data Entry position.{"\n"}
                  Earn ₹80,000/month working from home 2-3 hours a day.{"\n\n"}
                  To secure your spot, please pay the ₹999 registration and verification fee using the link below...
                </div>
              </div>

              {/* Progress and Analysis Area */}
              <div className="min-h-[220px]">
                <AnimatePresence mode="wait">
                  
                  {step === 0 && (
                     <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 pt-10"
                     >
                       <FileText className="w-8 h-8 opacity-50" />
                       <p className="text-sm">Job offer received. Waiting for analysis...</p>
                     </motion.div>
                  )}

                  {step >= 1 && step < 4 && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 pt-4"
                    >
                      {/* Step 1: Content Analysis */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                           <Loader2 className={`w-4 h-4 ${step === 1 ? 'animate-spin text-blue-400' : 'text-emerald-500 hidden'}`} />
                           {step > 1 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                           🧠 Analyzing job content...
                        </div>
                        {step === 1 && (
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500 rounded-full"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1.5, ease: "linear" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Step 2: Threat Signals */}
                      {step >= 2 && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                             <Loader2 className={`w-4 h-4 ${step === 2 ? 'animate-spin text-purple-400' : 'hidden'}`} />
                             {step > 2 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                             Scanning threat signals...
                          </div>
                          <div className="pl-6 space-y-2 text-xs">
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-red-400">
                               <Check className="w-3 h-3" /> Payment request detected
                             </motion.div>
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 text-amber-400">
                               <Check className="w-3 h-3" /> Unrealistic salary pattern
                             </motion.div>
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }} className="flex items-center gap-2 text-amber-400">
                               <Check className="w-3 h-3" /> Urgency language found
                             </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3: Recruiter Intelligence */}
                      {step >= 3 && (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                             <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                             Checking recruiter intelligence...
                          </div>
                          <div className="pl-6 space-y-2 text-xs">
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-red-400">
                               <AlertTriangle className="w-3 h-3" /> Free email provider detected
                             </motion.div>
                             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 text-red-400">
                               <AlertTriangle className="w-3 h-3" /> Company domain mismatch
                             </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4+: Reveal Score */}
                  {step >= 4 && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-slate-900/80 p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="w-6 h-6 text-red-500" />
                          <span className="text-xl font-extrabold text-red-400 tracking-tight">HIGH RISK</span>
                        </div>
                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs font-semibold text-red-400">
                          Scam Detected
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-medium text-slate-400">Risk Score</span>
                          <span className="text-3xl font-black text-red-500">87%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500"
                            initial={{ width: 0 }}
                            animate={{ width: "87%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 text-right">Confidence: 82%</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Explainability & WOW Effect */}
          <div className="space-y-6">
            
            <AnimatePresence>
              {/* Step 5+: Explainability Card */}
              {step >= 5 && (
                <motion.div
                  key="explainability"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-blue-500/20 bg-slate-900/60 backdrop-blur-xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">Why was this flagged?</h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Critical Signals</p>
                    
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-200">Registration fee request</p>
                        <p className="text-xs text-red-300/70 mt-1">Legitimate employers never ask for payment to process an application or secure a job.</p>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-200">Suspicious recruiter identity</p>
                        <p className="text-xs text-amber-300/70 mt-1">Contact uses a free email provider but claims to represent a large corporation.</p>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-200">Similar scam pattern found</p>
                        <p className="text-xs text-amber-300/70 mt-1">This exact phrasing matches 12 known scams in our threat database.</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {/* Step 6+: WOW Network Effect */}
              {step >= 6 && (
                <motion.div
                  key="network"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-slate-900/60 backdrop-blur-xl p-6 shadow-xl relative overflow-hidden"
                >
                  {/* Subtle background nodes */}
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                     <Network className="absolute -right-4 -bottom-4 w-32 h-32 text-purple-500" />
                  </div>

                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Network className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Threat Intelligence Graph</h3>
                  </div>

                  <div className="flex flex-col items-center justify-center py-4 relative z-10 font-mono text-xs">
                    {/* Graph Visualization */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-600 text-slate-300 z-10"
                    >
                      fakejobs.xyz
                    </motion.div>
                    
                    <motion.div 
                      initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 0.4 }}
                      className="w-px bg-purple-500/50"
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
                      className="px-4 py-2 bg-red-900/50 rounded-lg border border-red-500/50 text-red-300 z-10 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                      registration fee
                    </motion.div>
                    
                    <motion.div 
                      initial={{ height: 0 }} animate={{ height: 30 }} transition={{ delay: 0.8 }}
                      className="w-px bg-purple-500/50"
                    />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
                      className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-600 text-slate-300 z-10"
                    >
                      fake recruiter
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {/* Step 7: Final CTA Actions */}
              {step >= 7 && (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 pt-4"
                >
                  <Button
                    onClick={() => router.push("/login")}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl py-6 shadow-lg hover:shadow-blue-500/40 transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      Analyze Real Job <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReplay}
                    className="py-6 px-6 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Replay
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
