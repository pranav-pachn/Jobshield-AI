"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Database, BrainCircuit, Box, ArrowDown } from "lucide-react";

const stack = [
  { name: "Next.js", role: "Interface Layer", icon: <Box className="w-5 h-5" />, color: "blue" },
  { name: "Express.js", role: "API Gateway", icon: <Server className="w-5 h-5" />, color: "cyan" },
  { name: "Risk Engine", role: "Unified Risk Engine", icon: <BrainCircuit className="w-5 h-5" />, color: "purple" },
  { name: "FastAPI", role: "AI Classification Layer", icon: <BrainCircuit className="w-5 h-5" />, color: "yellow" },
  { name: "MongoDB", role: "Intelligence Store", icon: <Database className="w-5 h-5" />, color: "green" },
];

export function EngineeringSection() {
  return (
    <section id="architecture" className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">System Architecture</h2>
          <p className="text-slate-400">Every scan passes through multiple intelligence layers before a final verdict is generated.</p>
        </div>

        <div className="flex flex-col items-center max-w-lg mx-auto">
          {stack.map((layer, idx) => (
            <React.Fragment key={layer.name}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="w-full bg-[#0b1220] border border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-[#05080f] border border-slate-800 text-${layer.color}-400`}>
                    {layer.icon}
                  </div>
                  <div>
                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{layer.name}</div>
                    <div className="text-xs text-slate-500 font-mono tracking-wider uppercase">{layer.role}</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-[#00ff88] transition-colors" />
              </motion.div>

              {idx < stack.length - 1 && (
                <div className="py-2 flex flex-col items-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: 24 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.15 + 0.1, duration: 0.3 }}
                    className="w-px bg-slate-800 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500 animate-[scanner_1s_ease-in-out_infinite]" />
                  </motion.div>
                  <ArrowDown className="w-3 h-3 text-slate-700 mt-1" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
