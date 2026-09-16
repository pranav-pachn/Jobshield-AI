"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
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

      {/* 1. Minimalist Navbar (How It Works, Results, Sign In, Analyze a Job) */}
      <Navbar />

      {/* 2. Hero with Teaser Result Card */}
      <HeroSection />

      {/* 3. The Problem (Quiet, airy 3-card grid) */}
      <HumanProblem />

      {/* 4. How It Works (Visual continuous flow: Job Posting -> Investigation -> Result) */}
      <HowItWorks />

      {/* 5. The Result (Full answer: High Risk 85/100, Why was this flagged?, Evidence) */}
      <InvestigationResultShowcase />

      {/* 6. Final Call to Action */}
      <FinalCTA />

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
