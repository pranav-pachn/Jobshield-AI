"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: "safe" | "threat" | "neutral";
  pulsePhase: number;
  pulseSpeed: number;
  label?: string;
}

interface Edge {
  from: number;
  to: number;
  progress: number; // 0..1, animated draw-on progress
  speed: number;
  active: boolean;
  scanProgress: number; // 0..1 scanning dot moving along edge
}

const NODE_COLORS = {
  safe: { fill: "rgba(34,211,238,0.18)", stroke: "rgba(34,211,238,0.7)", glow: "rgba(34,211,238,0.35)" },
  threat: { fill: "rgba(239,68,68,0.14)", stroke: "rgba(239,68,68,0.65)", glow: "rgba(239,68,68,0.30)" },
  neutral: { fill: "rgba(99,102,241,0.14)", stroke: "rgba(99,102,241,0.55)", glow: "rgba(99,102,241,0.25)" },
};

const LABELS = ["JobOffer", "Recruiter", "Company", "Email", "Scam", "LinkedIn", "Alert", "Verify", "Domain", "AI"];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const ThreatNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Build nodes
    const NODE_COUNT = 11;
    const types: Array<"safe" | "threat" | "neutral"> = [
      "safe", "threat", "neutral", "safe", "threat",
      "neutral", "safe", "neutral", "threat", "safe", "neutral",
    ];
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: 0.1 * width + Math.random() * 0.8 * width,
      y: 0.1 * height + Math.random() * 0.8 * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: 5 + Math.random() * 7,
      type: types[i],
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.012 + Math.random() * 0.018,
      label: LABELS[i % LABELS.length],
    }));
    nodesRef.current = nodes;

    // Build edges — connect each node to 2-3 neighbours
    const edges: Edge[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const connections = 2 + Math.floor(Math.random() * 2);
      for (let c = 0; c < connections; c++) {
        const j = Math.floor(Math.random() * NODE_COUNT);
        if (j !== i && !edges.find(e => (e.from === i && e.to === j) || (e.from === j && e.to === i))) {
          edges.push({
            from: i,
            to: j,
            progress: Math.random(), // start mid-drawn for immediacy
            speed: 0.003 + Math.random() * 0.004,
            active: Math.random() > 0.4,
            scanProgress: Math.random(),
          });
        }
      }
    }
    edgesRef.current = edges;

    let frame = 0;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, width, height);
      frame++;

      // Move nodes
      for (const n of nodes) {
        n.pulsePhase += n.pulseSpeed;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 40 || n.x > width - 40) n.vx *= -1;
        if (n.y < 40 || n.y > height - 40) n.vy *= -1;
      }

      // Animate edges
      for (const e of edges) {
        if (!e.active) continue;
        e.progress = Math.min(1, e.progress + e.speed);
        e.scanProgress = (e.scanProgress + 0.008) % 1;
      }

      // Draw edges
      for (const e of edges) {
        if (!e.active) continue;
        const a = nodes[e.from];
        const b = nodes[e.to];
        const endX = lerp(a.x, b.x, e.progress);
        const endY = lerp(a.y, b.y, e.progress);

        // Edge line
        const isThreat = a.type === "threat" || b.type === "threat";
        const edgeColor = isThreat ? "rgba(239,68,68,0.22)" : "rgba(34,211,238,0.15)";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Scanning dot travelling along edge
        if (e.progress >= 1) {
          const dotX = lerp(a.x, b.x, e.scanProgress);
          const dotY = lerp(a.y, b.y, e.scanProgress);
          const dotColor = isThreat ? "rgba(239,68,68,0.9)" : "rgba(34,211,238,0.9)";
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();

          // Dot glow
          const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 8);
          grad.addColorStop(0, isThreat ? "rgba(239,68,68,0.5)" : "rgba(34,211,238,0.5)");
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const colors = NODE_COLORS[n.type];
        const pulse = 0.7 + 0.3 * Math.sin(n.pulsePhase);
        const r = n.radius;

        // Outer glow ring
        const glowGrad = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, r * 3.5);
        glowGrad.addColorStop(0, colors.glow);
        glowGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Node body
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.fill();
        ctx.strokeStyle = colors.stroke;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Pulse ring expanding outward
        const ringR = r + 8 + 10 * ((n.pulsePhase / (Math.PI * 2)) % 1);
        ctx.beginPath();
        ctx.arc(n.x, n.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = colors.stroke.replace("0.7", String((1 - (ringR - r - 8) / 10) * 0.4));
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Label
        if (n.label && r > 8) {
          ctx.font = "9px 'Inter', monospace";
          ctx.fillStyle = "rgba(226,232,240,0.6)";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y + r + 11);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    const handleResize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
};
