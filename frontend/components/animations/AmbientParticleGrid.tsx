"use client";

/**
 * Ambient Particle Grid Component
 * Canvas-based particle system for cybersecurity aesthetic
 * Features: slow moving particles, connecting lines, occasional pulses
 * Low opacity (~10%) to keep content readable
 */

import React, { useEffect, useRef } from "react";
import { usePerformanceMode } from "@/lib/animations/usePerformanceMode";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

interface AmbientParticleGridProps {
  opacity?: number;
  particleCount?: number;
  connectionDistance?: number;
  animationSpeed?: number;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "rgb(59, 130, 246, 0.8)", // Blue
  "rgb(147, 51, 234, 0.8)", // Purple
  "rgb(34, 211, 238, 0.6)", // Cyan
  "rgb(239, 68, 68, 0.5)", // Red accent (rare)
];

export function AmbientParticleGrid({
  opacity = 0.1,
  particleCount = 50,
  connectionDistance = 150,
  animationSpeed = 0.3,
  colors = DEFAULT_COLORS,
  className = "",
}: AmbientParticleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const performanceMode = usePerformanceMode();

  // Performance-based adjustments
  const getPerformanceAdjustedProps = () => {
    switch (performanceMode) {
      case "reduced":
        return {
          particleCount: 0,
          animationSpeed: 0,
          connectionDistance: 0,
        };
      case "mobile":
        return {
          particleCount: Math.floor(particleCount * 0.5),
          animationSpeed: animationSpeed * 0.7,
          connectionDistance: connectionDistance * 0.8,
        };
      default:
        return {
          particleCount,
          animationSpeed,
          connectionDistance,
        };
    }
  };

  const adjustedProps = getPerformanceAdjustedProps();

  useEffect(() => {
    // Disable for accessibility
    if (performanceMode === "reduced" || adjustedProps.particleCount === 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // Initialize particles
    const initializeParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * animationSpeed,
        vy: (Math.random() - 0.5) * animationSpeed,
        radius: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    initializeParticles();

    // Draw function
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas with slight fade for motion blur
      context.fillStyle = "rgba(0, 0, 0, 0.02)";
      context.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulsePhase += 0.02;

        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Calculate pulse for soft glow
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;

        // Draw particle with glow
        context.save();
        context.fillStyle = particle.color;
        context.globalAlpha = opacity * pulse;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();

        // Draw connections to nearby particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const otherParticle = particlesRef.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            context.save();
            const lineAlpha = (1 - distance / connectionDistance) * opacity * 0.5;
            context.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            context.lineWidth = 0.5;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(otherParticle.x, otherParticle.y);
            context.stroke();
            context.restore();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    // Handle resize
    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [particleCount, connectionDistance, animationSpeed, colors, opacity, performanceMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        opacity: opacity,
        zIndex: 0,
      }}
    />
  );
}

export default AmbientParticleGrid;
