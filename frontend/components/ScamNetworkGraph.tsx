/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useCallback, useRef, useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Network } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

type NodeData = {
  id: string;
  name: string;
  group: number;
  val: number;
  color?: string;
};

type LinkData = {
  source: string;
  target: string;
};

interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

const simulatedData: GraphData = {
  nodes: [
    { id: "Job Offer", name: "Job Offer", group: 1, val: 20 },
    { id: "Recruiter Email", name: "Recruiter Email", group: 2, val: 15 },
    { id: "Suspicious Domain", name: "Suspicious Domain", group: 3, val: 15 },
    { id: "Scam Report 1", name: "Similar Scam Report", group: 4, val: 10 },
    { id: "Scam Report 2", name: "Reported Fake Check Scam", group: 4, val: 10 },
  ],
  links: [
    { source: "Job Offer", target: "Recruiter Email" },
    { source: "Recruiter Email", target: "Suspicious Domain" },
    { source: "Suspicious Domain", target: "Scam Report 1" },
    { source: "Suspicious Domain", target: "Scam Report 2" },
  ]
};

const NODE_COLORS: Record<number, string> = {
  1: "#3b82f6",
  2: "#8b5cf6",
  3: "#ef4444",
  4: "#f59e0b",
};

const ScamNetworkGraphComponent = () => {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 400
      });
      
      const handleResize = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth,
            height: 400
          });
        }
      };
      
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!fgRef.current || dimensions.width === 0) return;

    let attempts = 0;
    const maxAttempts = 50;
    const pollInterval = 100;

    const tryZoomToFit = () => {
      const graphApi = fgRef.current as any;
      if (!graphApi) return false;

      if (typeof graphApi.zoomToFit === "function") {
        graphApi.zoomToFit(400, 50);
        return true;
      }

      if (typeof graphApi.centerAt === "function" && typeof graphApi.zoom === "function") {
        graphApi.centerAt(0, 0, 400);
        graphApi.zoom(1.2, 400);
        return true;
      }

      return false;
    };

    const poll = () => {
      attempts++;
      if (tryZoomToFit() || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    };

    const initialDelay = setTimeout(() => {
      const intervalId = setInterval(poll, pollInterval);
      
      return () => {
        clearInterval(intervalId);
      };
    }, 500);

    return () => {
      clearTimeout(initialDelay);
    };
  }, [dimensions]);

  const handleNodeClick = useCallback((node: NodeData) => {
    if (fgRef.current) {
      const nodeX = (node as any).x;
      const nodeY = (node as any).y;

      fgRef.current.centerAt(nodeX, nodeY, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, []);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Network className="h-5 w-5" />
          Network Intelligence Graph
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Visualizing detected connections from the job offer to known deceptive patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden relative bg-background border border-border">
          {dimensions.width > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={simulatedData}
              nodeLabel="name"
              nodeColor={(node: unknown) => {
                const n = node as NodeData;
                return n.color || NODE_COLORS[n.group as number] || "#ffffff";
              }}
              nodeRelSize={6}
              linkColor={() => "rgba(139, 92, 246, 0.3)"}
              linkWidth={2}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              cooldownTicks={100}
              nodeCanvasObject={(node: unknown, ctx, globalScale) => {
                const n = node as any;
                const label = n.name;
                const fontSize = 11 / globalScale;
                ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth + 12, fontSize + 8];

                // Background pill
                ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                ctx.beginPath();
                const radius = bckgDimensions[1] / 2;
                const x = n.x - bckgDimensions[0] / 2;
                const y = n.y - bckgDimensions[1] / 2 + 14;
                ctx.roundRect(x, y, bckgDimensions[0], bckgDimensions[1], radius);
                ctx.fill();

                // Text
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = n.color || NODE_COLORS[n.group as number] || "#ffffff";
                ctx.fillText(label, n.x, n.y + 14);

                // Node circle
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.val / 2.5, 0, 2 * Math.PI, false);
                ctx.fillStyle = n.color || NODE_COLORS[n.group as number] || "#ffffff";
                ctx.fill();
                
                // Glow effect
                ctx.shadowColor = n.color || NODE_COLORS[n.group as number] || "#ffffff";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
              }}
            />
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-cyber-blue" />
            <span className="text-xs text-muted-foreground">Job Post</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-cyber-purple" />
            <span className="text-xs text-muted-foreground">Recruiter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-risk-high" />
            <span className="text-xs text-muted-foreground">Suspicious Domain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-risk-medium" />
            <span className="text-xs text-muted-foreground">Scam Reports</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ScamNetworkGraph = memo(ScamNetworkGraphComponent);
