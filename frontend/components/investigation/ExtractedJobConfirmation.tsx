"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExtractedJobData, InvestigationInput } from "@/lib/investigationTypes";
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  User,
  Mail,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ExtractedJobConfirmationProps {
  extractedData: ExtractedJobData;
  onConfirm: (input: InvestigationInput) => void;
  onCancel: () => void;
  isInvestigating: boolean;
}

export function ExtractedJobConfirmation({
  extractedData,
  onConfirm,
  onCancel,
  isInvestigating,
}: ExtractedJobConfirmationProps) {
  const [jobTitle, setJobTitle] = useState(extractedData.jobTitle || "");
  const [company, setCompany] = useState(extractedData.company || "");
  const [location, setLocation] = useState(extractedData.location || "");
  const [salary, setSalary] = useState(extractedData.salary || "");
  const [employmentType, setEmploymentType] = useState(extractedData.employmentType || "");
  const [description, setDescription] = useState(extractedData.description || "");
  const [recruiterName, setRecruiterName] = useState(extractedData.recruiterName || "");
  const [recruiterEmail, setRecruiterEmail] = useState(extractedData.recruiterEmail || "");
  const [recruiterPhone, setRecruiterPhone] = useState(extractedData.recruiterPhone || "");

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onConfirm({
      jobText: description.trim(),
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      companyDomain: extractedData.companyDomain || undefined,
      jobLocation: location.trim() || undefined,
      salary: salary.trim() || undefined,
      employmentType: employmentType.trim() || undefined,
      recruiterName: recruiterName.trim() || undefined,
      email: recruiterEmail.trim() || undefined,
      phone: recruiterPhone.trim() || undefined,
      jobUrl: extractedData.originalUrl,
      sourcePlatform: extractedData.sourcePlatform || "Web",
      inputType: "url",
    });
  };

  return (
    <div className="rounded-xl border border-slate-800/80 bg-surface-elevated p-6 sm:p-8 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Job Details Retrieved Successfully</span>
            {extractedData.sourcePlatform && (
              <span className="ml-2 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono">
                {extractedData.sourcePlatform}
              </span>
            )}
          </div>
          <h2 className="text-xl font-serif text-slate-100 tracking-tight">
            Review Extracted Information
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Review the retrieved job details. You can adjust any field before beginning the investigation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5"
          >
            <Edit3 className="w-3 h-3 text-slate-400" />
            <span>{isEditing ? "Preview Summary" : "Edit Details"}</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source URL Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-slate-800/60 text-xs text-slate-400">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            Original Source URL:
          </span>
          <a
            href={extractedData.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-mono truncate max-w-[280px] sm:max-w-md text-right hover:underline"
          >
            {extractedData.originalUrl}
          </a>
        </div>

        {/* Structured Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Job Title */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              Job Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job Title"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-slate-100 truncate">
                {jobTitle || <span className="text-slate-500 italic">Not detected</span>}
              </div>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              Company Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Name"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-slate-100 truncate">
                {company || <span className="text-slate-500 italic">Not detected</span>}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country or Remote"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm font-medium text-slate-200 truncate">
                {location || <span className="text-slate-500 italic">Not detected</span>}
              </div>
            )}
          </div>

          {/* Salary / Compensation */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Compensation
            </label>
            {isEditing ? (
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $50,000 - $70,000 / yr"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm text-slate-200 truncate">
                {salary || <span className="text-slate-500 italic">Not stated in posting</span>}
              </div>
            )}
          </div>

          {/* Recruiter Email */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              Recruiter / Contact Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm text-slate-200 truncate">
                {recruiterEmail || <span className="text-slate-500 italic">None found in posting</span>}
              </div>
            )}
          </div>

          {/* Recruiter Name */}
          <div className="space-y-1.5 p-3 rounded-lg bg-black/20 border border-slate-800/50">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Recruiter Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded border border-slate-800 bg-black/60 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/80 focus:outline-none"
              />
            ) : (
              <div className="text-sm text-slate-200 truncate">
                {recruiterName || <span className="text-slate-500 italic">None found in posting</span>}
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Extracted Job Description <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {description.length} characters
            </span>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isInvestigating}
            rows={8}
            className="w-full resize-y rounded-lg border border-slate-800 bg-black/50 px-4 py-3 text-xs font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30 leading-relaxed"
            placeholder="Job description content..."
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isInvestigating}
            className="w-full sm:w-auto text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel / Choose Different Input</span>
          </Button>

          <Button
            type="submit"
            disabled={isInvestigating || !description.trim()}
            size="lg"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Proceed to Investigation</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
