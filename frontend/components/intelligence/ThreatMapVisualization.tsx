"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, AlertCircle } from "lucide-react";

interface ThreatLocation {
  country: string;
  region: string;
  incidents: number;
  severity: "high" | "medium" | "low";
  threat_level: number; // 0-100
}

interface ThreatMapProps {
  locations?: ThreatLocation[];
  title?: string;
  description?: string;
}

const DEFAULT_LOCATIONS: ThreatLocation[] = [
  { country: "United States", region: "Texas", incidents: 45, severity: "high", threat_level: 92 },
  { country: "United States", region: "California", incidents: 38, severity: "high", threat_level: 88 },
  { country: "India", region: "Bangalore", incidents: 32, severity: "high", threat_level: 85 },
  { country: "United Kingdom", region: "London", incidents: 28, severity: "medium", threat_level: 72 },
  { country: "Nigeria", region: "Lagos", incidents: 25, severity: "high", threat_level: 80 },
  { country: "Philippines", region: "Manila", incidents: 22, severity: "medium", threat_level: 68 },
  { country: "China", region: "Shanghai", incidents: 18, severity: "medium", threat_level: 65 },
  { country: "Russia", region: "Moscow", incidents: 15, severity: "medium", threat_level: 60 },
  { country: "Indonesia", region: "Jakarta", incidents: 14, severity: "low", threat_level: 55 },
  { country: "Canada", region: "Toronto", incidents: 12, severity: "low", threat_level: 50 },
];

export function ThreatMapVisualization({
  locations = DEFAULT_LOCATIONS,
  title = "Global Threat Map",
  description = "Scam activity hotspots across continents",
}: ThreatMapProps) {
  const maxIncidents = Math.max(...locations.map((l) => l.incidents));
  const totalIncidents = locations.reduce((sum, l) => sum + l.incidents, 0);
  const highRiskLocations = locations.filter((l) => l.threat_level >= 80).length;

  return (
    <Card className="glass-card-accent border-border overflow-hidden col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-xs font-medium text-red-300">{highRiskLocations} High Risk</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Heat map visualization grid */}
        <div className="space-y-3">
          {/* World visualization card */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-900/20 p-6 mb-6 relative overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="worldgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(96,125,255,0.1)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#worldgrid)" />
              </svg>
            </div>

            {/* Threat indicator dots */}
            <div className="relative h-48 flex items-center justify-center">
              {/* Simulate dots on a world map */}
              <svg viewBox="0 0 960 600" className="w-full h-full" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>
                {/* Background continents representation */}
                <circle cx="200" cy="200" r="8" fill="url(#threatGradient)" opacity="0.8" />
                <circle cx="550" cy="180" r="6" fill="url(#threatGradient)" opacity="0.7" />
                <circle cx="750" cy="150" r="5" fill="url(#threatGradient)" opacity="0.6" />
                <circle cx="800" cy="250" r="7" fill="url(#threatGradient)" opacity="0.75" />
                <circle cx="600" cy="400" r="6" fill="url(#threatGradient)" opacity="0.65" />
                <circle cx="250" cy="450" r="4" fill="url(#threatGradient)" opacity="0.5" />

                <defs>
                  <radialGradient id="threatGradient">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Overlay text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-semibold text-muted-foreground">Global Threat Distribution</p>
                  <p className="text-3xl font-bold text-primary mt-2">{totalIncidents}</p>
                  <p className="text-xs text-muted-foreground">Total Incidents Tracked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location list with heat indicators */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {locations.map((location, idx) => {
              const heat = (location.incidents / maxIncidents) * 100;
              const severityColor =
                location.severity === "high"
                  ? "from-red-500 to-red-600"
                  : location.severity === "medium"
                    ? "from-yellow-500 to-yellow-600"
                    : "from-green-500 to-green-600";

              return (
                <div
                  key={idx}
                  className="group rounded-lg border border-white/5 bg-white/[3%] p-3 hover:border-white/10 transition-all duration-300 hover:bg-white/5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{location.country}</p>
                      <p className="text-xs text-muted-foreground">{location.region}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground">{location.incidents}</span>
                        <span className="text-xs text-muted-foreground">incidents</span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            location.severity === "high"
                              ? "bg-red-500/20 text-red-300"
                              : location.severity === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {location.severity.charAt(0).toUpperCase() + location.severity.slice(1)} Risk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Heat bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${severityColor} transition-all duration-500 group-hover:shadow-lg group-hover:shadow-red-500/30`}
                      style={{ width: `${heat}%` }}
                    />
                  </div>

                  {/* Threat level indicator */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Threat Level</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.ceil(location.threat_level / 20)
                              ? `${location.severity === "high" ? "bg-red-500" : location.severity === "medium" ? "bg-yellow-500" : "bg-green-500"}`
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-primary">{location.threat_level}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
