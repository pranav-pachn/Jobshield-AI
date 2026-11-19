"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Globe,
  FileText,
  MessageSquare,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  DollarSign,
  Shield,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2,
  UserCheck,
} from "lucide-react";
import { InvestigationInput, ExtractedJobData } from "@/lib/investigationTypes";
import { extractJobFromUrl } from "@/lib/investigateApi";
import { ExtractedJobConfirmation } from "./ExtractedJobConfirmation";

interface InvestigationFormProps {
  onInvestigate: (input: InvestigationInput) => void;
  isInvestigating: boolean;
}

type InputMethod = "url" | "description" | "message" | "company" | "recruiter";

export function InvestigationForm({ onInvestigate, isInvestigating }: InvestigationFormProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>("url");

  // Input states
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [recruiterMessage, setRecruiterMessage] = useState("");
  const [messageChannel, setMessageChannel] = useState<string>("Email");

  // Company Verification states
  const [verifyCompanyName, setVerifyCompanyName] = useState("");
  const [verifyCompanyWebsite, setVerifyCompanyWebsite] = useState("");
  const [verifyJobUrl, setVerifyJobUrl] = useState("");
  const [verifyCompanyNotes, setVerifyCompanyNotes] = useState("");

  // Recruiter Verification states
  const [verifyRecruiterName, setVerifyRecruiterName] = useState("");
  const [verifyRecruiterEmail, setVerifyRecruiterEmail] = useState("");
  const [verifyRecruiterPhone, setVerifyRecruiterPhone] = useState("");
  const [verifyRecruiterCompany, setVerifyRecruiterCompany] = useState("");
  const [verifyRecruiterMessage, setVerifyRecruiterMessage] = useState("");

  // Optional fields for standard modes
  const [showOptional, setShowOptional] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("");

  // URL extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedJobData | null>(null);
  const [isUrlBlockedFallback, setIsUrlBlockedFallback] = useState(false);

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Helper to extract clean domain from website string
  const cleanDomain = (urlOrDomain: string) => {
    try {
      const u = urlOrDomain.startsWith("http") ? urlOrDomain : `https://${urlOrDomain}`;
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return urlOrDomain.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  };

  // Sample data loaders
  const loadSampleJob = () => {
    setInputMethod("description");
    setJobText(
      "Data Entry Assistant (Remote - Immediate Start)\n\n" +
      "Company: Global Logistics Partners Inc.\n" +
      "Compensation: $45.00/hour (Weekly wire transfer / Bitcoin)\n" +
      "Hours: 15-20 hours/week, flexible schedule\n\n" +
      "Responsibilities:\n" +
      "- Process invoices and customer purchase orders using proprietary online software.\n" +
      "- Transfer funds between regional logistics accounts for expedited customs clearing.\n\n" +
      "Requirements:\n" +
      "- No prior experience necessary. Paid online training provided.\n" +
      "- Must have personal checking account or crypto wallet for equipment reimbursement purchase ($350 refundable deposit).\n" +
      "- Contact our HR manager exclusively via Telegram: @GlobalLogistics_HR_Desk"
    );
    setJobTitle("Data Entry Assistant (Remote)");
    setCompany("Global Logistics Partners Inc.");
    setSalary("$45.00/hour");
    setJobLocation("Remote, US");
    setSourcePlatform("Telegram / Online Ad");
    setShowOptional(true);
  };

  const loadSampleRecruiterMessage = () => {
    setInputMethod("message");
    setMessageChannel("WhatsApp");
    setRecruiterMessage(
      "Hello! I am Sarah Jenkins, Senior Talent Acquisition Lead at Amazon Web Services. " +
      "We reviewed your resume online and are pleased to invite you for an immediate remote Project Coordinator role ($85/hour). " +
      "No technical interview required. To secure your onboarding slot and receive your company MacBook and home office check, " +
      "please message our executive hiring director directly on Telegram @Amazon_DirectHR with referral code #AMZ-7719."
    );
    setEmail("sarah.jenkins-amazonrecruitment@gmail.com");
    setPhone("+1 (555) 234-8910");
    setRecruiterName("Sarah Jenkins");
    setCompany("Amazon Web Services");
    setShowOptional(true);
  };

  const loadSampleCompanyVerification = () => {
    setInputMethod("company");
    setVerifyCompanyName("Apex Global Consulting");
    setVerifyCompanyWebsite("https://apex-global-careers.biz");
    setVerifyJobUrl("https://apex-global-careers.biz/jobs/executive-assistant");
    setVerifyCompanyNotes("Received unsolicited job offer for Executive Assistant with $5,000 sign-on bonus. Website was created 2 weeks ago and asks for banking info.");
  };

  const loadSampleRecruiterVerification = () => {
    setInputMethod("recruiter");
    setVerifyRecruiterName("David Miller");
    setVerifyRecruiterEmail("david.miller.careers@gmail.com");
    setVerifyRecruiterPhone("+1 (202) 555-0143");
    setVerifyRecruiterCompany("Microsoft Cloud Systems");
    setVerifyRecruiterMessage("Inviting candidate to interview via Skype/Telegram for Cloud Solution Specialist. Asking for $200 security deposit for training software.");
  };

  // URL extraction handler
  const handleExtractUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = jobUrl.trim();
    if (!trimmedUrl) return;

    if (!isValidUrl(trimmedUrl)) {
      setExtractionError("Please enter a valid web URL starting with https:// or http://");
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setIsUrlBlockedFallback(false);

    try {
      const result = await extractJobFromUrl(trimmedUrl);

      if (result.success && result.extracted) {
        setExtractedData(result.extracted);
        if (result.extracted.jobTitle) setJobTitle(result.extracted.jobTitle);
        if (result.extracted.company) setCompany(result.extracted.company);
        if (result.extracted.companyDomain) setCompanyDomain(result.extracted.companyDomain);
        if (result.extracted.location) setJobLocation(result.extracted.location);
        if (result.extracted.salary) setSalary(result.extracted.salary);
        if (result.extracted.employmentType) setEmploymentType(result.extracted.employmentType);
        if (result.extracted.recruiterEmail) setEmail(result.extracted.recruiterEmail);
        if (result.extracted.recruiterPhone) setPhone(result.extracted.recruiterPhone);
        if (result.extracted.sourcePlatform) setSourcePlatform(result.extracted.sourcePlatform);
      } else {
        setExtractionError(
          result.error ||
            "We couldn't automatically retrieve this job posting. Paste the job description or recruiter message below to continue."
        );
        setIsUrlBlockedFallback(true);
      }
    } catch (err: any) {
      setExtractionError(
        "We couldn't automatically retrieve this job posting. Paste the job description or recruiter message below to continue."
      );
      setIsUrlBlockedFallback(true);
    } finally {
      setIsExtracting(false);
    }
  };

  // Switch to manual paste fallback with URL preserved
  const handleSwitchToManualFallback = () => {
    setInputMethod("description");
    setExtractionError(null);
    setIsUrlBlockedFallback(false);
    setShowOptional(true);
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMethod === "url") {
      handleExtractUrl(e);
      return;
    }

    if (inputMethod === "company") {
      const trimmedCompany = verifyCompanyName.trim();
      const trimmedWebsite = verifyCompanyWebsite.trim();
      if (!trimmedCompany && !trimmedWebsite) return;

      const domain = cleanDomain(trimmedWebsite);
      const compositeJobText = [
        `Company Verification Investigation Request:`,
        `Company Name: ${trimmedCompany || "Unspecified"}`,
        `Official Website: ${trimmedWebsite || "Unspecified"}`,
        domain ? `Domain: ${domain}` : null,
        verifyJobUrl.trim() ? `Associated Job Posting: ${verifyJobUrl.trim()}` : null,
        verifyCompanyNotes.trim() ? `Inquiry Context: ${verifyCompanyNotes.trim()}` : null,
        `\nEvaluating corporate legitimacy, domain registration age, SSL infrastructure, brand impersonation risks, and known fraud patterns.`,
      ].filter(Boolean).join("\n");

      onInvestigate({
        jobText: compositeJobText,
        inputType: "company",
        company: trimmedCompany || undefined,
        companyDomain: domain || undefined,
        jobUrl: verifyJobUrl.trim() || trimmedWebsite || undefined,
      });
      return;
    }

    if (inputMethod === "recruiter") {
      const trimmedName = verifyRecruiterName.trim();
      const trimmedEmail = verifyRecruiterEmail.trim();
      const trimmedPhone = verifyRecruiterPhone.trim();
      const trimmedCompany = verifyRecruiterCompany.trim();
      if (!trimmedEmail && !trimmedName && !trimmedCompany) return;

      const emailDomain = trimmedEmail.includes("@") ? trimmedEmail.split("@")[1] : undefined;
      const compositeJobText = [
        `Recruiter Identity Verification Investigation Request:`,
        `Recruiter Name: ${trimmedName || "Unspecified"}`,
        `Contact Email: ${trimmedEmail || "Unspecified"}`,
        trimmedPhone ? `Phone / WhatsApp: ${trimmedPhone}` : null,
        trimmedCompany ? `Claimed Company Affiliation: ${trimmedCompany}` : null,
        verifyRecruiterMessage.trim() ? `Outreach Message / Context: ${verifyRecruiterMessage.trim()}` : null,
        `\nEvaluating recruiter legitimacy, email domain affiliation, disposable email cues, and identity impersonation signals.`,
      ].filter(Boolean).join("\n");

      onInvestigate({
        jobText: compositeJobText,
        inputType: "recruiter",
        recruiterName: trimmedName || undefined,
        email: trimmedEmail || undefined,
        emailDomain: emailDomain,
        phone: trimmedPhone || undefined,
        company: trimmedCompany || undefined,
      });
      return;
    }

    // Standard description or message
    const activeText = inputMethod === "message" ? recruiterMessage.trim() : jobText.trim();
    if (!activeText) return;

    onInvestigate({
      jobText: activeText,
      inputType: inputMethod,
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
      companyDomain: companyDomain.trim() || undefined,
      jobLocation: jobLocation.trim() || undefined,
      salary: salary.trim() || undefined,
      employmentType: employmentType.trim() || undefined,
      recruiterName: recruiterName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      sourcePlatform: sourcePlatform.trim() || (inputMethod === "message" ? messageChannel : undefined),
    });
  };

  // If URL extraction was successful, show Confirmation Step
  if (extractedData) {
    return (
      <ExtractedJobConfirmation
        extractedData={extractedData}
        onConfirm={(confirmedInput) => {
          onInvestigate(confirmedInput);
        }}
        onCancel={() => {
          setExtractedData(null);
        }}
        isInvestigating={isInvestigating}
      />
    );
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-surface-elevated p-6 sm:p-8 shadow-sm space-y-6">
      {/* 1. Mode Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
            Select Investigation Method
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">Need an example?</span>
            <button
              type="button"
              onClick={() => {
                if (inputMethod === "url" || inputMethod === "description") loadSampleJob();
                else if (inputMethod === "message") loadSampleRecruiterMessage();
                else if (inputMethod === "company") loadSampleCompanyVerification();
                else if (inputMethod === "recruiter") loadSampleRecruiterVerification();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-sans text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Try Sample</span>
            </button>
          </div>
        </div>

        {/* 5-Mode Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-black/40 border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setInputMethod("url");
              setExtractionError(null);
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer ${
              inputMethod === "url"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Job URL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMethod("description");
              setExtractionError(null);
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer ${
              inputMethod === "description"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Description</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMethod("message");
              setExtractionError(null);
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer ${
              inputMethod === "message"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMethod("company");
              setExtractionError(null);
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer ${
              inputMethod === "company"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Company</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputMethod("recruiter");
              setExtractionError(null);
            }}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-sans transition-all cursor-pointer ${
              inputMethod === "recruiter"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Recruiter</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Input Forms */}
      {/* Mode A: Job Posting URL */}
      {inputMethod === "url" && (
        <form onSubmit={handleExtractUrl} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
              Job Posting URL <span className="text-red-400">*</span>
            </label>
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => {
                    setJobUrl(e.target.value);
                    if (extractionError) setExtractionError(null);
                  }}
                  disabled={isExtracting || isInvestigating}
                  placeholder="https://www.linkedin.com/jobs/view/... or any public job link"
                  className="w-full rounded-lg border border-slate-800 bg-black/50 px-4 py-3 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isExtracting || isInvestigating || !jobUrl.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-medium px-5 py-3 rounded-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Retrieving Posting...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Retrieve & Review →</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Compatible with LinkedIn, Indeed, Naukri, Internshala, Glassdoor, Greenhouse, Lever, and corporate careers sites.
            </p>
          </div>

          {/* URL Extraction Error / Fallback Banner */}
          {extractionError && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs font-sans text-slate-300">
              <div className="flex items-start gap-2 text-amber-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{extractionError}</span>
              </div>
              {isUrlBlockedFallback && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchToManualFallback}
                    className="text-xs border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-300 flex items-center gap-1.5"
                  >
                    <span>Paste Job Description Manually</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </form>
      )}

      {/* Mode B: Paste Job Description */}
      {inputMethod === "description" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                Job Description Text <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {jobText.length} characters
              </span>
            </div>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              disabled={isInvestigating}
              rows={9}
              className="w-full resize-y rounded-lg border border-slate-800 bg-black/40 px-4 py-3.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30 leading-relaxed"
              placeholder="Paste the job description here. Include salary, company details, responsibilities, requirements, or anything else mentioned in the posting."
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isInvestigating || !jobText.trim()}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Investigate Opportunity →</span>
            </Button>
          </div>
        </form>
      )}

      {/* Mode C: Recruiter Message / Email */}
      {inputMethod === "message" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
              Communication Channel
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["Email", "WhatsApp", "Telegram", "LinkedIn InMail", "SMS", "Job Portal"].map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setMessageChannel(channel)}
                  className={`px-3 py-1.5 rounded-md text-xs font-sans transition-colors cursor-pointer ${
                    messageChannel === channel
                      ? "bg-slate-800 text-blue-400 border border-blue-500/40 font-medium"
                      : "bg-black/30 text-slate-400 border border-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                Recruiter Outreach Message <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {recruiterMessage.length} characters
              </span>
            </div>
            <textarea
              value={recruiterMessage}
              onChange={(e) => setRecruiterMessage(e.target.value)}
              disabled={isInvestigating}
              rows={9}
              className="w-full resize-y rounded-lg border border-slate-800 bg-black/40 px-4 py-3.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none focus:ring-1 focus:ring-blue-500/30 leading-relaxed"
              placeholder="Paste the message you received from the recruiter. Include payment requests, links, contact information, or anything that seems suspicious."
              required
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isInvestigating || !recruiterMessage.trim()}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Investigate Recruiter Message →</span>
            </Button>
          </div>
        </form>
      )}

      {/* Mode D: Company Verification */}
      {inputMethod === "company" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={verifyCompanyName}
                  onChange={(e) => setVerifyCompanyName(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. Acme Global Logistics"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Official Website / Domain <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={verifyCompanyWebsite}
                  onChange={(e) => setVerifyCompanyWebsite(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. https://acme-logistics.com or acme.org"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                Job Posting URL (Optional)
              </label>
              <input
                type="url"
                value={verifyJobUrl}
                onChange={(e) => setVerifyJobUrl(e.target.value)}
                disabled={isInvestigating}
                placeholder="e.g. https://acme-logistics.com/careers/data-analyst or job board URL"
                className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                Context / Specific Concerns (Optional)
              </label>
              <textarea
                value={verifyCompanyNotes}
                onChange={(e) => setVerifyCompanyNotes(e.target.value)}
                disabled={isInvestigating}
                rows={3}
                placeholder="Mention how you found this company, whether an offer was made, or why you suspect the entity."
                className="w-full resize-y rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none leading-relaxed"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-sans">
              JobShield cross-references corporate registry records, domain WHOIS age, TLS encryption, brand typosquatting, and historical fraud campaigns.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isInvestigating || (!verifyCompanyName.trim() && !verifyCompanyWebsite.trim())}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="h-4 w-4" />
              <span>Verify Company Identity →</span>
            </Button>
          </div>
        </form>
      )}

      {/* Mode E: Recruiter Verification */}
      {inputMethod === "recruiter" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Recruiter Name
                </label>
                <input
                  type="text"
                  value={verifyRecruiterName}
                  onChange={(e) => setVerifyRecruiterName(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Recruiter Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={verifyRecruiterEmail}
                  onChange={(e) => setVerifyRecruiterEmail(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. sarah.jenkins@company-recruitment.com"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Phone Number / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={verifyRecruiterPhone}
                  onChange={(e) => setVerifyRecruiterPhone(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. +1 555-0199 or WhatsApp ID"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                  Claimed Company Affiliation (Optional)
                </label>
                <input
                  type="text"
                  value={verifyRecruiterCompany}
                  onChange={(e) => setVerifyRecruiterCompany(e.target.value)}
                  disabled={isInvestigating}
                  placeholder="e.g. Amazon, Google, Microsoft"
                  className="w-full rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-sans block">
                Outreach Message / Context (Optional)
              </label>
              <textarea
                value={verifyRecruiterMessage}
                onChange={(e) => setVerifyRecruiterMessage(e.target.value)}
                disabled={isInvestigating}
                rows={3}
                placeholder="Include details of their initial contact, job offer, or requests for interview apps/telegram."
                className="w-full resize-y rounded-lg border border-slate-800 bg-black/40 px-4 py-2.5 text-sm font-sans text-slate-200 placeholder-slate-500 focus:border-blue-500/80 focus:outline-none leading-relaxed"
              />
            </div>

            <p className="text-[11px] text-slate-500 font-sans">
              JobShield evaluates whether the recruiter uses free/disposable mail providers, impersonates verified staff, or appears in known scam phone registries.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isInvestigating || (!verifyRecruiterEmail.trim() && !verifyRecruiterName.trim() && !verifyRecruiterCompany.trim())}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Verify Recruiter Identity →</span>
            </Button>
          </div>
        </form>
      )}

      {/* 3. Expandable Optional Metadata Accordion (For URL, Description, and Message modes) */}
      {(inputMethod === "url" || inputMethod === "description" || inputMethod === "message") && (
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 font-sans cursor-pointer"
          >
            {showOptional ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{showOptional ? "Hide additional details" : "+ Add more details (optional)"}</span>
          </button>

          {showOptional && (
            <div className="mt-4 p-5 rounded-lg bg-black/30 border border-slate-800/70 space-y-5 animate-in fade-in duration-200">
              {/* Company Section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>Company Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Company Domain</label>
                    <input
                      type="text"
                      value={companyDomain}
                      onChange={(e) => setCompanyDomain(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. acme.com"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. Senior Data Analyst"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Recruiter Section */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Recruiter & Contact Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Recruiter Name</label>
                    <input
                      type="text"
                      value={recruiterName}
                      onChange={(e) => setRecruiterName(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. Jane Doe"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Recruiter Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. jane@acme.com"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Recruiter Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. +1 555-0199"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Compensation & Location */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>Job Offer Parameters</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Location / Work Type</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. Remote / New York"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Compensation</label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. $80,000 / year"
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-sans block">Original Job URL</label>
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      disabled={isInvestigating}
                      placeholder="e.g. https://linkedin.com/jobs/view/..."
                      className="w-full rounded border border-slate-800 bg-black/50 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Privacy & Trust Note */}
      <div className="flex items-start gap-2.5 text-xs text-slate-500 font-sans border-t border-slate-800/60 pt-4">
        <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          JobShield protects candidate confidentiality. Submitted texts and URLs are analyzed securely and never shared with employers or recruiters. Automated risk scores are security indicators, not legal guarantees.
        </p>
      </div>
    </div>
  );
}
