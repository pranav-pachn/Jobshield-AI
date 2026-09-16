"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Share2, Layers, AlertCircle, ShieldAlert, ArrowUpRight } from "lucide-react";

/**
 * Phase 9 Campaign Threat Graph Component:
 * Demonstrates: "One suspicious job can reveal an entire campaign."
 * Maps: Target Job -> Recruiter Freemail -> Disposable Domain -> Campaign Cluster -> 14 Linked Postings
 */
export function ThreatGraphPreview() {
  const [selectedNode, setSelectedNode] = useState<string>("campaign");
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((v) => !v);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="campaigns" className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono tracking-wider mb-4">
              <Network className="w-3.5 h-3.5" />
              <span>CONNECTED THREAT PATTERNS</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-4">
              One fake job may not be <br />
              <span className="text-purple-400 italic font-normal">one fake job.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              JobShield identifies when suspicious postings share signals such as domains, recruiters, or other indicators — helping reveal coordinated fraud campaigns.
            </p>
          </div>

          <div className="lg:col-span-5 flex lg:justify-end">
            <div className="bg-[#090d16] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 w-full max-w-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                <span>GRAPH_METRICS</span>
                <span className="text-[#00ff88]">LIVE LINKAGE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Known Campaign Clusters:</span>
                <span className="font-bold text-white">48 Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Correlated Indicators:</span>
                <span className="font-bold text-purple-400">1,240 Entities</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">How We Connect Them:</span>
                <span className="font-bold text-slate-300">Domains, Recruiters & Indicators</span>
              </div>
            </div>
          </div>
        </div>

        {/* Threat Graph Visual Canvas */}
        <div className="relative w-full h-[520px] bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
          
          {/* Subtle Cyber Matrix Grid */}
          <div 
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />

          {/* Top Status Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-white font-semibold">CAMPAIGN CLUSTER: #CAMP-APEX-ADVANCE</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>CLICK ANY NODE TO INSPECT ATTRIBUTION</span>
            </div>
          </div>

          {/* Interactive Node Graph Area */}
          <div className="relative z-10 w-full h-[360px] flex items-center justify-center">
            
            {/* SVG Connecting Vector Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Lines from Center Campaign to Orbiting Nodes */}
              <line x1="50%" y1="50%" x2="24%" y2="28%" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="76%" y2="28%" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="20%" y2="72%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="80%" y2="72%" stroke="rgba(234, 179, 8, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="50%" y2="84%" stroke="rgba(0, 255, 136, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Orbiting Node 1: Target Ingested Job */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Ingested Job Node"
              onClick={() => setSelectedNode("job")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("job"); }}
              className={`absolute top-[20%] left-[18%] sm:left-[22%] p-3.5 rounded-xl border bg-[#05080f] cursor-pointer transition-all duration-300 font-mono text-xs ${
                selectedNode === "job" ? "border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] scale-105" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] text-sky-400 mb-1">INGESTED JOB</div>
              <div className="font-semibold text-white">Target Job #9941</div>
              <div className="text-[10px] text-slate-500 mt-0.5">apex-careers-portal.net</div>
            </div>

            {/* Orbiting Node 2: Recruiter Persona */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Recruiter Alias Node"
              onClick={() => setSelectedNode("recruiter")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("recruiter"); }}
              className={`absolute top-[20%] right-[18%] sm:right-[22%] p-3.5 rounded-xl border bg-[#05080f] cursor-pointer transition-all duration-300 font-mono text-xs ${
                selectedNode === "recruiter" ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-105" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] text-red-400 mb-1">RECRUITER ALIAS</div>
              <div className="font-semibold text-white">"Sarah Jenkins"</div>
              <div className="text-[10px] text-slate-500 mt-0.5">freemail forwarder match</div>
            </div>

            {/* Orbiting Node 3: Payment Infrastructure */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Payment Infrastructure Node"
              onClick={() => setSelectedNode("payment")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("payment"); }}
              className={`absolute bottom-[18%] left-[14%] sm:left-[18%] p-3.5 rounded-xl border bg-[#05080f] cursor-pointer transition-all duration-300 font-mono text-xs ${
                selectedNode === "payment" ? "border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] text-amber-400 mb-1">PAYMENT DESTINATION</div>
              <div className="font-semibold text-white">Tether Wallet (TRC-20)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">3 previous scam flags</div>
            </div>

            {/* Orbiting Node 4: Syllabic Template Match */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Offer Template Node"
              onClick={() => setSelectedNode("template")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("template"); }}
              className={`absolute bottom-[18%] right-[14%] sm:right-[18%] p-3.5 rounded-xl border bg-[#05080f] cursor-pointer transition-all duration-300 font-mono text-xs ${
                selectedNode === "template" ? "border-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.3)] scale-105" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] text-[#00ff88] mb-1">OFFER TEMPLATE</div>
              <div className="font-semibold text-white">"Background Check Fee"</div>
              <div className="text-[10px] text-slate-500 mt-0.5">99.1% semantic similarity</div>
            </div>

            {/* Orbiting Node 5: 14 Connected Postings */}
            <div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Syndicated Attack Cluster Node"
              onClick={() => setSelectedNode("cluster")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("cluster"); }}
              className={`absolute bottom-[4%] p-3 rounded-xl border bg-[#05080f] cursor-pointer transition-all duration-300 font-mono text-xs ${
                selectedNode === "cluster" ? "border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] text-purple-400">SYNDICATED ATTACK</div>
              <div className="font-bold text-white">14 Postings Across 6 Job Boards</div>
            </div>

            {/* Central Hub: Campaign Core Node */}
            <motion.div 
              role="button"
              tabIndex={0}
              aria-label="Inspect Campaign Hub Node"
              onClick={() => setSelectedNode("campaign")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedNode("campaign"); }}
              animate={pulse ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 2 }}
              className={`z-20 p-5 rounded-2xl border bg-[#0d1322] cursor-pointer text-center font-mono transition-all duration-300 ${
                selectedNode === "campaign" ? "border-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.4)]" : "border-slate-700 hover:border-purple-400"
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-white">CAMPAIGN HUB</div>
              <div className="text-[10px] text-purple-300 mt-0.5">CAMP-8821-AF</div>
            </motion.div>

          </div>

          {/* Bottom Attribution Inspection Drawer */}
          <div className="relative z-10 bg-[#05080f] border border-slate-800 rounded-lg p-3 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">NODE INTEL:</span>
              <span className="text-slate-300">
                {selectedNode === "campaign" && "Campaign #CAMP-APEX: Coordinated advance-fee fraud campaign targeting software engineers."}
                {selectedNode === "job" && "Target Job: Initial submission triggering cluster lookup via WHOIS and name server analysis."}
                {selectedNode === "recruiter" && "Recruiter: Identity persona reusing email templates previously indexed in Threat KB."}
                {selectedNode === "payment" && "Payment: Tether wallet address matched across 3 distinct domain registrations in the past 14 days."}
                {selectedNode === "template" && "Template: Text embedding matches known high-pressure advance fee script with 0.99 cosine similarity."}
                {selectedNode === "cluster" && "Cluster: 14 parallel job postings active across LinkedIn, Indeed, and remote boards sharing infrastructure."}
              </span>
            </div>
            <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>GRAPH DB VERIFIED</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
