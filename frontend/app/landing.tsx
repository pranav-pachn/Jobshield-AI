"use client";

import { Navbar } from "@/components/landing/Navbar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AuthPanel } from "@/components/landing/AuthPanel";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated particle network background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Auth Panel / Login */}
      <AuthPanel />

      {/* Footer */}
      <Footer />
    </main>
  );
}
