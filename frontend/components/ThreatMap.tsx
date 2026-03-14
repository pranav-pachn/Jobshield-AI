"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, AlertTriangle } from "lucide-react";

interface ThreatPoint {
  id: string;
  x: number;
  y: number;
  intensity: "high" | "medium" | "low";
  location: string;
  reports: number;
}

const threatData: ThreatPoint[] = [
  { id: "1", x: 25, y: 35, intensity: "high", location: "Lagos, Nigeria", reports: 847 },
  { id: "2", x: 78, y: 45, intensity: "high", location: "Manila, Philippines", reports: 623 },
  { id: "3", x: 55, y: 30, intensity: "medium", location: "Mumbai, India", reports: 412 },
  { id: "4", x: 15, y: 40, intensity: "medium", location: "São Paulo, Brazil", reports: 298 },
  { id: "5", x: 42, y: 25, intensity: "medium", location: "Kyiv, Ukraine", reports: 267 },
  { id: "6", x: 85, y: 55, intensity: "low", location: "Jakarta, Indonesia", reports: 189 },
  { id: "7", x: 48, y: 20, intensity: "low", location: "Moscow, Russia", reports: 156 },
  { id: "8", x: 30, y: 48, intensity: "low", location: "Johannesburg, SA", reports: 134 },
];

const intensityColors = {
  high: { bg: "bg-risk-high", ring: "ring-risk-high/50", pulse: "animate-ping bg-risk-high" },
  medium: { bg: "bg-risk-medium", ring: "ring-risk-medium/50", pulse: "animate-ping bg-risk-medium" },
  low: { bg: "bg-risk-low", ring: "ring-risk-low/50", pulse: "" },
};

export function ThreatMap() {
  const [mounted, setMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ThreatPoint | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5" />
            Global Threat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg bg-accent/30 shimmer" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5" />
          Global Threat Map
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Real-time scam activity hotspots worldwide
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 rounded-lg overflow-hidden bg-background border border-border">
          {/* World map background (simplified SVG) */}
          <svg
            viewBox="0 0 100 60"
            className="absolute inset-0 w-full h-full opacity-20"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Simplified continents */}
            <path
              d="M10,25 Q15,20 25,22 T35,28 Q30,35 25,40 T10,38 Z"
              fill="currentColor"
              className="text-primary/40"
            />
            <path
              d="M40,15 Q50,10 60,18 T65,30 Q55,35 45,32 T40,20 Z"
              fill="currentColor"
              className="text-primary/40"
            />
            <path
              d="M35,35 Q45,32 50,40 T45,50 Q35,48 30,42 Z"
              fill="currentColor"
              className="text-primary/40"
            />
            <path
              d="M55,25 Q65,20 80,28 T85,40 Q75,50 60,45 T55,30 Z"
              fill="currentColor"
              className="text-primary/40"
            />
            <path
              d="M75,45 Q85,42 90,50 T85,58 Q75,55 72,50 Z"
              fill="currentColor"
              className="text-primary/40"
            />
          </svg>

          {/* Grid overlay */}
          <div className="absolute inset-0 surface-grid opacity-30" />

          {/* Threat points */}
          {threatData.map((point) => (
            <div
              key={point.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Pulse effect for high intensity */}
              {point.intensity === "high" && (
                <span className="absolute inset-0 w-4 h-4 -m-1 rounded-full bg-risk-high/30 animate-ping" />
              )}
              {/* Main dot */}
              <span
                className={`relative flex h-3 w-3 rounded-full ${intensityColors[point.intensity].bg} ring-2 ${intensityColors[point.intensity].ring} transition-transform group-hover:scale-150`}
              />
            </div>
          ))}

          {/* Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-10 px-3 py-2 rounded-lg bg-card border border-border shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                left: `${Math.min(Math.max(hoveredPoint.x, 15), 85)}%`,
                top: `${hoveredPoint.y + 8}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-3 w-3 ${
                  hoveredPoint.intensity === "high" ? "text-risk-high" :
                  hoveredPoint.intensity === "medium" ? "text-risk-medium" : "text-risk-low"
                }`} />
                <span className="text-xs font-medium text-foreground">{hoveredPoint.location}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{hoveredPoint.reports} reports</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-risk-high" />
              <span className="text-xs text-muted-foreground">High Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-risk-medium" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-risk-low" />
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {threatData.reduce((sum, p) => sum + p.reports, 0).toLocaleString()} total reports
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
