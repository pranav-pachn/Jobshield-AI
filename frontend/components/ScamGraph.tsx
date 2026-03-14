import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const nodes = [
  { id: "Job Post", x: 14, y: 44, tone: "bg-amber-100 text-amber-950 border-amber-300" },
  { id: "Recruiter Email", x: 42, y: 18, tone: "bg-cyan-100 text-cyan-950 border-cyan-300" },
  { id: "Domain", x: 74, y: 35, tone: "bg-rose-100 text-rose-950 border-rose-300" },
  { id: "Scam Reports", x: 62, y: 74, tone: "bg-slate-200 text-slate-950 border-slate-300" },
  { id: "Wallet Address", x: 28, y: 80, tone: "bg-emerald-100 text-emerald-950 border-emerald-300" },
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
    <Card className="border border-border/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle>Scam graph</CardTitle>
        <CardDescription>
          Relationship map placeholder for the future graph visualization layer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[420px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc,#eef2ff)]">
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
                  stroke="rgba(51, 65, 85, 0.28)"
                  strokeWidth="1.1"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${node.tone}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.id}
            </div>
          ))}

          <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 backdrop-blur">
            Shared entities create the edges that reveal coordinated scam campaigns.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}