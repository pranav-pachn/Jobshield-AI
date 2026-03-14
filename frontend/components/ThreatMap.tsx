"use client";

import { useEffect, useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, MapPin } from "lucide-react";

interface ThreatLocation {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  threatCount: number;
  riskLevel: "high" | "medium" | "low";
}

const threatLocations: ThreatLocation[] = [
  { id: "1", city: "Lagos", country: "Nigeria", lat: 6.5, lng: 3.4, threatCount: 342, riskLevel: "high" },
  { id: "2", city: "Manila", country: "Philippines", lat: 14.6, lng: 121.0, threatCount: 287, riskLevel: "high" },
  { id: "3", city: "Mumbai", country: "India", lat: 19.1, lng: 72.9, threatCount: 156, riskLevel: "medium" },
  { id: "4", city: "Kyiv", country: "Ukraine", lat: 50.4, lng: 30.5, threatCount: 134, riskLevel: "medium" },
  { id: "5", city: "Jakarta", country: "Indonesia", lat: -6.2, lng: 106.8, threatCount: 98, riskLevel: "medium" },
  { id: "6", city: "Dhaka", country: "Bangladesh", lat: 23.8, lng: 90.4, threatCount: 87, riskLevel: "medium" },
  { id: "7", city: "Moscow", country: "Russia", lat: 55.8, lng: 37.6, threatCount: 76, riskLevel: "low" },
  { id: "8", city: "Nairobi", country: "Kenya", lat: -1.3, lng: 36.8, threatCount: 54, riskLevel: "low" },
];

function ThreatMapComponent() {
  const [animatedPoints, setAnimatedPoints] = useState<string[]>([]);

  useEffect(() => {
    // Animate points appearing one by one
    const timeouts: NodeJS.Timeout[] = [];
    threatLocations.forEach((location, index) => {
      const timeout = setTimeout(() => {
        setAnimatedPoints(prev => [...prev, location.id]);
      }, index * 150);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Convert lat/lng to SVG coordinates (simple equirectangular projection)
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#22c55e";
      default:
        return "#3b82f6";
    }
  };

  const getPointSize = (count: number) => {
    if (count > 200) return 12;
    if (count > 100) return 9;
    return 6;
  };

  return (
    <Card className="border-border bg-card glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5" />
          Global Threat Map
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Geographic distribution of detected scam activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg overflow-hidden bg-background/50 border border-border">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            style={{ minHeight: "300px" }}
          >
            {/* World map simplified outline */}
            <defs>
              <radialGradient id="pointGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Grid lines */}
            {[...Array(9)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 50}
                x2="800"
                y2={i * 50}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            ))}
            {[...Array(17)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="400"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            ))}

            {/* Continent outlines (simplified paths) */}
            <g fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeOpacity="0.4">
              {/* North America */}
              <path d="M50,100 Q100,80 150,90 L180,120 Q200,150 180,180 L120,200 Q80,180 60,140 Z" />
              {/* South America */}
              <path d="M150,220 Q180,210 200,230 L210,280 Q200,340 170,360 L140,340 Q130,280 150,220 Z" />
              {/* Europe */}
              <path d="M350,80 Q400,70 450,90 L460,130 Q440,150 380,140 L350,110 Z" />
              {/* Africa */}
              <path d="M370,150 Q420,140 450,180 L460,280 Q430,340 380,330 L340,260 Q350,180 370,150 Z" />
              {/* Asia */}
              <path d="M480,60 Q580,50 680,80 L720,140 Q700,200 620,220 L520,200 Q460,150 480,60 Z" />
              {/* Australia */}
              <path d="M620,280 Q680,260 720,290 L730,330 Q700,360 650,350 L620,320 Z" />
            </g>

            {/* Threat points */}
            {threatLocations.map((location) => {
              const { x, y } = toSvgCoords(location.lat, location.lng);
              const isVisible = animatedPoints.includes(location.id);
              const size = getPointSize(location.threatCount);
              const color = getRiskColor(location.riskLevel);

              return (
                <g key={location.id} style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.5s ease" }}>
                  {/* Outer glow ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={size + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                    className="threat-pulse"
                  />
                  {/* Middle ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={size + 4}
                    fill={color}
                    opacity="0.2"
                  />
                  {/* Core point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={color}
                    filter="url(#glow)"
                  />
                  {/* Center dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={size / 3}
                    fill="white"
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend and stats */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-risk-high shadow-[0_0_8px_#ef4444]" />
              <span className="text-xs text-muted-foreground">High Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-risk-medium shadow-[0_0_8px_#f59e0b]" />
              <span className="text-xs text-muted-foreground">Medium Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-risk-low shadow-[0_0_8px_#22c55e]" />
              <span className="text-xs text-muted-foreground">Low Activity</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{threatLocations.length} active hotspots</span>
          </div>
        </div>

        {/* Top locations list */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {threatLocations.slice(0, 4).map((location) => (
            <div 
              key={location.id}
              className="rounded-lg border border-border bg-accent/30 p-3 glass-card-hover"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getRiskColor(location.riskLevel) }}
                />
                <span className="text-xs font-medium text-foreground truncate">{location.city}</span>
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{location.threatCount}</div>
              <div className="text-xs text-muted-foreground">threats detected</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const ThreatMap = memo(ThreatMapComponent);
