"use client";

import { Navbar } from "@/components/landing/Navbar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-[#080c1a] overflow-hidden">
      {/* Animated particle network background */}
      <AnimatedBackground />

      {/* Global dot-grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}