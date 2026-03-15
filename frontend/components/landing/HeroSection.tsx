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
        opacity={0.08} 
        particleCount={50} 
        animationSpeed={0.25}
        className="z-0"
      />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto space-y-8 text-center"
        variants={staggerContainerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Badge with enhanced styling */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-md hover:border-blue-400/60 transition-all duration-300"
          variants={slideInDownVariants}
        >
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm text-blue-200 font-semibold">AI-Powered Intelligence</span>
        </motion.div>

        {/* Main headline with word-by-word animation and gradient Verify */}
        <div className="space-y-4">
          <motion.div
            className="flex flex-col items-center justify-center flex-wrap gap-1"
            variants={staggerContainerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {headlineWords.map((word, index) => (
                word === "Verify." ? (
                  <motion.span
                    key={index}
                    className="text-5xl md:text-7xl font-bold tracking-tight"
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
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white"
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
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
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
            className="group relative px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-200 text-base active:scale-95 overflow-hidden"
            onClick={handleBeginAnalysis}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <span className="relative flex items-center gap-2">
              Begin Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </span>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="group relative px-8 py-6 border-blue-500/40 hover:border-blue-400/80 text-slate-200 hover:text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200 text-base hover:bg-blue-500/15 active:scale-95"
            onClick={() => router.push("/login")}
          >
            <span className="flex items-center gap-2">
              Sign In
            </span>
          </Button>
        </motion.div>

        {/* Stats/Trust indicators with enhanced styling */}
        <motion.div
          className="grid grid-cols-3 gap-8 pt-12 mt-12 border-t border-blue-500/20"
          variants={staggerContainerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {[
            { value: "99.9%", label: "Detection Accuracy", color: "text-blue-400" },
            { value: "150K+", label: "Threats Detected", color: "text-cyan-400" },
            { value: "Real-time", label: "Analysis", color: "text-purple-400" },
          ].map((stat, index) => (
            <motion.div key={index} variants={wordVariants} className="group">
              <div className={`text-3xl md:text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform duration-300`}>{stat.value}</div>
              <p className="text-sm text-slate-400 mt-2 group-hover:text-slate-300 transition-colors duration-300">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
