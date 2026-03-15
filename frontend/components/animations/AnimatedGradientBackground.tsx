"use client";

/**
 * Animated Gradient Background Component
 * Creates a subtle animated gradient background for cybersecurity aesthetic
 * Features: blue to purple gradient, slow movement, low opacity
 */

import React from "react";
import { usePerformanceMode } from "@/lib/animations/usePerformanceMode";

interface AnimatedGradientBackgroundProps {
  className?: string;
}

export function AnimatedGradientBackground({
  className = "",
}: AnimatedGradientBackgroundProps) {
  const performanceMode = usePerformanceMode();

  // Disable for accessibility
  if (performanceMode === "reduced") {
    return null;
  }

  return (
    <>
      {/* Primary animated gradient */}
      <div 
        className={`absolute inset-0 opacity-30 ${className}`}
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 70%)
          `,
          animation: performanceMode === "mobile" 
            ? "gradientShift 20s ease-in-out infinite" 
            : "gradientShift 15s ease-in-out infinite",
        }}
      />

      {/* Secondary subtle gradient overlay */}
      <div 
        className={`absolute inset-0 opacity-20 ${className}`}
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(59, 130, 246, 0.05) 0%, 
              rgba(147, 51, 234, 0.05) 25%, 
              rgba(34, 211, 238, 0.05) 50%, 
              rgba(59, 130, 246, 0.05) 75%, 
              rgba(147, 51, 234, 0.05) 100%
            )
          `,
          animation: performanceMode === "mobile" 
            ? "gradientFlow 25s linear infinite" 
            : "gradientFlow 20s linear infinite",
        }}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          25% {
            transform: translate(5%, -5%) scale(1.05);
          }
          50% {
            transform: translate(-5%, 5%) scale(1.1);
          }
          75% {
            transform: translate(5%, 5%) scale(1.05);
          }
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
}

export default AnimatedGradientBackground;
