"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, LayoutDashboard, FileText } from "lucide-react";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: "scanner",
      label: "Threat Scanner",
      icon: <Terminal className="w-4 h-4" />,
      mockup: (
        <div className="flex flex-col h-full bg-[#0b1220] text-sm text-slate-300 font-mono">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[#00ff88]">Scanner Active</span>
            <span className="text-slate-500">ID: SCAN-8219</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">▶</span> Target: hr@tech-recruit-global.net
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">▶</span> Querying WHOIS records...
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">⚠</span> Domain registered 3 days ago.
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">✖</span> Pattern match: Known advanced fee fraud template.
            </div>
          </div>
          <div className="mt-auto p-4 border-t border-slate-800 bg-[#05080f] flex justify-between items-center">
            <div className="text-xs text-slate-500">VERDICT</div>
            <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20 font-bold">HIGH RISK</div>
          </div>
        </div>
      )
    },
    {
      id: "dashboard",
      label: "Intelligence Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      mockup: (
        <div className="flex flex-col h-full bg-[#0b1220] text-sm p-4 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#05080f] p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 mb-1">TOTAL SCANS</div>
              <div className="text-2xl font-bold text-white">1,248</div>
            </div>
            <div className="bg-[#05080f] p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 mb-1">THREATS PREVENTED</div>
              <div className="text-2xl font-bold text-red-400">342</div>
            </div>
          </div>
          <div className="flex-1 bg-[#05080f] rounded-lg border border-slate-800 p-4">
            <div className="text-xs text-slate-500 mb-4 border-b border-slate-800 pb-2">RECENT ALERTS</div>
            <div className="space-y-3">
              {[
                { time: "10:42 AM", msg: "Suspicious Domain Flagged", color: "text-red-400" },
                { time: "09:15 AM", msg: "Payment Scam Pattern", color: "text-red-400" },
                { time: "08:30 AM", msg: "Verified Recruiter", color: "text-[#00ff88]" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{item.time}</span>
                  <span className={item.color}>{item.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "reports",
      label: "Investigation Reports",
      icon: <FileText className="w-4 h-4" />,
      mockup: (
        <div className="flex flex-col h-full bg-[#0b1220] p-4 gap-4">
          <div className="bg-[#05080f] p-4 border border-slate-800 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold text-white mb-1">Acme Corp Hiring Scam</div>
                <div className="text-xs text-slate-500">Report ID: RPT-9921 • Generated: Today</div>
              </div>
              <div className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20">CRITICAL</div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>Vector:</strong> LinkedIn Direct Message</p>
              <p><strong>Method:</strong> Impersonation + Fake Equipment Check</p>
              <p><strong>Indicators:</strong> WhatsApp interview, rushed timeline, generic email.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/50 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Inside the Command Center</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            See the actual interface used to investigate threats, verify recruiters, and analyze job postings.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar lg:w-64 shrink-0">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all whitespace-nowrap ${
                  activeTab === idx 
                    ? "bg-blue-500/10 border border-blue-500/30 text-blue-400" 
                    : "bg-[#0b1220] border border-slate-800 text-slate-400 hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Browser Mockup */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-slate-800 bg-[#0b1220] shadow-2xl overflow-hidden flex flex-col h-[400px]">
              {/* Browser Header */}
              <div className="bg-[#05080f] px-4 py-3 border-b border-slate-800 flex items-center gap-4">
                <div className="flex gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="flex-1 bg-[#0b1220] border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-500 font-mono flex items-center justify-center">
                  app.jobshield.ai
                </div>
                <div className="w-12 shrink-0" /> {/* Spacer to balance */}
              </div>

              {/* Content */}
              <div className="flex-1 relative overflow-hidden bg-[#05080f]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {tabs[activeTab].mockup}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
