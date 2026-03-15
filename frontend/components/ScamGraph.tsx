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
    <Card className="glass-card-accent shadow-xl overflow-hidden relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Share2 className="h-5 w-5 text-primary" />
          Threat Intelligence Map
        </CardTitle>
        <CardDescription>
          Live threat correlation mapping showing scam network relationships and connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/5 -z-10" />
        
        <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-black/60 to-black/40 shadow-inner">
          {/* Animated background grid */}
          <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="threatthreat-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(96,125,255,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#threat-grid)" />
          </svg>

          {/* Connection lines - Now animated */}
          <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="lineGradient">
                <stop offset="0%" stopColor="rgba(96,125,255,0.2)" />
                <stop offset="50%" stopColor="rgba(147,51,234,0.3)" />
                <stop offset="100%" stopColor="rgba(96,125,255,0.2)" />
              </linearGradient>
            </defs>
            {links.map(([from, to], idx) => {
              const start = nodes.find((node) => node.id === from);
              const end = nodes.find((node) => node.id === to);

              if (!start || !end) {
                return null;
              }

              return (
                <g key={`${from}-${to}`}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="url(#lineGradient)"
                    strokeWidth="1.2"
                    className="animate-pulse"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                  {/* Animated data packet */}
                  <circle
                    cx={start.x}
                    cy={start.y}
                    r="1"
                    fill="rgba(96,125,255,0.8)"
                    className="animate-pulse"
                    style={{
                      animation: `float ${2}s ease-in-out infinite`,
                      animationDelay: `${idx * 0.2}s`,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes - Enhanced */}
          {nodes.map((node, idx) => (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border px-3 py-2 text-xs font-bold tracking-wide backdrop-blur-md transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(96,125,255,0.6)] shadow-lg group cursor-pointer ${node.tone}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                animation: `float ${4 + idx}s ease-in-out infinite`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-current opacity-70 group-hover:opacity-100 transition-opacity" />
                <span>{node.id}</span>
              </div>
            </div>
          ))}

          {/* Info overlay */}
          <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-[10px] font-medium text-muted-foreground backdrop-blur-md hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span>Correlation Mapping Active</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] font-medium">
          {[
            { label: "Job Post", color: "primary" },
            { label: "Recruiter", color: "secondary" },
            { label: "Domain", color: "destructive" },
            { label: "Network", color: "yellow-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  item.color === "primary"
                    ? "bg-blue-500"
                    : item.color === "secondary"
                      ? "bg-purple-500"
                      : item.color === "destructive"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                }`}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </Card>
  );
}