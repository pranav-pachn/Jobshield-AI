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
      className={`group relative px-6 py-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300" />

      {/* Icon */}
      <div className="relative mb-4 inline-block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-slate-950 p-3 rounded-xl">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-2xl group-hover:w-full transition-all duration-300" />
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Advanced Protection Features
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Powered by cutting-edge AI and threat intelligence to keep you safe
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
