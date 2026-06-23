"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Investigation Demo", id: "demo" },
    { label: "Intelligence", id: "intelligence" },
    { label: "Network", id: "network" },
    { label: "Architecture", id: "architecture" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#05080f]/90 backdrop-blur-xl border-b border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          : "bg-transparent border-b border-transparent"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-40 group-hover:opacity-80 transition-opacity duration-200" />
            <div className="relative bg-[#0b1220] px-2 py-1 rounded-lg border border-slate-700">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            JobShield
            <span className="text-blue-400 ml-1">
              AI
            </span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop right buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white text-sm transition-colors duration-150 active:scale-95"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button
              className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-150 active:scale-95 text-sm px-5"
              onClick={() => router.push("/signup")}
            >
              Analyze a Job →
            </Button>
          </motion.div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-400 hover:text-white p-2 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#05080f]/95 backdrop-blur-xl border-t border-slate-800 px-6 pb-6 space-y-2"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="w-full text-left px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-slate-400 hover:text-white"
                onClick={() => { setMobileOpen(false); router.push("/login"); }}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-[#00ff88] text-black font-semibold rounded-lg"
                onClick={() => { setMobileOpen(false); router.push("/signup"); }}
              >
                Analyze a Job →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
