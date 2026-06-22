"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Zap, Clock } from "lucide-react";

const stats = [
  { label: "Today's Scans", value: "1,248", trend: "+12%", icon: <Activity className="w-4 h-4 text-blue-400" />, color: "blue" },
  { label: "High Risk Detected", value: "342", trend: "27.4%", icon: <ShieldAlert className="w-4 h-4 text-red-400" />, color: "red" },
  { label: "Top Threat Signal", value: "Reg. Fee", trend: "Active", icon: <Zap className="w-4 h-4 text-yellow-400" />, color: "yellow" },
  { label: "Avg Analysis Time", value: "2.1s", trend: "-0.2s", icon: <Clock className="w-4 h-4 text-[#00ff88]" />, color: "green" },
];

export function DashboardPreview() {
  return (
    <section className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Live Network Status</h2>
            <p className="text-slate-400">Real-time metrics from the JobShield intelligence engine.</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 rounded-full border border-slate-800 bg-[#0b1220] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-xs font-mono text-slate-300">SYSTEM OPERATIONAL</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 relative overflow-hidden"
            >
              {/* Top Border Indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-${stat.color}-500/50`} />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#05080f] rounded-lg border border-slate-800">
                  {stat.icon}
                </div>
                <span className="text-xs font-mono text-slate-500">{stat.trend}</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
