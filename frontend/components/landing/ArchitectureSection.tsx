"use client";

import React from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Server, Cpu, Brain, Database, ArrowDown, Waypoints } from "lucide-react";

const architectureSteps = [
  {
    icon: <LayoutTemplate className="w-6 h-6 text-blue-400" />,
    title: "Next.js",
    subtitle: "Frontend Interface",
    description: "Responsive React UI with real-time analysis streaming.",
    color: "blue",
  },
  {
    icon: <Server className="w-6 h-6 text-cyan-400" />,
    title: "Express.js",
    subtitle: "API Gateway",
    description: "Handles authentication, rate limiting, and request orchestration.",
    color: "cyan",
  },
  {
    icon: <Cpu className="w-6 h-6 text-purple-400" />,
    title: "Unified Risk Engine",
    subtitle: "Core Logic",
    description: "Rule-based analysis combining multiple threat intelligence feeds.",
    color: "purple",
  },
  {
    icon: <Brain className="w-6 h-6 text-rose-400" />,
    title: "FastAPI",
    subtitle: "ML Service",
    description: "Optimized model inference for NLP and scam pattern matching.",
    color: "rose",
  },
  {
    icon: <Database className="w-6 h-6 text-emerald-400" />,
    title: "MongoDB",
    subtitle: "Threat Database",
    description: "Persists analysis reports and continuously updated scam registries.",
    color: "emerald",
  },
];

const getColorClasses = (color: string) => {
  switch (color) {
    case "blue": return "border-blue-500/30 bg-blue-500/10 shadow-blue-500/20";
    case "cyan": return "border-cyan-500/30 bg-cyan-500/10 shadow-cyan-500/20";
    case "purple": return "border-purple-500/30 bg-purple-500/10 shadow-purple-500/20";
    case "rose": return "border-rose-500/30 bg-rose-500/10 shadow-rose-500/20";
    case "emerald": return "border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20";
    default: return "border-slate-500/30 bg-slate-500/10 shadow-slate-500/20";
  }
};

export function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <Waypoints className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300 tracking-widest uppercase">
              System Architecture
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            How It Works Under the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-500">
              Hood
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A robust, multi-tier architecture designed for speed, accuracy, and deep threat analysis.
          </p>
        </motion.div>

        {/* Flowchart */}
        <div className="flex flex-col items-center">
          {architectureSteps.map((step, idx) => {
            const isLast = idx === architectureSteps.length - 1;
            return (
              <React.Fragment key={step.title}>
                {/* Node */}
                <motion.div
                  className={`w-full max-w-md p-5 rounded-2xl border ${getColorClasses(step.color)} backdrop-blur-md shadow-lg flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-300`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                >
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1 tracking-wider">
                      {step.subtitle}
                    </p>
                    <p className="text-sm text-slate-400 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Connector */}
                {!isLast && (
                  <div className="relative h-12 w-full flex justify-center py-1">
                    <motion.div
                      className="w-0.5 h-full bg-gradient-to-b from-slate-600 to-slate-800"
                      initial={{ scaleY: 0, originY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.2 + 0.3 }}
                    >
                      {/* Flowing dot animation */}
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute -left-[2px] animate-[flowDown_1.5s_infinite_linear]" style={{ animationDelay: `${idx * 0.5}s` }} />
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowDown {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </section>
  );
}
