"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Search, ShieldCheck } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Check",
      description: "JobShield examines the job, recruiter, company, and domain.",
    },
    {
      num: "02",
      title: "Investigate",
      description: "It looks for suspicious and connected signals.",
    },
    {
      num: "03",
      title: "Explain",
      description: "You get a clear verdict with the evidence behind it.",
    },
  ];

  const flowNodes = [
    { label: "JOB POSTING", icon: FileText },
    { label: "INVESTIGATION", icon: Search },
    { label: "RESULT", icon: ShieldCheck },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 bg-[#05080f] relative overflow-hidden border-t border-slate-900 scroll-mt-16">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-20 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono tracking-widest uppercase text-emerald-400">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
            Give JobShield the job. <br />
            We&apos;ll investigate the rest.
          </h2>
        </motion.div>

        {/* Continuous Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-8 sm:p-10 rounded-2xl bg-[#080c14] border border-slate-800/80 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
            {flowNodes.map((node, i) => {
              const Icon = node.icon;
              return (
                <React.Fragment key={node.label}>
                  <div className="w-full sm:w-auto flex-1 flex flex-col items-center justify-center p-5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                    <Icon className="w-5 h-5 text-emerald-400 mb-2" />
                    <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-slate-200">
                      {node.label}
                    </span>
                  </div>
                  {i < flowNodes.length - 1 && (
                    <div className="flex items-center justify-center text-slate-600 sm:px-2">
                      <ArrowRight className="w-5 h-5 hidden sm:block text-emerald-500/60" />
                      <div className="w-0.5 h-6 bg-slate-800 sm:hidden" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>

        {/* 3 Step Explanations Below */}
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {step.num}
                </span>
                <div className="h-px flex-1 bg-slate-800/80" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
