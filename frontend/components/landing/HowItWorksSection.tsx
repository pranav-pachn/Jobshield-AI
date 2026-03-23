"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardPaste, BrainCircuit, Gauge, ShieldCheck } from "lucide-react";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <ClipboardPaste className="w-6 h-6" />,
    title: "Paste Job Details",
    description: "Drop in the job description, URL, or recruiter info.",
    color: "blue",
  },
  {
    number: 2,
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI Analysis",
    description: "Our models scan 50+ scam signals in under 3 seconds.",
    color: "cyan",
  },
  {
    number: 3,
    icon: <Gauge className="w-6 h-6" />,
    title: "Risk Scoring",
    description: "Receive a 0–100 threat score with a full factor breakdown.",
    color: "purple",
  },
  {
    number: 4,
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Safe Decision",
    description: "Apply with confidence — or dodge a bullet entirely.",
    color: "emerald",
  },
];

const colorMap: Record<string, { circle: string; icon: string; glow: string; connector: string }> = {
  blue: {
    circle: "bg-blue-600/20 border-blue-500/50",
    icon: "text-blue-400",
    glow: "shadow-blue-500/30",
    connector: "from-blue-500/60 to-cyan-500/60",
  },
  cyan: {
    circle: "bg-cyan-600/20 border-cyan-500/50",
    icon: "text-cyan-400",
    glow: "shadow-cyan-500/30",
    connector: "from-cyan-500/60 to-purple-500/60",
  },
  purple: {
    circle: "bg-purple-600/20 border-purple-500/50",
    icon: "text-purple-400",
    glow: "shadow-purple-500/30",
    connector: "from-purple-500/60 to-emerald-500/60",
  },
  emerald: {
    circle: "bg-emerald-600/20 border-emerald-500/50",
    icon: "text-emerald-400",
    glow: "shadow-emerald-500/30",
    connector: "",
  },
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20 space-y-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 tracking-widest uppercase">
              How It Works
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            From Paste to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400">
              Protected
            </span>{" "}
            in Seconds
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Four steps stand between you and a job scam. We handle all of them automatically.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-0">
          {steps.map((step, idx) => {
            const c = colorMap[step.color];
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={step.number}>
                {/* Step card */}
                <motion.div
                  className="relative flex flex-col items-center text-center w-full md:flex-1"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                >
                  {/* Number circle */}
                  <motion.div
                    className={`relative w-16 h-16 rounded-2xl border-2 ${c.circle} flex items-center justify-center mb-4 shadow-lg ${c.glow}`}
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`${c.icon}`}>{step.icon}</div>
                    {/* Step number badge */}
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-950 border border-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center">
                      {step.number}
                    </span>
                  </motion.div>

                  <h3 className="text-base font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400 max-w-[160px] leading-snug">
                    {step.description}
                  </p>
                </motion.div>

                {/* Connector line between steps */}
                {!isLast && (
                  <div className="hidden md:block flex-shrink-0 w-16 mx-2">
                    <motion.div
                      className={`h-0.5 bg-gradient-to-r ${c.connector} rounded-full`}
                      initial={{ scaleX: 0, originX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.12 + 0.3 }}
                    />
                    {/* Arrow dot */}
                    <div className="flex justify-end -mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: vertical connecting lines */}
        <div className="md:hidden absolute left-[calc(50%-1px)] top-[220px] w-0.5 h-[calc(100%-240px)] bg-gradient-to-b from-blue-500/40 via-purple-500/40 to-emerald-500/40" />
      </div>
    </section>
  );
}
