import { Building2 } from "lucide-react";

export function CompanyCheckHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#05080f] p-8 shadow-inner">
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <Building2 className="h-7 w-7 text-blue-400 drop-shadow-md" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Company Intelligence
            </h1>
            <p className="text-sm font-medium text-slate-400 tracking-wide">
              Verify company domain authenticity and detect impersonators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
