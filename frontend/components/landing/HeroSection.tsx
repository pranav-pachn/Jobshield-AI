"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Database, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  staggerContainerVariants, 
  slideInDownVariants, 
  scaleInVariants 
} from "@/lib/animations/ambient";
import { ThreatNetworkVisualization } from "./ThreatNetworkVisualization";

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden bg-[#05080f]">
      {/* Editorial grid background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column - Editorial Narrative */}
        <motion.div 
          className="lg:col-span-6 space-y-8 text-left"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Eyebrow badge */}
          <motion.div variants={slideInDownVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            CYBERSECURITY INVESTIGATION ENGINE
          </motion.div>

          {/* Editorial Headline */}
          <div className="space-y-4">
            <motion.h1 
              variants={slideInDownVariants}
              className="text-5xl sm:text-6xl xl:text-7xl font-serif text-white tracking-tight leading-[1.08]"
            >
              Every fake job <br />
              leaves a <span className="text-[#00ff88] italic font-normal">signal.</span>
            </motion.h1>
            
            <motion.p 
              variants={slideInDownVariants}
              className="text-lg text-slate-300 max-w-xl leading-relaxed font-sans font-normal"
            >
              JobShield investigates fraudulent employment postings through recruiter verification, domain intelligence, and campaign graph correlation — calculating risk deterministically rather than guessing.
            </motion.p>
          </div>

          {/* Architectural Callout Pill */}
          <motion.div 
            variants={slideInDownVariants}
            className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-y border-slate-800/80 py-3"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>RAG-GROUNDED INTEL</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>CAMPAIGN CLUSTERING</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>DETERMINISTIC RULES</span>
            </div>
          </motion.div>

          {/* Action CTAs */}
          <motion.div variants={scaleInVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              size="lg"
              className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg px-8 shadow-[0_0_25px_rgba(0,255,136,0.25)] hover:shadow-[0_0_35px_rgba(0,255,136,0.4)] transition-all font-mono text-sm"
              onClick={() => router.push("/login")}
            >
              Analyze a Job
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-800 hover:bg-slate-900/80 text-slate-300 hover:text-white rounded-lg font-mono text-sm"
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See Investigation Flow ↓
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Column - Threat Network Visualization */}
        <motion.div
          variants={scaleInVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="lg:col-span-6 w-full"
        >
          <ThreatNetworkVisualization />
        </motion.div>

      </div>
    </section>
  );
};
