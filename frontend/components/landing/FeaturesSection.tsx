"use client";

import React, { useEffect, useState } from "react";
import { Brain, ShieldAlert, Network } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`group relative px-6 py-8 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900/60 to-slate-950/40 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-2 overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Enhanced glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 group-hover:from-blue-600/15 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300" />

      {/* Animated background shine */}
      <div className="absolute -inset-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-pulse" />
      </div>

      {/* Icon with enhanced glow */}
      <div className="relative mb-4 inline-block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-3 rounded-xl border border-blue-500/30">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Bottom accent line - enhanced */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-b-2xl group-hover:w-full transition-all duration-500" />
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300 font-semibold">CORE CAPABILITIES</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Advanced Protection Features
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Powered by cutting-edge AI and threat intelligence to keep you safe from job scam networks
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-blue-400" />}
            title="AI Scam Detection"
            description="Machine learning algorithms analyze job postings in real-time to identify fraudulent patterns and suspicious characteristics before you apply."
            delay={100}
          />

          <FeatureCard
            icon={<ShieldAlert className="w-8 h-8 text-cyan-400" />}
            title="Explainable AI Analysis"
            description="Understand exactly why a job posting is flagged as suspicious with transparent, human-readable threat explanations and evidence."
            delay={200}
          />

          <FeatureCard
            icon={<Network className="w-8 h-8 text-purple-400" />}
            title="Scam Network Intelligence"
            description="Track and visualize networks of fraudulent recruiters, domains, and patterns to identify organized scam operations."
            delay={300}
          />
        </div>
      </div>
    </section>
  );
};
