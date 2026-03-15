"use client";

/**
 * Data Stream Lines Component
 * Canvas-based animated flowing lines for analyzer page
 * Represents network packets, data flow, cyber monitoring
 * Features: gradient lines, smooth animation, low opacity
 */

import React, { useEffect, useRef } from "react";
import { usePerformanceMode } from "@/lib/animations/usePerformanceMode";

interface DataStreamLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  gradient: CanvasGradient | null;
}

interface DataStreamLinesProps {
  opacity?: number;
  lineCount?: number;
  className?: string;
}

export function DataStreamLines({
  opacity = 0.1,
  lineCount = 4,
  className = "",
}: DataStreamLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<DataStreamLine[]>([]);
  const animationFrameRef = useRef<number>();
  const performanceMode = usePerformanceMode();

  if (performanceMode === "reduced") {
    return null;
  }

  useEffect(() => {
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

    // Initialize data stream lines
    const initializeLines = () => {
      linesRef.current = Array.from({ length: lineCount }, (_, i) => {
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180); // -30 to +30 degrees
        const speed = Math.random() * 0.3 + 0.2;

        return {
          x: Math.random() * canvas.offsetWidth - 200,
          y: (i / lineCount) * canvas.offsetHeight,
          length: 100 + Math.random() * 100,
          speed,
          angle,
          gradient: null,
        };
      });
    };

    initializeLines();

    // Draw function
    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      context.fillStyle = "rgba(0, 0, 0, 0.05)";
      context.fillRect(0, 0, width, height);

      // Draw each data stream line
      linesRef.current.forEach((line) => {
        // Update position
        line.x += line.speed;

        // Wrap around
        if (line.x > width + 200) {
          line.x = -200;
          line.y = Math.random() * height;
        }

        // Create gradient
        const x1 = line.x;
        const y1 = line.y;
        const x2 = line.x + Math.cos(line.angle) * line.length;
        const y2 = line.y + Math.sin(line.angle) * line.length;

        const gradient = context.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0)"); // Blue, transparent
        gradient.addColorStop(0.5, "rgba(147, 51, 234, 0.8)"); // Purple, opaque
        gradient.addColorStop(1, "rgba(34, 211, 238, 0)"); // Cyan, transparent

        // Draw line
        context.save();
        context.globalAlpha = opacity;
        context.strokeStyle = gradient;
        context.lineWidth = 1;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        // Draw glow effect
        context.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.3})`;
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();

        context.restore();
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
  }, [lineCount, opacity, performanceMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 0,
      }}
    />
  );
}

export default DataStreamLines;
