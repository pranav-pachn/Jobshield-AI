"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  staggerContainerVariants, 
  slideInDownVariants, 
  scaleInVariants 
} from "@/lib/animations/ambient";
import { InvestigationResultCard } from "./InvestigationResultCard";

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden bg-[#05080f]">
      {/* Editorial grid background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      />
      
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column - Clean Product Story */}
        <motion.div 
          className="lg:col-span-7 space-y-8 text-left"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Eyebrow badge */}
          <motion.div variants={slideInDownVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            JOB FRAUD DETECTION
          </motion.div>

          {/* Editorial Headline */}
          <div className="space-y-5">
            <motion.h1 
              variants={slideInDownVariants}
              className="text-5xl sm:text-6xl xl:text-7xl font-serif text-white tracking-tight leading-[1.08]"
            >
              Every fake job <br />
              leaves a <span className="text-[#00ff88] italic font-normal">signal.</span>
            </motion.h1>
            
            <motion.p 
              variants={slideInDownVariants}
              className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed font-sans font-normal"
            >
              JobShield helps you spot fraudulent job postings before you apply, pay, or share your information.
            </motion.p>
          </div>

          {/* Action CTAs */}
          <motion.div variants={scaleInVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              size="lg"
              className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg px-8 py-6 shadow-[0_0_25px_rgba(0,255,136,0.25)] hover:shadow-[0_0_35px_rgba(0,255,136,0.4)] transition-all font-mono text-sm cursor-pointer"
              onClick={() => router.push("/signup")}
            >
              Analyze a Job
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-800 hover:bg-slate-900/80 text-slate-300 hover:text-white rounded-lg px-8 py-6 font-mono text-sm cursor-pointer"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See how it works ↓
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Column - Teaser Investigation Result Card */}
        <motion.div
          variants={scaleInVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="lg:col-span-5 w-full flex justify-center lg:justify-end"
        >
          <InvestigationResultCard />
        </motion.div>

      </div>
    </section>
  );
};
