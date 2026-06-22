"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldAlert, Terminal, Search, Shield, RefreshCw } from "lucide-react";

export function ThreatInvestigationDemo() {
  const [step, setStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView && !hasStarted) {
      setTimeout(() => setHasStarted(true), 500);
    }
  }, [isInView, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    const timings = [1000, 2500, 4000, 5000, 6500];
    let timer: NodeJS.Timeout;

    const advance = (s: number) => {
      if (s < timings.length) {
        timer = setTimeout(() => {
          setStep(s + 1);
          advance(s + 1);
        }, timings[s] - (s > 0 ? timings[s-1] : 0));
      }
    };

    advance(0);
    return () => clearTimeout(timer);
  }, [hasStarted]);

  const handleReplay = () => {
    setHasStarted(false);
    setStep(0);
    setTimeout(() => setHasStarted(true), 100);
  };

  return (
    <section id="demo" className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50">
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Live Threat Investigation</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Watch our intelligence engine parse a job description in real-time to uncover hidden scam vectors.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start bg-[#0b1220] rounded-xl border border-slate-800 shadow-2xl overflow-hidden p-1">
          
          {/* Left: Input Document */}
          <div className="bg-[#05080f] rounded-lg border border-slate-800/80 p-6 min-h-[400px] flex flex-col relative font-mono text-sm text-slate-300">
            <div className="flex items-center gap-2 text-slate-500 mb-6 pb-4 border-b border-slate-800">
              <Terminal className="w-4 h-4" /> target_document.txt
            </div>

            <div className="space-y-4 leading-relaxed">
              <p>Subject: <span className="text-white">URGENT: Software Engineer Position - Remote</span></p>
              <p>
                <motion.span 
                  animate={step >= 1 ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } : {}} 
                  className="transition-colors duration-500 px-1 -mx-1 rounded"
                >
                  Congratulations!
                </motion.span> 
                {' '}You have been selected for the position of Senior Frontend Developer at TechCorp Inc.
              </p>
              <p>
                This is a fully remote position offering{' '}
                <motion.span 
                  animate={step >= 2 ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' } : {}} 
                  className="transition-colors duration-500 px-1 -mx-1 rounded"
                >
                  $180,000 to $220,000 per year
                </motion.span>.
              </p>
              <p>
                To secure your spot and receive your company MacBook, please{' '}
                <motion.span 
                  animate={step >= 3 ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderBottom: '1px solid #ef4444' } : {}} 
                  className="transition-colors duration-500 px-1 -mx-1 rounded"
                >
                  pay the $49.99 background verification fee
                </motion.span>
                {' '}via the link below within the next 24 hours.
              </p>
              <p className="mt-8 text-slate-500">
                Regards,<br/>
                Hiring Manager<br/>
                <motion.span 
                  animate={step >= 4 ? { backgroundColor: 'rgba(250, 204, 21, 0.2)', color: '#facc15' } : {}} 
                  className="transition-colors duration-500 px-1 -mx-1 rounded"
                >
                  hr-techcorp@gmail.com
                </motion.span>
              </p>
            </div>
          </div>

          {/* Right: SOC Analysis */}
          <div className="p-6 lg:pl-10 min-h-[400px] flex flex-col justify-center">
            
            <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-white">Engine Activity</span>
                </div>
                {step < 5 ? (
                  <span className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <Search className="w-3 h-3 animate-pulse" /> SCANNING
                  </span>
                ) : (
                  <button onClick={handleReplay} className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
                    <RefreshCw className="w-3 h-3" /> REPLAY
                  </button>
                )}
              </div>

              {/* Threat Feed */}
              <div className="space-y-4 font-mono text-xs">
                <div className={`flex items-start gap-3 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  {step >= 1 ? <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mt-0.5" />}
                  <div>
                    <div className={step >= 1 ? 'text-red-400' : 'text-slate-500'}>Unsolicited Offer Pattern</div>
                    {step >= 1 && <div className="text-slate-400 mt-1">"Congratulations" without prior interview detected.</div>}
                  </div>
                </div>

                <div className={`flex items-start gap-3 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  {step >= 2 ? <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mt-0.5" />}
                  <div>
                    <div className={step >= 2 ? 'text-yellow-400' : 'text-slate-500'}>Salary Anomaly</div>
                    {step >= 2 && <div className="text-slate-400 mt-1">Compensation is 2.4x above market average for role.</div>}
                  </div>
                </div>

                <div className={`flex items-start gap-3 transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  {step >= 3 ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mt-0.5" />}
                  <div>
                    <div className={step >= 3 ? 'text-red-400 font-bold' : 'text-slate-500'}>Registration Fee Scam</div>
                    {step >= 3 && <div className="text-slate-400 mt-1">CRITICAL: Demand for upfront payment detected.</div>}
                  </div>
                </div>

                <div className={`flex items-start gap-3 transition-opacity duration-300 ${step >= 4 ? 'opacity-100' : 'opacity-30'}`}>
                  {step >= 4 ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> : <div className="w-4 h-4 rounded-full border border-slate-700 mt-0.5" />}
                  <div>
                    <div className={step >= 4 ? 'text-red-400 font-bold' : 'text-slate-500'}>Recruiter Mismatch</div>
                    {step >= 4 && <div className="text-slate-400 mt-1">Domain TechCorp using freemail @gmail.com.</div>}
                  </div>
                </div>
              </div>

              {/* Risk Score Result */}
              <AnimatePresence>
                {step >= 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-8 h-8 text-red-500" />
                      <div>
                        <div className="text-sm font-bold text-white">SCAM DETECTED</div>
                        <div className="text-xs text-red-400">Confidence: 98.4%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-red-500">92</div>
                      <div className="text-[10px] text-slate-400 font-mono">RISK SCORE</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
