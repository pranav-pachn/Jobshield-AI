"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserCheck,
  BarChart3,
  Globe,
  Mail,
  FileText,
  Shield,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

function FeatureCard({ icon, title, description, gradient, delay }: FeatureCardProps) {
  return (
    <motion.div
      custom={delay}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative px-6 py-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-950/80 backdrop-blur-xl hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Animated inner glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-blue-600/8 to-purple-600/8" />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl group-hover:w-full transition-all duration-500" />

      {/* Icon */}
      <div className="relative mb-5 inline-flex">
        <div className={`absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${gradient}`} />
        <div className="relative bg-slate-900 border border-blue-500/20 p-3 rounded-xl group-hover:border-blue-400/40 transition-colors duration-300">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-200">
        {title}
      </h3>
      <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-200">
        {description}
      </p>
    </motion.div>
  );
}

const features = [
  {
    icon: <Search className="w-6 h-6 text-blue-400" />,
    title: "Job Scam Analyzer",
    description:
      "Paste any job post or URL. Our AI detects red flags, suspicious patterns, and fraudulent language in seconds.",
    gradient: "bg-blue-500",
    delay: 0,
  },
  {
    icon: <UserCheck className="w-6 h-6 text-cyan-400" />,
    title: "Recruiter Verification",
    description:
      "Cross-reference recruiter identities against professional databases and scam registries in real-time.",
    gradient: "bg-cyan-500",
    delay: 0.08,
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
    title: "Scam Risk Score",
    description:
      "Get a quantified 0–100 risk score with a breakdown of every contributing factor and its severity.",
    gradient: "bg-purple-500",
    delay: 0.16,
  },
  {
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    title: "Threat Intelligence Dashboard",
    description:
      "Monitor live scam campaigns, track emerging fraud patterns, and stay ahead of new attack vectors.",
    gradient: "bg-emerald-500",
    delay: 0.24,
  },
  {
    icon: <Mail className="w-6 h-6 text-amber-400" />,
    title: "URL & Email Scanner",
    description:
      "Instantly evaluate suspicious domains and recruiter emails against malware, phishing, and spoofing databases.",
    gradient: "bg-amber-500",
    delay: 0.32,
  },
  {
    icon: <FileText className="w-6 h-6 text-rose-400" />,
    title: "Report & Evidence Generator",
    description:
      "Auto-generate detailed scam evidence reports you can submit to authorities or share with your network.",
    gradient: "bg-rose-500",
    delay: 0.40,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      {/* Section bg enhancement */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300 tracking-widest uppercase">
              Full Protection Suite
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Everything You Need to Stay{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500">
              Safe
            </span>
          </h2>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Six battle-tested modules powered by cutting-edge AI and live threat
            intelligence, all in one place.
          </p>

          {/* Animated divider */}
          <motion.div
            className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
