"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ThreatInvestigationDemo } from "@/components/landing/ThreatInvestigationDemo";
import { IntelligenceLayers } from "@/components/landing/IntelligenceLayers";
import { ThreatGraphPreview } from "@/components/landing/ThreatGraphPreview";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { EngineeringSection } from "@/components/landing/EngineeringSection";
import { Footer } from "@/components/landing/Footer";
import { HumanProblem } from "@/components/landing/HumanProblem";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#05080f] overflow-hidden text-slate-300">
      
      {/* Global dot-grid overlay for texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)",
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Mini Demo */}
      <HeroSection />

      {/* Human Problem Statement */}
      <HumanProblem />

      {/* Full Investigation Demo */}
      <ThreatInvestigationDemo />

      {/* Three Intelligence Engines */}
      <IntelligenceLayers />

      {/* Scam Network Graph */}
      <ThreatGraphPreview />

      {/* Dashboard Intelligence Preview */}
      <DashboardPreview />

      {/* App Mockups */}
      <ProductShowcase />

      {/* System Architecture */}
      <EngineeringSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
