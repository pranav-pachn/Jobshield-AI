import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

const nodes = [
  { id: "Job Post", x: 14, y: 44, tone: "bg-primary/20 text-primary border-primary/30" },
  { id: "Recruiter Email", x: 42, y: 18, tone: "bg-secondary/20 text-secondary-foreground border-secondary/30" },
  { id: "Domain", x: 74, y: 35, tone: "bg-destructive/20 text-destructive border-destructive/30" },
  { id: "Scam Reports", x: 62, y: 74, tone: "bg-muted text-muted-foreground border-border" },
  { id: "Wallet Address", x: 28, y: 80, tone: "bg-green-500/20 text-green-500 border-green-500/30" },
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
    <Card className="glass-card shadow-xl overflow-hidden relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Threat Intelligence Map
        </CardTitle>
        <CardDescription>
          Live relational mapping of scattered indicators into organized scam campaigns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Deep space background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />
        
        <div className="relative h-[280px] w-full overflow-hidden rounded-xl border border-white/5 bg-black/20 shadow-inner">
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="0.8"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md transition-all hover:scale-105 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${node.tone}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.id}
            </div>
          ))}

          <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur-md">
            Tracing indicator overlaps across the dark web.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}