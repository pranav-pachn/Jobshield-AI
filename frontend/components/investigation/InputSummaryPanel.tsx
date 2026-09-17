"use client";

import { useState } from "react";
import { InvestigationInput } from "@/lib/investigationTypes";
import { User, Mail, Building, LinkIcon, Phone, Briefcase, ChevronDown, ChevronUp } from "lucide-react";

interface InputSummaryPanelProps {
  input?: InvestigationInput;
}

export function InputSummaryPanel({ input }: InputSummaryPanelProps) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  if (!input) return null;

  return (
    <div className="bg-surface-elevated border border-slate-800/50 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-800/50 px-6 py-4 bg-surface-elevated/30 flex items-center justify-between">
        <h3 className="font-serif text-lg text-slate-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          Job Details
        </h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {input.recruiterName && (
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Recruiter Name</div>
              <div className="text-sm text-slate-200 mt-0.5">{input.recruiterName}</div>
            </div>
          </div>
        )}
        {input.email && (
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email</div>
              <div className="text-sm text-slate-200 mt-0.5">{input.email}</div>
            </div>
          </div>
        )}
        {input.company && (
          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Company</div>
              <div className="text-sm text-slate-200 mt-0.5">{input.company}</div>
            </div>
          </div>
        )}
        {input.phone && (
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone</div>
              <div className="text-sm text-slate-200 mt-0.5">{input.phone}</div>
            </div>
          </div>
        )}
        {input.jobUrl && (
          <div className="flex items-start gap-3">
            <LinkIcon className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Job URL</div>
              <a href={input.jobUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all mt-0.5 block">
                {input.jobUrl}
              </a>
            </div>
          </div>
        )}
        {input.linkedinUrl && (
          <div className="flex items-start gap-3">
            <LinkIcon className="w-4 h-4 text-slate-400 mt-1" />
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">LinkedIn URL</div>
              <a href={input.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all mt-0.5 block">
                {input.linkedinUrl}
              </a>
            </div>
          </div>
        )}
        {input.jobText && (
          <div className="col-span-1 md:col-span-2 mt-2">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Job Description</div>
            <div className="bg-surface/50 p-4 rounded-lg border border-slate-800/50">
              <div className={`text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
                {input.jobText}
              </div>
              {input.jobText.length > 200 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-sans flex items-center gap-1 transition-colors"
                >
                  {isDescExpanded ? "Show less" : "Read full description"}
                  {isDescExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
