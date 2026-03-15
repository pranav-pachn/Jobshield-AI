"use client";

import React from "react";
import { NetworkGlobe } from "./NetworkGlobe";

export const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* 3D Network Globe */}
      <NetworkGlobe />

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/40 pointer-events-none" />

      {/* Radial gradient accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1/2 bg-radial-gradient from-blue-600/20 via-cyan-600/5 to-transparent opacity-50" />
      </div>
    </>
  );
};
