"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Database, Shield, BrainCircuit, Box, Cpu } from "lucide-react";

const techStack = [
  {
    name: "Next.js",
    category: "Frontend",
    icon: <Code2 className="w-5 h-5 text-blue-400" />,
    gradient: "from-blue-500/20",
    border: "border-blue-500/30",
  },
  {
    name: "Express.js",
    category: "API Gateway",
    icon: <Box className="w-5 h-5 text-cyan-400" />,
    gradient: "from-cyan-500/20",
    border: "border-cyan-500/30",
  },
  {
    name: "FastAPI",
    category: "ML Service",
    icon: <BrainCircuit className="w-5 h-5 text-rose-400" />,
    gradient: "from-rose-500/20",
    border: "border-rose-500/30",
  },
  {
    name: "MongoDB",
    category: "Database",
    icon: <Database className="w-5 h-5 text-emerald-400" />,
    gradient: "from-emerald-500/20",
    border: "border-emerald-500/30",
  },
  {
    name: "JWT Auth",
    category: "Security",
    icon: <Shield className="w-5 h-5 text-amber-400" />,
    gradient: "from-amber-500/20",
    border: "border-amber-500/30",
  },
  {
    name: "Threat Engine",
    category: "Core Logic",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    gradient: "from-purple-500/20",
    border: "border-purple-500/30",
  },
];

export function TechStackSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built With Modern Tech
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A production-ready stack engineered for performance, security, and scalability.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {techStack.map((tech, idx) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`relative overflow-hidden rounded-xl border ${tech.border} bg-slate-900/60 p-5 group flex items-center gap-4 cursor-default transition-all duration-300 hover:shadow-lg`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${tech.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 group-hover:border-slate-600 transition-colors">
                {tech.icon}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                  {tech.name}
                </h3>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                  {tech.category}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
