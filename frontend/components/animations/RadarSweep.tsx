"use client";

/**
 * Radar Sweep Component
 * SVG-based radar visualization with rotating sweep line
 * Creates security monitoring aesthetic for dashboard/analyzer
 * Features: animated grid, rotating sweep beam, glow effect
 */

import React, { useEffect, useRef, useState } from "react";
import { usePerformanceMode } from "@/lib/animations/usePerformanceMode";

interface RadarSweepProps {
  opacity?: number;
  size?: number;
  sweepSpeed?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "full";
  glowColor?: string;
  className?: string;
}

export function RadarSweep({
  opacity = 0.1,
  size = 400,
  sweepSpeed = 8, // seconds per rotation
  position = "top-right",
  glowColor = "#3b82f6",
  className = "",
}: RadarSweepProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const performanceMode = usePerformanceMode();

  if (performanceMode === "reduced") {
    return null;
  }

  const positionClasses = {
    "top-right": "fixed top-0 right-0",
    "top-left": "fixed top-0 left-0",
    "bottom-right": "fixed bottom-0 right-0",
    "bottom-left": "fixed bottom-0 left-0",
    full: "fixed inset-0",
  };

  const radius = size / 2;
  const centerx = size / 2;
  const centery = size / 2;

  // Generate grid lines
  const gridLines = [];
  const gridSpacing = 20;

  // Concentric circles
  for (let i = gridSpacing; i < size / 2; i += gridSpacing) {
    gridLines.push(
      <circle
        key={`circle-${i}`}
        cx={centerx}
        cy={centery}
        r={i}
        fill="none"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.2"
      />
    );
  }

  // Radial lines
  for (let angle = 0; angle < 360; angle += 45) {
    const rad = (angle * Math.PI) / 180;
    const x2 = centerx + Math.cos(rad) * radius;
    const y2 = centery + Math.sin(rad) * radius;
    gridLines.push(
      <line
        key={`line-${angle}`}
        x1={centerx}
        y1={centery}
        x2={x2}
        y2={y2}
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.15"
      />
    );
  }

  return (
    <div
      className={`pointer-events-none ${positionClasses[position]} ${className}`}
      style={{ opacity }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: `drop-shadow(0 0 10px ${glowColor}44)` }}
      >
        <defs>
          <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>{`
            @keyframes radar-sweep {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .radar-sweep-line {
              animation: radar-sweep ${sweepSpeed}s linear infinite;
              transform-origin: ${centerx}px ${centery}px;
            }
          `}</style>
        </defs>

        {/* Grid background */}
        <g fill="none" stroke={glowColor} strokeOpacity="0.1" strokeWidth="0.5">
          {gridLines}
        </g>

        {/* Center point */}
        <circle cx={centerx} cy={centery} r="3" fill={glowColor} opacity="0.6" />

        {/* Sweep beam */}
        <g className="radar-sweep-line" filter="url(#glow)">
          <path
            d={`M ${centerx} ${centery} L ${centerx + radius} ${centery} A ${radius} ${radius} 0 0 1 ${centerx} ${centery - radius} Z`}
            fill="url(#sweepGradient)"
            opacity="0.6"
          />
        </g>

        {/* Outer circle */}
        <circle
          cx={centerx}
          cy={centery}
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

export default RadarSweep;
