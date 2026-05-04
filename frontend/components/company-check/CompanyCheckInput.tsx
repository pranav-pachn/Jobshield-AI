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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-indigo-500/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 group-focus-within:from-indigo-500/30 group-focus-within:via-purple-500/30 group-focus-within:to-indigo-500/30 transition-all duration-500" />
        <div className="relative flex items-center bg-card/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-sm transition-colors group-focus-within:border-indigo-500/50 group-hover:border-white/20">
          <div className="pl-4 pr-2 flex items-center justify-center">
            <Globe className="h-5 w-5 text-muted-foreground group-focus-within:text-indigo-400 transition-colors duration-300" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
            placeholder="Enter company website URL (e.g., techcorp.com)"
            className="w-full bg-transparent p-4 pl-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            disabled={isScanning}
          />
        </div>
      </div>
      <Button 
        onClick={onAnalyze} 
        disabled={!url.trim() || isScanning}
        className="h-[58px] sm:w-[200px] px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
