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
  targetX?: number;
  targetY?: number;
  baseVx: number;
  baseVy: number;
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
  "rgb(139, 92, 246, 0.7)", // Violet
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

    const context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
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
      particlesRef.current = Array.from({ length: particleCount }, () => {
        const vx = (Math.random() - 0.5) * animationSpeed;
        const vy = (Math.random() - 0.5) * animationSpeed;
        return {
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: Math.random() * 1.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulsePhase: Math.random() * Math.PI * 2,
        };
      });
    };

    initializeParticles();

    // Draw function
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas with minimal fade for motion blur effect
      context.fillStyle = "rgba(0, 0, 0, 0.015)";
      context.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        // Apply eased velocity changes for smoother motion
        const easing = 0.98; // Smooth deceleration/acceleration
        particle.vx = particle.baseVx + (Math.sin(particle.pulsePhase * 0.5) * 0.3);
        particle.vy = particle.baseVy + (Math.cos(particle.pulsePhase * 0.5) * 0.3);

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulsePhase += 0.018;

        // Wrap around edges with smooth fade
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Calculate smooth pulse for sophisticated glow
        const pulse = Math.sin(particle.pulsePhase) * 0.25 + 0.75;
        const glowIntensity = Math.sin(particle.pulsePhase * 0.7) * 0.4 + 0.6;

        // Draw particle with enhanced multi-layer glow
        context.save();
        
        // Outer glow layer (soft)
        context.fillStyle = particle.color;
        context.globalAlpha = opacity * glowIntensity * 0.3;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 2.5, 0, Math.PI * 2);
        context.fill();

        // Middle glow layer
        context.globalAlpha = opacity * glowIntensity * 0.5;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 1.8, 0, Math.PI * 2);
        context.fill();

        // Core particle
        context.globalAlpha = opacity * pulse;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();

        context.restore();

        // Draw connections to nearby particles with smooth gradient
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const otherParticle = particlesRef.current[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            context.save();
            const lineAlpha = (1 - distance / connectionDistance) * opacity * 0.4;
            
            // Smooth gradient line with glow
            const gradient = context.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            gradient.addColorStop(0, `rgba(59, 130, 246, ${lineAlpha * 0.5})`);
            gradient.addColorStop(0.5, `rgba(59, 130, 246, ${lineAlpha * 0.8})`);
            gradient.addColorStop(1, `rgba(59, 130, 246, ${lineAlpha * 0.5})`);
            
            context.strokeStyle = gradient;
            context.lineWidth = 0.8;
            context.lineCap = "round";
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
