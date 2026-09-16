"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserX, Globe, DollarSign } from "lucide-react";

export function HumanProblem() {
  const problems = [
    {
      icon: UserX,
      title: "Fake Recruiter",
      description: "Someone pretending to represent a real company or hiring manager.",
      iconColor: "text-red-400",
      iconBg: "bg-red-500/10 border-red-500/20",
    },
    {
      icon: Globe,
      title: "Suspicious Website",
      description: "The application leads to an unusual or recently created domain.",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: DollarSign,
      title: "Payment Request",
      description: "A fee or purchase appears during the hiring process.",
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <section className="py-28 px-6 bg-[#05080f] relative overflow-hidden border-t border-slate-900">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="text-xs font-mono tracking-widest uppercase text-slate-500">
            THE PROBLEM
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
            A job can look legitimate <br className="hidden sm:inline" />
            and still be a <span className="text-red-400 italic">trap.</span>
          </h2>
        </motion.div>

        {/* 3 Quiet Problem Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-[#080c14] border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 flex flex-col items-start space-y-5 group"
              >
                <div className={`p-3 rounded-xl border ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-105 duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
