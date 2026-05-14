"use client";

import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

export interface NetworkGraphNode {
  id: string;
}

export interface NetworkGraphLink {
  source: string;
  target: string;
}

export interface NetworkGraphData {
  nodes: NetworkGraphNode[];
  links: NetworkGraphLink[];
}

interface NetworkGraphProps {
  graphData: NetworkGraphData;
}

function inferNodeGroup(id: string): "domain" | "email" | "phrase" {
  if (id.includes("@")) {
    return "email";
  }

  if (id.includes(".")) {
    return "domain";
  }

  return "phrase";
}

function nodeColor(group: "domain" | "email" | "phrase"): string {
  if (group === "domain") return "#0ea5e9";
  if (group === "email") return "#22c55e";
  return "#f97316";
}

export default function NetworkGraph({ graphData }: NetworkGraphProps) {
  const normalized = {
    nodes: graphData.nodes.map((node) => ({
      ...node,
      group: inferNodeGroup(node.id),
    })),
    links: graphData.links,
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Network className="h-5 w-5 text-primary" />
          Scam Entity Network
        </CardTitle>
        <CardDescription>
          Domain-to-email-to-phrase relationship map from this analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[360px] w-full overflow-hidden rounded-lg border border-border/60 bg-muted/10">
          <ForceGraph2D
            graphData={normalized}
            nodeLabel="id"
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            cooldownTicks={120}
            nodeAutoColorBy="group"
            nodeCanvasObject={(node, ctx, globalScale) => {
              const typedNode = node as { id: string; group: "domain" | "email" | "phrase"; x?: number; y?: number };
              const label = typedNode.id;
              const fontSize = 12 / globalScale;
              const x = typedNode.x ?? 0;
              const y = typedNode.y ?? 0;

              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
              ctx.fillStyle = nodeColor(typedNode.group);
              ctx.fill();

              ctx.font = `${fontSize}px Segoe UI`;
              ctx.fillStyle = "#d1d5db";
              ctx.textAlign = "center";
              ctx.fillText(label, x, y + 14);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
