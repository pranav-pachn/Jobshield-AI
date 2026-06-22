import { Globe, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompanyCheckInputProps {
  url: string;
  isScanning: boolean;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
}

export function CompanyCheckInput({ url, isScanning, onUrlChange, onAnalyze }: CompanyCheckInputProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch w-full max-w-4xl mx-auto">
      <div className="relative flex-1 group">
        <div className="relative flex items-center bg-black/50 rounded-xl border border-slate-800 overflow-hidden shadow-inner transition-colors focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/30">
          <div className="pl-4 pr-2 flex items-center justify-center">
            <Globe className="h-5 w-5 text-slate-500 focus-within:text-blue-400 transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            placeholder="Enter company website URL (e.g., techcorp.com)"
            className="w-full bg-transparent p-4 pl-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none font-mono"
            disabled={isScanning}
          />
        </div>
      </div>
      <Button 
        onClick={onAnalyze} 
        disabled={!url.trim() || isScanning}
        className="h-[54px] sm:w-[220px] px-8 rounded-xl bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold tracking-wide shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
      >
        {isScanning ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Scanning...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Analyze Domain
          </span>
        )}
      </Button>
    </div>
  );
}
