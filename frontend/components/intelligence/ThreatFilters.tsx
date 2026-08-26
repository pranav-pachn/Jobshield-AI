import { cn } from "@/lib/utils";

interface ThreatFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const TABS = [
  { id: "ALL", label: "All" },
  { id: "DOMAIN", label: "Domains" },
  { id: "EMAIL", label: "Emails" },
  { id: "PHONE", label: "Phones" },
  { id: "TELEGRAM", label: "Telegram" },
  { id: "WHATSAPP", label: "WhatsApp" },
  { id: "SCAM_PHRASE", label: "Phrases" },
  { id: "COMPANY", label: "Companies" }
];

export function ThreatFilters({ selectedType, onTypeChange }: ThreatFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTypeChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedType === tab.id
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
