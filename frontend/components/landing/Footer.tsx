"use client";

import React from "react";
import { Twitter, Github, Linkedin, Mail, Shield } from "lucide-react";

const YEAR = 2026;

const footerLinks = {
  Project: ["GitHub Repository", "Local Setup Guide", "Architecture Specs"],
};

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-slate-800 bg-[#05080f] py-16 px-6 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#0b1220] border border-slate-700 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                JobShield
                <span className="text-blue-400 ml-1">
                  AI
                </span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Threat intelligence for the job market. Catching scams before they reach you.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://github.com/pranav-pachn/Jobshield-AI"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/60 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-150"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="flex flex-col space-y-4 md:items-end">
             <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
               Project Links
             </h4>
             <ul className="space-y-2.5 md:text-right">
               <li>
                 <a
                   href="#engineering"
                   className="text-slate-500 text-sm hover:text-blue-400 transition-colors duration-150"
                 >
                   Architecture Specs
                 </a>
               </li>
               <li>
                 <a
                   href="#engineering"
                   className="text-slate-500 text-sm hover:text-blue-400 transition-colors duration-150"
                 >
                   Engineering Specs
                 </a>
               </li>
               <li>
                 <a
                   href="https://github.com/pranav-pachn/Jobshield-AI"
                   target="_blank"
                   rel="noreferrer"
                   className="text-slate-500 text-sm hover:text-blue-400 transition-colors duration-150"
                 >
                   GitHub Repository
                 </a>
               </li>
               <li>
                 <a
                   href="https://github.com/pranav-pachn/Jobshield-AI#getting-started"
                   target="_blank"
                   rel="noreferrer"
                   className="text-slate-500 text-sm hover:text-blue-400 transition-colors duration-150"
                 >
                   Local Setup Guide
                 </a>
               </li>
             </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {YEAR} JobShield AI Open Source Project.
          </p>
          <p className="text-slate-500 text-xs font-mono">
            STATUS: SYSTEM SECURE 🛡️
          </p>
        </div>
      </div>
    </footer>
  );
};
