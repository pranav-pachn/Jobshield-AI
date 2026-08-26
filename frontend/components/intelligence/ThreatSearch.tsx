import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ThreatSearchProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
}

export function ThreatSearch({ value, onChange, onSearch }: ThreatSearchProps) {
  return (
    <div className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          placeholder="Search domains, emails, phones, phrases..."
          className="pl-10 bg-slate-900 border-slate-700 focus-visible:ring-blue-500"
        />
      </div>
      <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">
        Search
      </Button>
    </div>
  );
}
