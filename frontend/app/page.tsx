"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveDemoSection } from "@/components/landing/InteractiveDemoSection";
import { HumanProblem } from "@/components/landing/HumanProblem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InvestigationResultShowcase } from "@/components/landing/InvestigationResultShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#05080f] overflow-hidden text-slate-300 antialiased selection:bg-[#00ff88]/20 selection:text-[#00ff88]">
      
      {/* Editorial subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 15%, transparent 85%)",
        }}
      />

      {/* 1. Minimalist Navbar */}
      <Navbar />

      {/* 2. Hero with Value Proposition & Direct CTAs */}
      <HeroSection />

      {/* 3. Core Interactive Demo (No account required, 3 simulated samples, canonical report) */}
      <InteractiveDemoSection />

      {/* 4. The Problem (Quiet, airy 3-card grid) */}
      <HumanProblem />

      {/* 5. How It Works (Visual continuous flow: Job Posting -> Investigation -> Result) */}
      <HowItWorks />

      {/* 6. The Result (Evidence breakdown: Why was this flagged?) */}
      <InvestigationResultShowcase />

      {/* 7. Final Call to Action */}
      <FinalCTA />

      {/* 8. Footer */}
      <Footer />
    </main>
  );
}
