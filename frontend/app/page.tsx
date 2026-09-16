"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ThreatInvestigationDemo } from "@/components/landing/ThreatInvestigationDemo";
import { InvestigationPipeline } from "@/components/landing/InvestigationPipeline";
import { ThreatGraphPreview } from "@/components/landing/ThreatGraphPreview";
import { ExplainableRiskSection } from "@/components/landing/ExplainableRiskSection";
import { EvaluationSection } from "@/components/landing/EvaluationSection";
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

      {/* 1. Technical Minimalist Navbar */}
      <Navbar />

      {/* 2. Editorial Hero with Animated Threat Network */}
      <HeroSection />

      {/* 3. Live Threat Investigation (Derived from real persisted fixture) */}
      <ThreatInvestigationDemo />

      {/* 4. The Six-Stage Pipeline (Scan -> Verify -> Retrieve -> Correlate -> Calculate -> Verdict) */}
      <InvestigationPipeline />

      {/* 5. Campaign Correlation (One Job -> Entire Campaign Graph) */}
      <ThreatGraphPreview />

      {/* 6. Explainability & Deterministic Math (riskSignalRules.ts weights) */}
      <ExplainableRiskSection />

      {/* 7. Honest Evaluation & Benchmarks (Authentic engineering transparency) */}
      <EvaluationSection />

      {/* 8. Final CTA */}
      <FinalCTA />

      {/* 9. Engineering Footer */}
      <Footer />
    </main>
  );
}
