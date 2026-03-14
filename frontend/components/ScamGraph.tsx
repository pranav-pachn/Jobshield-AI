"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

const nodes = [
  { id: "Job Post", x: 14, y: 44, color: "bg-cyber-blue text-cyber-blue border-cyber-blue/30" },
  { id: "Recruiter Email", x: 42, y: 18, color: "bg-cyber-purple text-cyber-purple border-cyber-purple/30" },
  { id: "Domain", x: 74, y: 35, color: "bg-risk-high text-risk-high border-risk-high/30" },
  { id: "Scam Reports", x: 62, y: 74, color: "bg-risk-medium text-risk-medium border-risk-medium/30" },
  { id: "Wallet Address", x: 28, y: 80, color: "bg-risk-low text-risk-low border-risk-low/30" },
];

const links = [
  ["Job Post", "Recruiter Email"],
  ["Recruiter Email", "Domain"],
  ["Domain", "Scam Reports"],
  ["Scam Reports", "Wallet Address"],
  ["Job Post", "Wallet Address"],
];

export function ScamGraph() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Network className="h-5 w-5" />
          Relationship Graph
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Network visualization of scam entity connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[420px] overflow-hidden rounded-xl border border-border bg-background">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {links.map(([from, to]) => {
              const start = nodes.find((node) => node.id === from);
              const end = nodes.find((node) => node.id === to);

              if (!start || !end) {
                return null;
              }

              return (
                <line
                  key={`${from}-${to}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card/90 backdrop-blur px-3 py-2 text-xs font-medium shadow-lg ${node.color}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.id}
            </div>
          ))}

          <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/90 backdrop-blur px-4 py-2.5 text-xs text-muted-foreground">
            Shared entities reveal coordinated scam campaigns
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
