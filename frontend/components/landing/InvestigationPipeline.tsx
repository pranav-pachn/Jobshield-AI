"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  FileSearch, 
  UserCheck, 
  Database, 
  Share2, 
  Cpu, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";

interface PipelineStage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

const STAGES: PipelineStage[] = [
  {
    number: "01",
    title: "SCAN",
    subtitle: "Job Ingestion & Parsing",
    description: "Deconstructs unstructured job descriptions, extracting recruiters, compensation, platform links, and payment instructions.",
    icon: FileSearch,
    tags: ["Entity Extraction", "Salary Norming"],
  },
  {
    number: "02",
    title: "VERIFY",
    subtitle: "Recruiter & Domain Intel",
    description: "Evaluates domain age via WHOIS, DNS records, MX routing, and cross-references recruiter email against legitimate corporate registries.",
    icon: UserCheck,
    tags: ["WHOIS Age", "Freemail Check"],
  },
  {
    number: "03",
    title: "RETRIEVE",
    subtitle: "RAG Threat Knowledge",
    description: "Semantic search across vector embeddings of verified scam templates, known advance-fee variants, and historical fraud archives.",
    icon: Database,
    tags: ["pgvector", "Threat Archive"],
  },
  {
    number: "04",
    title: "CORRELATE",
    subtitle: "Campaign Graph Mapping",
    description: "Connects isolated postings into syndicated fraud rings by clustering matching domains, wallets, phone numbers, and wording fingerprints.",
    icon: Share2,
    tags: ["Graph Clustering", "Campaign Linkage"],
  },
  {
    number: "05",
    title: "CALCULATE",
    subtitle: "Deterministic Risk Engine",
    description: "Replaces probabilistic hallucinations with strictly audited rule weights (riskSignalRules.ts), ensuring reproducible score calculations.",
    icon: Cpu,
    tags: ["Zero Hallucination", "Audit Trail"],
  },
  {
    number: "06",
    title: "VERDICT",
    subtitle: "Explainable Intelligence",
    description: "Delivers an actionable verdict backed by evidence citations, confidence calibration, and recommended security countermeasures.",
    icon: ShieldCheck,
    tags: ["Defense Countermeasures", "Audited Output"],
  },
];

export const InvestigationPipeline: React.FC = () => {
  return (
    <section id="pipeline" className="py-24 px-6 bg-[#070b14] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-[#0b1220] text-slate-400 text-xs font-mono tracking-wider mb-4">
            <span>UNDER THE HOOD</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-4">
            The Six-Stage Investigation Pipeline
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Unlike simple LLM wrappers that merely classify text, JobShield orchestrates an end-to-end cybersecurity investigation workflow.
          </p>
        </div>

        {/* 6 Stage Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="group p-6 rounded-xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-slate-500 tracking-wider group-hover:text-[#00ff88] transition-colors">
                      {stage.number}
                    </span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-mono font-bold text-white mb-1">
                    {stage.title}
                  </h3>
                  <div className="text-xs font-mono text-[#00ff88] mb-3">
                    {stage.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed font-sans mb-6">
                    {stage.description}
                  </p>
                </div>

                {/* Bottom Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/80">
                  {stage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
