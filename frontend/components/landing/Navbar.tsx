"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Menu, X, LogOut, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
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
    { label: "How It Works", id: "how-it-works" },
    { label: "Results", id: "result" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#05080f]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
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
            <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition-opacity duration-200" />
            <div className="relative bg-[#0b1220] px-2.5 py-1.5 rounded-lg border border-slate-700/80">
              <Shield className="w-4 h-4 text-[#00ff88]" />
            </div>
          </div>
          <span className="text-white font-bold text-lg tracking-tight font-sans">
            JobShield
          </span>
        </div>

        {/* Desktop nav links (simplified to exactly How It Works and Results) */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop right buttons */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white text-xs transition-colors duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
                onClick={async () => {
                  await logout();
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-150 text-xs px-4 py-2 cursor-pointer flex items-center gap-1.5"
                  onClick={() => router.push("/dashboard")}
                >
                  Command Center <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white text-xs transition-colors duration-150 active:scale-95 cursor-pointer"
                onClick={() => router.push("/login")}
              >
                Sign In
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-150 text-xs px-4 py-2 cursor-pointer"
                  onClick={() => router.push("/signup")}
                >
                  Analyze a Job →
                </Button>
              </motion.div>
            </>
          )}
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
            className="md:hidden bg-[#05080f]/95 backdrop-blur-xl border-t border-slate-800 px-6 pb-6 space-y-2 font-mono text-xs"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="w-full text-left px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button
                    className="w-full bg-[#00ff88] text-black font-semibold rounded-lg text-xs justify-center"
                    onClick={() => { setMobileOpen(false); router.push("/dashboard"); }}
                  >
                    Command Center →
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-slate-400 hover:text-white text-xs"
                    onClick={async () => { setMobileOpen(false); await logout(); }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-slate-400 hover:text-white text-xs"
                    onClick={() => { setMobileOpen(false); router.push("/login"); }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-[#00ff88] text-black font-semibold rounded-lg text-xs"
                    onClick={() => { setMobileOpen(false); router.push("/signup"); }}
                  >
                    Analyze a Job →
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
