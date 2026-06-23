"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldAlert, CheckCircle2, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  staggerContainerVariants, 
  slideInDownVariants, 
  scaleInVariants 
} from "@/lib/animations/ambient";

// Mini demo steps
const DEMO_STEPS = [
  { id: 1, text: "Scanning job description...", type: "info", delay: 800 },
  { id: 2, text: "Analyzing recruiter domain: hr@startup-hiring.net", type: "info", delay: 1800 },
  { id: 3, text: "Domain registered 4 days ago", type: "warning", delay: 2800 },
  { id: 4, text: "Registration fee pattern found", type: "danger", delay: 3800 },
  { id: 5, text: "High confidence scam match", type: "danger", delay: 4800 },
];

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-play the mini demo
    const timers = DEMO_STEPS.map(step => 
      setTimeout(() => {
        setActiveSteps(prev => [...prev, step.id]);
        if (step.id === DEMO_STEPS.length) {
          setTimeout(() => setScanComplete(true), 600);
        }
      }, step.delay)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-6 overflow-hidden bg-[#05080f]">
      
      {/* SOC Scanline background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "100% 4px"
        }}
      />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column - Narrative */}
        <motion.div 
          className="space-y-8"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <motion.div variants={slideInDownVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE THREAT DETECTION
          </motion.div>

          <div className="space-y-4">
            <motion.h1 
              variants={slideInDownVariants}
              className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              Every fake job <br className="hidden md:block" />
              leaves a <span className="text-[#00ff88]">signal.</span>
            </motion.h1>
            
            <motion.p 
              variants={slideInDownVariants}
              className="text-lg text-slate-400 max-w-lg leading-relaxed"
            >
              Stop guessing if an offer is real. Our cybersecurity intelligence engine detects job scams, verifies recruiters, and uncovers fraud before you become a victim.
            </motion.p>
          </div>

          <motion.div variants={scaleInVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg px-8 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all"
              onClick={() => router.push("/login")}
            >
              Analyze a Job
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 hover:bg-slate-800 text-white rounded-lg"
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Full Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Column - Mini Live Investigation Card */}
        <motion.div
          variants={scaleInVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="relative lg:ml-auto w-full max-w-md"
        >
          <div className="rounded-xl border border-slate-800 bg-[#0b1220] shadow-2xl overflow-hidden flex flex-col font-mono text-sm relative">
            {/* Window Header */}
            <div className="bg-[#05080f] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="text-slate-500 text-xs tracking-widest flex items-center gap-2">
                JOBSHIELD INTELLIGENCE SCAN
              </div>
              <div className="text-xs font-bold text-[#00ff88] flex items-center gap-2">
                STATUS: ACTIVE <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-5 min-h-[360px] flex flex-col">
              
              {/* Fake job snippet & Pipeline */}
              <div className="text-slate-400 text-xs bg-[#05080f] p-3 rounded border border-slate-800/50 relative overflow-hidden flex flex-col gap-3">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <div>
                  <span className="text-slate-300 font-semibold block mb-1">Target: Remote Software Engineer</span>
                  "Congratulations! You are selected. Pay the $50 background check fee to begin..."
                </div>
                
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-slate-500 block mb-2 tracking-wider">Pipeline:</span>
                  <div className="space-y-1 text-[#00ff88]">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Content Scan</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Recruiter Verification</div>
                    <AnimatePresence>
                      {activeSteps.includes(3) && (
                        <motion.div key="threat-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Threat Match</motion.div>
                      )}
                      {scanComplete && (
                        <motion.div key="risk-calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Risk Calculation</motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Feed logs */}
              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {DEMO_STEPS.filter(step => activeSteps.includes(step.id)).map(step => (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-slate-600 mt-0.5">▶</span>
                      <span className={
                        step.type === 'danger' ? 'text-red-400' :
                        step.type === 'warning' ? 'text-yellow-400' : 'text-blue-300'
                      }>
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Final Score Overlay */}
              <AnimatePresence>
                {scanComplete && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-slate-500 mb-1">FINAL VERDICT</div>
                      <div className="text-red-500 font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> HIGH RISK
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">CONFIDENCE</div>
                      <div className="text-red-400 font-bold text-xl">96%</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Overlay scanline */}
            {!scanComplete && (
              <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent pointer-events-none animate-[scanner_2s_ease-in-out_infinite]" />
            )}
          </div>

          {/* Decorative background accents for the card */}
          <div className="absolute -z-10 -inset-4 bg-gradient-to-tr from-red-500/5 to-blue-500/5 blur-2xl rounded-3xl" />
        </motion.div>

      </div>
    </section>
  );
};
