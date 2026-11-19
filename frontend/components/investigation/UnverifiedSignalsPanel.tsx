"use client";

import { InvestigationTrace } from "@/lib/investigationTypes";
import { HelpCircle, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

interface UnverifiedSignalsPanelProps {
  trace: InvestigationTrace;
}

export function UnverifiedSignalsPanel({ trace }: UnverifiedSignalsPanelProps) {
  const input = trace.input || {};
  const evalData = trace.evaluation;

  // Determine unverified or missing elements
  const missingPoints: Array<{ title: string; detail: string; status: "unverified" | "missing" | "unsupported" }> = [];

  // 1. Recruiter Email
  if (!input.email) {
    missingPoints.push({
      title: "Recruiter Email Not Provided",
      detail: "No official recruiter email address was submitted for corporate domain cross-referencing.",
      status: "missing",
    });
  } else if (input.email.includes("@gmail.com") || input.email.includes("@yahoo.com") || input.email.includes("@hotmail.com")) {
    missingPoints.push({
      title: "Personal / Free Email Domain",
      detail: `Outreach originates from a consumer webmail provider (${input.email.split("@")[1]}), not a verifiable corporate domain.`,
      status: "unverified",
    });
  }

  // 2. Company Domain
  if (!input.companyDomain && !input.jobUrl) {
    missingPoints.push({
      title: "Official Company Domain Unverified",
      detail: "No corporate website or authoritative domain was provided to verify SSL and registration age.",
      status: "missing",
    });
  }

  // 3. Compensation Transparency
  if (!input.salary) {
    missingPoints.push({
      title: "Salary Transparency Unverified",
      detail: "Specific compensation details were not declared, preventing wage benchmarking against regional labor standards.",
      status: "missing",
    });
  }

  // 4. Physical Location / Identity
  if (!input.jobLocation) {
    missingPoints.push({
      title: "Physical Workplace / Entity Jurisdiction",
      detail: "No operating location or headquarters jurisdiction was supplied for corporate registration checks.",
      status: "missing",
    });
  }

  // 5. Check trace missing evidence count from evaluation
  const missingCount = evalData?.missing_evidence ?? missingPoints.length;

  return (
    <section aria-label="Unverified and Missing Information" className="space-y-4">
      <div>
        <h3 className="text-base font-serif text-slate-100 tracking-tight flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-400" />
          What Information Could Not Be Verified?
        </h3>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Crucial data points that were either omitted, unverified, or protected from automated verification.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800/80 bg-surface-elevated p-5 sm:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {missingPoints.length > 0 ? (
            missingPoints.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-slate-800/60 bg-black/25 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                    <span className="text-xs font-semibold text-slate-200 font-sans">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
                  Status: {item.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-lg border border-slate-800/60 bg-black/25 col-span-2 text-xs text-slate-400 font-sans">
              All baseline identification parameters (recruiter email, company domain, compensation, and location) were submitted for automated evaluation.
            </div>
          )}
        </div>

        {/* Essential Security Principle */}
        <div className="flex items-start gap-2.5 pt-3 border-t border-slate-800/60 text-xs font-sans text-slate-400 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">Security Principle:</strong> Absence of detected fraudulent signals is not proof of legitimacy. When key verification sources remain unavailable, independently verify employer identity before sharing personal identification or financial information.
          </p>
        </div>
      </div>
    </section>
  );
}
