"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Search } from "lucide-react";

export function ThreatGraphPreview() {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-md border border-slate-800 bg-[#0b1220] text-slate-400 text-xs font-mono tracking-wider">
          <Network className="w-4 h-4 text-purple-500" /> SCAM NETWORK VISUALIZATION
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
          Uncover Hidden Threat Networks
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-16">
          Scams are rarely isolated. Our threat graph maps connections between fake recruiters, malicious domains, and repeated fraud templates across the web.
        </p>

        {/* Graph Container */}
        <div className="relative w-full max-w-3xl mx-auto h-[400px] bg-[#0b1220] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center font-mono text-xs">
          
          {/* Decorative Grid */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-8">
            {/* Top Node: Domain */}
            <motion.div 
              className={`px-4 py-2 rounded-lg border bg-[#05080f] ${animationStep >= 0 ? 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700 text-slate-500'}`}
              animate={animationStep >= 0 ? { scale: 1.05 } : { scale: 1 }}
            >
              fakejobs-career.com
            </motion.div>

            {/* Edge 1 */}
            <motion.div 
              className="w-px bg-slate-700"
              initial={{ height: 0 }}
              animate={{ height: animationStep >= 1 ? 40 : 0 }}
            />

            {/* Middle Node: Recruiter */}
            <motion.div 
              className={`px-4 py-2 rounded-lg border bg-[#05080f] ${animationStep >= 1 ? 'border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-700 text-slate-500 opacity-0'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: animationStep >= 1 ? 1 : 0 }}
            >
              Gmail recruiter: hr.fake@gmail.com
            </motion.div>

            {/* Edges from Middle */}
            <div className="flex w-64 justify-between relative mt-0">
               {/* Edge 2 Left */}
               <motion.div 
                className="absolute left-1/2 top-0 w-px bg-slate-700 origin-top rotate-45"
                initial={{ height: 0 }}
                animate={{ height: animationStep >= 2 ? 60 : 0 }}
              />
               {/* Edge 2 Right */}
               <motion.div 
                className="absolute left-1/2 top-0 w-px bg-slate-700 origin-top -rotate-45"
                initial={{ height: 0 }}
                animate={{ height: animationStep >= 2 ? 60 : 0 }}
              />
               {/* Edge 2 Center */}
               <motion.div 
                className="absolute left-1/2 top-0 w-px bg-slate-700 origin-top"
                initial={{ height: 0 }}
                animate={{ height: animationStep >= 2 ? 60 : 0 }}
              />
            </div>

            {/* Bottom Nodes */}
            <div className="flex justify-center gap-12 mt-12 w-full">
              <motion.div 
                className={`px-3 py-2 rounded-lg border bg-[#05080f] ${animationStep >= 2 ? 'border-yellow-500/50 text-yellow-400' : 'opacity-0'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: animationStep >= 2 ? 1 : 0 }}
              >
                Victim Report #104
              </motion.div>

              <motion.div 
                className={`px-4 py-2 rounded-lg border bg-[#05080f] ${animationStep >= 3 ? 'border-red-500 border-2 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-110' : 'opacity-0'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: animationStep >= 3 ? 1 : 0 }}
              >
                Registration Fee Scam Pattern
              </motion.div>

              <motion.div 
                className={`px-3 py-2 rounded-lg border bg-[#05080f] ${animationStep >= 2 ? 'border-yellow-500/50 text-yellow-400' : 'opacity-0'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: animationStep >= 2 ? 1 : 0 }}
              >
                Victim Report #82
              </motion.div>
            </div>
          </div>
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none mix-blend-overlay" />
        </div>
      </div>
    </section>
  );
}
