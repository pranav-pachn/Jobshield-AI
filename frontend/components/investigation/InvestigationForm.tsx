"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Scan, ChevronDown, ChevronUp } from "lucide-react";
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
    <Card className="glass-card-accent shadow-2xl border-blue-500/20 overflow-hidden relative group">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 via-cyan-500 to-transparent" />
      <CardHeader className="border-b border-slate-800 pb-4 pt-6 bg-gradient-to-br from-[#0b1220] to-[#0b1220]/50">
        <CardTitle className="text-lg flex items-center gap-3 text-slate-100 font-mono">
          <Scan className="h-5 w-5 text-blue-400" />
          Deep Investigation Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Suspicious Job Payload (Required)
            </label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              disabled={isInvestigating}
              className="min-h-[200px] w-full resize-y rounded-xl border border-slate-800 bg-black/50 px-5 py-4 text-sm font-mono text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
              placeholder="Paste the job description, suspicious email, or recruiter message here..."
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold tracking-wide"
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Hide Context" : "Add Recruiter Context (Optional)"}
            </button>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Recruiter Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-md border border-slate-800 bg-black/50 px-3 py-2 text-sm text-slate-300 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Recruiter Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. hr@company.com"
                  className="w-full rounded-md border border-slate-800 bg-black/50 px-3 py-2 text-sm text-slate-300 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. Tech Corp"
                  className="w-full rounded-md border border-slate-800 bg-black/50 px-3 py-2 text-sm text-slate-300 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isInvestigating || !jobText.trim()}
              size="lg"
              className="relative w-full overflow-hidden group bg-[#00ff88] hover:bg-[#00cc6a] text-black hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] rounded-lg px-8 font-bold tracking-wide transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
              <div className="relative flex items-center justify-center gap-2">
                {isInvestigating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Investigating...</span>
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    <span>Run Deep Investigation</span>
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
