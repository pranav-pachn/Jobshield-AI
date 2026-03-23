"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AmbientParticleGrid } from "@/components/animations/AmbientParticleGrid";
import { RadarSweep } from "@/components/animations/RadarSweep";
import { DataStreamLines } from "@/components/animations/DataStreamLines";
import { AnimatedGradientBackground } from "@/components/animations/AnimatedGradientBackground";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

// Page-specific animation configuration
const getPageAnimations = (pathname: string) => {
  if (pathname === "/landing" || pathname === "/") {
    return {
      showParticles: true,
      showRadar: false,
      showDataStreams: false,
      showGradient: true,
      particleOpacity: 0.08,
      particleCount: 40,
    };
  }

  if (pathname === "/dashboard") {
    // No background animations on the dashboard — data visualisations are enough
    return {
      showParticles: false,
      showRadar: false,
      showDataStreams: false,
      showGradient: false,
      particleOpacity: 0,
      particleCount: 0,
    };
  }

  if (pathname === "/analyze") {
    return {
      showParticles: true,
      showRadar: false,
      showDataStreams: true,
      showGradient: true,
      particleOpacity: 0.05,
      particleCount: 25,
    };
  }

  // Default for other pages
  return {
    showParticles: true,
    showRadar: false,
    showDataStreams: false,
    showGradient: true,
    particleOpacity: 0.05,
    particleCount: 20,
  };
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animations = getPageAnimations(pathname);

  if (PUBLIC_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Background Animations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated gradient background */}
        <AnimatedGradientBackground />
        
        {/* Page-specific animations */}
        {animations.showParticles && (
          <AmbientParticleGrid 
            opacity={animations.particleOpacity}
            particleCount={animations.particleCount}
            className="absolute inset-0"
          />
        )}
        
        {animations.showRadar && (
          <RadarSweep 
            opacity={0.08}
            size={600}
            position="top-right"
            sweepSpeed={12}
            className="absolute inset-0"
          />
        )}
        
        {animations.showDataStreams && (
          <DataStreamLines 
            opacity={0.08}
            lineCount={6}
            className="absolute inset-0"
          />
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Content area — offset by sidebar width on large screens */}
        <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
