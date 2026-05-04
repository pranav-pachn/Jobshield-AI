import { Building2 } from "lucide-react";

export function CompanyCheckEmptyState() {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity duration-500 animate-in fade-in zoom-in-95 duration-700">
      <div className="h-20 w-20 rounded-full border border-dashed border-white/20 bg-white/[2%] flex items-center justify-center mb-6 shadow-inner">
        <Building2 className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-xl font-semibold text-foreground tracking-tight">Ready to Scan</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-3 leading-relaxed">
        Enter a company URL above to verify its authenticity, check domain age, and detect potential impersonation campaigns.
      </p>
    </div>
  );
}
