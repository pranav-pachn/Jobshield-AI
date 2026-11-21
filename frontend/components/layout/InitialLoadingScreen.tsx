"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function InitialLoadingScreen() {
  const [shouldRender, setShouldRender] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  useEffect(() => {
    // Lock body scroll during intro presentation
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Fast, crisp pacing: 1.2s display + 0.35s fade out = ~1.5s total intro experience
    const introDuration = 1200;

    // Timeline timer to initiate exit fade
    const timer = setTimeout(() => {
      setIsAnimating(false);
      document.body.style.overflow = originalOverflow;
    }, introDuration);

    // Hard safety fallback to ensure DOM and scroll are never stuck
    const safetyTimer = setTimeout(() => {
      setIsAnimating(false);
      setShouldRender(false);
      document.body.style.overflow = originalOverflow;
    }, introDuration + 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <AnimatePresence 
      mode="wait"
      onExitComplete={() => setShouldRender(false)}
    >
      {isAnimating && (
        <motion.div
          key="jobshield-intro-overlay"
          role="status"
          aria-live="polite"
          aria-label="Loading JobShield AI"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B1220] select-none pointer-events-auto"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          {/* Subtle architectural background grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}
          />

          {/* Restrained ambient soft teal glow */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#5EEAD4]/[0.06] blur-[90px] pointer-events-none" 
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full space-y-6">
            
            {/* 1. Shield Icon with gentle aura */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Soft teal underglow */}
              <div className="absolute inset-0 rounded-2xl bg-[#5EEAD4]/10 blur-xl pointer-events-none" />

              <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-800/90 bg-[#0E1726]/90 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <ShieldCheck
                  className="w-10 h-10 sm:w-12 sm:h-12 text-[#5EEAD4]"
                  strokeWidth={1.8}
                />
              </div>
            </motion.div>

            {/* 2. Brand Name & Tagline */}
            <div className="space-y-1.5">
              <motion.h1
                className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-[#F8FAFC]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
              >
                JobShield
              </motion.h1>

              <motion.p
                className="text-xs sm:text-sm text-[#94A3B8] font-sans tracking-normal"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
              >
                Trust starts with verification.
              </motion.p>
            </div>

            {/* 3. Thin Animated Teal Progress Indicator */}
            <div className="pt-2 w-full flex flex-col items-center space-y-3">
              <div 
                className="w-44 sm:w-52 h-[2px] rounded-full bg-slate-800/90 overflow-hidden relative"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Application loading progress"
              >
                <motion.div
                  className="h-full bg-[#5EEAD4] shadow-[0_0_10px_rgba(94,234,212,0.6)] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 0.85,
                    delay: 0.15,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </div>

              {/* 4. Small Uppercase Status Text */}
              <motion.span
                className="text-[10px] font-mono tracking-[0.2em] text-[#94A3B8]/70 uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                SECURING YOUR EXPERIENCE
              </motion.span>
            </div>

            {/* Screen reader notification */}
            <span className="sr-only">
              JobShield AI application initialized and ready.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
