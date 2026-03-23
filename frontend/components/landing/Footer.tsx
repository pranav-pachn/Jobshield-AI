"use client";

import React from "react";
import { Twitter, Github, Linkedin, Mail, Shield } from "lucide-react";

const YEAR = 2026;

const footerLinks = {
  Product: ["Features", "Pricing", "API", "Security"],
  Company: ["About", "Contact", "Careers", "Press"],
  Resources: ["Docs", "Blog", "Changelog", "Status"],
  Legal: ["Privacy", "Terms", "Cookies", "GDPR"],
};

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-blue-500/20 bg-gradient-to-b from-slate-950 to-[#080c1a] py-16 px-6 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 border border-blue-500/30 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                JobShield
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  AI
                </span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Protecting careers with AI — one job post at a time.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: <Twitter className="w-4 h-4" />, href: "#" },
                { icon: <Github className="w-4 h-4" />, href: "#" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#" },
                { icon: <Mail className="w-4 h-4" />, href: "#" },
              ].map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700/60 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-150"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-500 text-sm hover:text-blue-400 transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {YEAR} JobShield AI. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Built with AI to protect job seekers worldwide 🛡️
          </p>
        </div>
      </div>
    </footer>
  );
};
