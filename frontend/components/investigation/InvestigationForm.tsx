"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { InvestigationInput } from "@/lib/investigationTypes";

interface InvestigationFormProps {
  onInvestigate: (input: InvestigationInput) => void;
  isInvestigating: boolean;
}

export function InvestigationForm({ onInvestigate, isInvestigating }: InvestigationFormProps) {
  const [jobText, setJobText] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobText.trim()) return;

    onInvestigate({
      jobText,
      recruiterName: recruiterName.trim() || undefined,
      email: email.trim() || undefined,
      company: company.trim() || undefined,
    });
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-surface-elevated p-6 sm:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
            Job Posting or Message Text <span className="text-red-400">*</span>
          </label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            disabled={isInvestigating}
            className="min-h-[220px] w-full resize-y rounded-lg border border-slate-800 bg-black/40 px-4 py-3.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all leading-relaxed"
            placeholder="Paste the job posting description, recruiter outreach message, or employment offer details here..."
            required
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 font-sans"
          >
            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showAdvanced ? "Hide recruiter and company context" : "+ Add recruiter or company context (optional)"}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-lg bg-black/20 border border-slate-800/60 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 font-sans block">
                Recruiter Name
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                disabled={isInvestigating}
                placeholder="e.g. John Doe"
                className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 font-sans block">
                Recruiter Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isInvestigating}
                placeholder="e.g. hr@company.com"
                className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-sans"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 font-sans block">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isInvestigating}
                placeholder="e.g. Acme Corp"
                className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-sans"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isInvestigating || !jobText.trim()}
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {isInvestigating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Investigating Opportunity...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Investigate Job →</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
