import { Building2 } from "lucide-react";

export function CompanyCheckHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-card/40 p-8 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] group">
      {/* Animated glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-[80px] group-hover:bg-indigo-500/30 transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/20 blur-[80px] group-hover:bg-purple-500/30 transition-colors duration-700" />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:scale-105 transition-transform duration-500">
            <Building2 className="h-7 w-7 text-indigo-400 drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
              Company Intelligence
            </h1>
            <p className="text-sm font-medium text-muted-foreground/80 tracking-wide">
              Verify company domain authenticity and detect impersonators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
