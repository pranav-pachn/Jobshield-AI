"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  staggerContainerVariants, 
  slideInDownVariants, 
  wordVariants,
  scaleInVariants 
} from "@/lib/animations/ambient";
import { AmbientParticleGrid } from "@/components/animations/AmbientParticleGrid";

interface Particle {
  top: number;
  left: number;
  rotate: number;
  xAnim: number;
  duration: number;
  delay: number;
}

// Helper component for floating particles with stable random positions
function FloatingParticles(props: { count: number }) {
  const [particles, setParticles] = React.useState<Particle[] | null>(null);

  React.useEffect(function() {
    var arr: Particle[] = [];
    for (var i = 0; i < props.count; i++) {
      arr.push({
        top: 10 + Math.random() * 80,
        left: 5 + Math.random() * 90,
        rotate: Math.random() * 360,
        xAnim: -10 + Math.random() * 20,
        duration: 6 + Math.random() * 4,
        delay: i * 0.5
      });
    }
    setParticles(arr);
  }, [props.count]);

  if (!particles) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {particles.map(function(p: Particle, i: number) {
        return (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-blue-400/10 border border-blue-500/20 rounded-lg shadow-lg backdrop-blur-md"
            style={{
              top: p.top + "%",
              left: p.left + "%",
              rotate: p.rotate,
            }}
            animate={{
              y: [0, 20, 0],
              x: [0, p.xAnim, 0],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
}

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const handleBeginAnalysis = () => {
    router.push("/login");
  };

  const handleSignIn = () => {
    // Clear current session and navigate to login page
    logout();
    router.push("/login?force=true");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // New headline and subtext
  const headlineWords = [
    "Protect",
    "Your",
    "Career.",
    "Detect",
    "Job",
    "Scams",
    "Instantly."
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
      {/* Ambient Particle Grid Background */}
      <AmbientParticleGrid 
        opacity={0.10} 
        particleCount={70} 
        animationSpeed={0.18}
        className="z-0"
      />

      {/* Floating squares/particles (Framer Motion) */}
      {/* Floating squares/particles (Framer Motion) with stable random positions for hydration */}
      <FloatingParticles count={8} />

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
          <span className="text-sm font-semibold text-blue-200 tracking-wide">JobShield AI v1.0</span>
        </motion.div>

        {/* Main headline with word-by-word animation and gradient for key words */}
        <div className="space-y-6">
          <motion.div
            className="flex flex-col items-center justify-center flex-wrap gap-2"
            variants={staggerContainerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {headlineWords.map((word, index) => {
                // Emphasize "Protect", "Scams", "Instantly." with gradient
                const isGradient = ["Protect", "Scams", "Instantly."].includes(word);
                return isGradient ? (
                  <motion.span
                    key={index}
                    className="text-5xl md:text-7xl font-extrabold tracking-tighter"
                    variants={wordVariants}
                  >
                    <span
                      className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-600 animate-gradient-flow"
                    >
                      {word}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key={index}
                    className="text-5xl md:text-7xl font-bold tracking-tighter text-white"
                    variants={wordVariants}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          variants={slideInDownVariants}
        >
          AI-powered threat intelligence for job seekers. Analyze offers, verify recruiters, and avoid fraud.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8"
          variants={scaleInVariants}
        >
          <motion.div
            whileHover={{ scale: 1.05, boxShadow: '0 0 24px #38bdf8' }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="group relative px-10 py-7 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-2xl hover:shadow-blue-500/60 transition-all duration-200 text-base active:scale-95 overflow-hidden focus:ring-2 focus:ring-cyan-400"
              onClick={handleBeginAnalysis}
            >
              <span className="relative flex items-center gap-2 z-10">
                Scan a Job Post
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 16px #38bdf8' }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              variant="outline"
              className="px-10 py-7 border-blue-400/40 hover:border-cyan-400/60 text-slate-200 hover:text-white font-semibold rounded-xl backdrop-blur-md transition-all duration-200 text-base hover:bg-blue-500/15 active:scale-95 bg-white/5 focus:ring-2 focus:ring-cyan-400"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll cue arrow */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <ChevronDown className="w-8 h-8 text-cyan-400 animate-bounce" />
        </motion.div>

        {/* Stats/Trust indicators removed for minimal look */}
      </motion.div>
    </section>
  );
};
