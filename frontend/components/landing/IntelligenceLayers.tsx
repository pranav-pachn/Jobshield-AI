"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, UserCheck, Network, Shield } from "lucide-react";

const layers = [
  {
    icon: <Search className="w-6 h-6 text-blue-400" />,
    title: "Content Intelligence",
    description: "Reads job descriptions, parses requirements, and flags unrealistic compensation, urgency patterns, or fee requests.",
    steps: ["Read content", "Find suspicious signals", "Generate base risk"],
    color: "blue"
  },
  {
    icon: <UserCheck className="w-6 h-6 text-cyan-400" />,
    title: "Recruiter Intelligence",
    description: "Cross-references email domains, company registrations, and verifies if the recruiter identity matches the corporate footprint.",
    steps: ["Email reputation", "Domain trust", "Identity verification"],
    color: "cyan"
  },
  {
    icon: <Network className="w-6 h-6 text-purple-400" />,
    title: "Threat Intelligence",
    description: "Connects patterns to known scam campaigns, uncovering fraud networks that use the same templates across different platforms.",
    steps: ["Past scams database", "Repeated patterns", "Connected threats"],
    color: "purple"
  }
];

export function IntelligenceLayers() {
  return (
    <section className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-md border border-slate-800 bg-[#0b1220] text-slate-400 text-xs font-mono tracking-wider">
            <Shield className="w-4 h-4 text-blue-500" /> HOW JOBSHIELD THINKS
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Three Intelligence Engines.<br/>One Unified Risk Score.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {layers.map((layer, idx) => (
            <motion.div 
              key={layer.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-[#0b1220] border border-slate-800 rounded-xl p-8 relative overflow-hidden group"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-${layer.color}-500/50 group-hover:bg-${layer.color}-400 transition-colors`} />
              
              <div className="mb-6 p-3 bg-[#05080f] inline-block rounded-lg border border-slate-800">
                {layer.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{layer.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">{layer.description}</p>
              
              {/* Internal Flow */}
              <div className="space-y-3 font-mono text-xs">
                {layer.steps.map((step, stepIdx) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full bg-${layer.color}-500/50`} />
                      {stepIdx !== layer.steps.length - 1 && (
                        <div className="w-px h-6 bg-slate-800 my-1" />
                      )}
                    </div>
                    <span className="text-slate-300 pb-1">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
