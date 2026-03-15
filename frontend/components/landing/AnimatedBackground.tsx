"use client";

import React from "react";
import { NetworkGlobe } from "./NetworkGlobe";

export const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* 3D Network Globe - Main visual element */}
      <NetworkGlobe />

      {/* Top radial glow effect */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-blue-600/15 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Subtle side accent glows */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-l from-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Background gradient overlay - smooth vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/10 to-slate-950/50 pointer-events-none" />

      {/* Enhanced radial gradient from center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-blue-600/20 via-slate-900/5 to-transparent opacity-60" />
      </div>

      {/* Horizontal scan line effect - very subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0 bg-repeating-linear-gradient(0deg, transparent 0px, rgba(255, 255, 255, 0.1) 1px, transparent 2px, transparent 4px)" />
      </div>
    </>
  );
};
