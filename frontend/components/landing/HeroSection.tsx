"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { 
  staggerContainerVariants, 
  slideInDownVariants, 
  wordVariants,
  scaleInVariants 
} from "@/lib/animations/ambient";
import { AmbientParticleGrid } from "@/components/animations/AmbientParticleGrid";

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const handleBeginAnalysis = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push("/analyze");
      return;
    }

    router.push("/login?next=%2Fanalyze");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Split headline into words for staggered animation
  const headlineWords = ["Don't", "Just", "Apply.", "Verify."];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
      {/* Ambient Particle Grid Background */}
      <AmbientParticleGrid 
        opacity={0.07} 
        particleCount={55} 
        animationSpeed={0.22}
        className="z-0"
      />

      {/* Animated gradient orbs with enhanced glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        {/* Primary blue orb - top left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-orb-glow" />
        
        {/* Secondary purple orb - bottom right */}
        <div className="absolute -bottom-32 -right-48 w-80 h-80 bg-purple-600/12 rounded-full blur-3xl animate-orb-glow animation-delay-2000" />
        
        {/* Tertiary cyan orb - center */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl animate-orb-glow animation-delay-4000" />
        
        {/* Additional accent orb for depth */}
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-orb-glow animation-delay-3000" />
      </div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto space-y-8 text-center"
        variants={staggerContainerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-blue-400/40 bg-blue-500/10 backdrop-blur-xl hover:bg-blue-500/15 transition-colors duration-300"
          variants={slideInDownVariants}
        >
          <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
          <span className="text-sm font-medium text-blue-200">AI-Powered Security</span>
        </motion.div>

        {/* Main headline with word-by-word animation and gradient Verify */}
        <div className="space-y-6">
          <motion.div
            className="flex flex-col items-center justify-center flex-wrap gap-2"
            variants={staggerContainerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {headlineWords.map((word, index) => (
                word === "Verify." ? (
                  <motion.span
                    key={index}
                    className="text-6xl md:text-8xl font-bold tracking-tighter"
                    variants={wordVariants}
                  >
                    <span 
                      className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-600"
                      style={{
                        backgroundSize: "200% 200%",
                        animation: "gradient-flow 6s ease-in-out infinite",
                      }}
                    >
                      {word}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key={index}
                    className="text-6xl md:text-8xl font-bold tracking-tighter text-white"
                    variants={wordVariants}
                  >
                    {word}
                  </motion.span>
                )
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          variants={slideInDownVariants}
        >
          Detect fraudulent job postings instantly using AI-powered scam analysis
          and threat intelligence. Protect your career from cyber threats.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8"
          variants={scaleInVariants}
        >
          <Button
            size="lg"
            className="group relative px-10 py-7 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/60 transition-all duration-200 text-base active:scale-95 overflow-hidden"
            onClick={handleBeginAnalysis}
          >
            <span className="relative flex items-center gap-2 z-10">
              Begin Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="px-10 py-7 border-blue-400/40 hover:border-cyan-400/60 text-slate-200 hover:text-white font-semibold rounded-xl backdrop-blur-md transition-all duration-200 text-base hover:bg-blue-500/15 active:scale-95 bg-white/5"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </motion.div>

        {/* Stats/Trust indicators */}
        <motion.div
          className="grid grid-cols-3 gap-8 pt-12 mt-8 border-t border-blue-500/10"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {[
            { value: "99.9%", label: "Detection Accuracy", color: "text-blue-400" },
            { value: "10K+", label: "Threats Analyzed", color: "text-cyan-400" },
            { value: "Real-time", label: "Analysis", color: "text-purple-400" },
          ].map((stat, index) => (
            <motion.div key={index} variants={wordVariants}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
