"use client";

import React from "react";
import { motion } from "framer-motion";

export function HumanProblem() {
  return (
    <section className="py-24 px-6 bg-[#05080f] relative flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-12 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Scammers don't attack systems.<br />
          They attack job seekers.
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xl md:text-2xl text-slate-400 font-medium">
          <span>Fake recruiters.</span>
          <span className="hidden md:inline-block w-2 h-2 rounded-full bg-slate-700" />
          <span>Fake offers.</span>
          <span className="hidden md:inline-block w-2 h-2 rounded-full bg-slate-700" />
          <span>Fake opportunities.</span>
        </div>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto pt-4">
          JobShield detects the signals before damage happens.
        </p>
      </motion.div>
    </section>
  );
}
