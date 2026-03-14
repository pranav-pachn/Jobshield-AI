/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useCallback, useRef, useEffect, useState, memo } from "react";
import dynamic from "next/dynamic";
// @ts-expect-error Missing types for react-force-graph-2d

// Dynamically import ForceGraph2D to avoid SSR issues with window object
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
  1: "#3b82f6", // Blue
  2: "#8b5cf6", // Purple
  3: "#ef4444", // Red
  4: "#f59e0b", // Amber
};

const ScamNetworkGraphComponent = () => {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fitGraphToViewport = useCallback(() => {
    const graphApi = fgRef.current as any;
    if (!graphApi) return;

    if (typeof graphApi.zoomToFit === "function") {
      graphApi.zoomToFit(400, 50);
      return;
    }

    // Fallback for wrappers that don't expose zoomToFit directly.
    if (typeof graphApi.centerAt === "function") {
      graphApi.centerAt(0, 0, 400);
    }
    if (typeof graphApi.zoom === "function") {
      graphApi.zoom(1.2, 400);
    }
  }, []);

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

  // Polling mechanism to ensure graph API is ready before calling zoomToFit
  useEffect(() => {
    if (!fgRef.current || dimensions.width === 0) return;

    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite polling
    const pollInterval = 100; // Check every 100ms

    const tryZoomToFit = () => {
      const graphApi = fgRef.current as any;
      if (!graphApi) return false;

      // Check if zoomToFit method is available
      if (typeof graphApi.zoomToFit === "function") {
        graphApi.zoomToFit(400, 50);
        return true;
      }

      // Fallback: try centerAt and zoom methods
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

    // Initial delay to ensure component is fully mounted
    const initialDelay = setTimeout(() => {
      const intervalId = setInterval(poll, pollInterval);
      
      // Cleanup function
      return () => {
        clearInterval(intervalId);
      };
    }, 500);

    return () => {
      clearTimeout(initialDelay);
    };
  }, [dimensions]);

  const handleNodeClick = useCallback((node: NodeData) => {
    // Aim at node from outside it
    if (fgRef.current) {
      const nodeX = (node as any).x;
      const nodeY = (node as any).y;
      const nodeZ = (node as any).z || 0;
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(nodeX, nodeY, nodeZ);

      fgRef.current.centerAt(nodeX, nodeY, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, []);

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-6 shadow-xl w-full">
        <h3 className="text-xl font-semibold text-gray-100 mb-2">Scam Network Analysis</h3>
        <p className="text-sm text-gray-400 mb-6">
          Visualizing the detected connections from the job offer to known deceptive patterns and domains.
        </p>
        
        <div ref={containerRef} className="w-full h-[400px] border border-gray-800 rounded-lg overflow-hidden relative bg-gray-950/50">
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
              linkColor={() => "rgba(255, 255, 255, 0.2)"}
              linkWidth={2}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              cooldownTicks={100}
              nodeCanvasObject={(node: unknown, ctx, globalScale) => {
                const n = node as any;
                const label = n.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map((num: number) => num + fontSize * 0.2); // some padding

                ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                ctx.fillRect(
                  n.x - bckgDimensions[0] / 2,
                  n.y - bckgDimensions[1] / 2 + 10,
                  bckgDimensions[0],
                  bckgDimensions[1]
                );

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = n.color || NODE_COLORS[n.group as number] || "#ffffff";
                ctx.fillText(label, n.x, n.y + 10);

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.val / 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = n.color || NODE_COLORS[n.group as number] || "#ffffff";
                ctx.fill();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// NextJS fast refresh workarounds with memo
export const ScamNetworkGraph = memo(ScamNetworkGraphComponent);
