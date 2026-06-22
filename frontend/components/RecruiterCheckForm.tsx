"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Globe, Search, User, Building2, Phone } from "lucide-react";

interface RecruiterCheckFormProps {
  onSubmit: (data: {
    recruiterName: string;
    company: string;
    email: string;
    website: string;
    phone: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function RecruiterCheckForm({ onSubmit, isLoading = false }: RecruiterCheckFormProps) {
  const [recruiterName, setRecruiterName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setRecruiterName("");
    setCompany("");
    setEmail("");
    setWebsite("");
    setPhone("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();

    if (!trimmedEmail && !trimmedCompany) {
      setError("Please provide at least an email address or company name");
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (website.trim() && !isValidUrl(website.trim())) {
      setError("Please enter a valid website URL (e.g., https://example.com)");
      return;
    }

    try {
      await onSubmit({
        recruiterName: recruiterName.trim(),
        company: trimmedCompany,
        email: trimmedEmail,
        website: website.trim(),
        phone: phone.trim(),
      });
      resetForm();
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  return (
    <Card className="glass-card-accent shadow-2xl border-blue-500/20 overflow-hidden relative group">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 via-cyan-500 to-transparent" />
      <CardHeader className="border-b border-slate-800 pb-4 pt-6 bg-gradient-to-br from-[#0b1220] to-[#0b1220]/50">
        <CardTitle className="text-lg flex items-center gap-3 text-slate-100 font-mono">
          <Search className="h-5 w-5 text-blue-400" />
          Identity Verification
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Enter recruiter details to run deep-scan intelligence checks
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 bg-transparent">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name + Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Recruiter Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Target Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-9 h-11 rounded-xl border border-slate-800 bg-black/50 text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Target Organization
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="TechCorp, Google, etc."
                  className="pl-9 h-11 rounded-xl border border-slate-800 bg-black/50 text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Email Address — full width */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Email Address <span className="text-red-400/80">(critical signal)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="pl-9 h-11 rounded-xl border border-slate-800 bg-black/50 text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Row 3: Website + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Website URL <span className="text-slate-600">(optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="pl-9 h-11 rounded-xl border border-slate-800 bg-black/50 text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Phone Number <span className="text-slate-600">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0123"
                  className="pl-9 h-11 rounded-xl border border-slate-800 bg-black/50 text-slate-300 placeholder-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="relative w-full overflow-hidden group bg-[#00ff88] hover:bg-[#00cc6a] text-black hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] rounded-lg px-8 font-bold tracking-wide transition-all disabled:opacity-50 disabled:shadow-none h-12"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Scanning Identity...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Begin Identity Scan</span>
                </>
              )}
            </div>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Also accept bare domains
    return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(url);
  }
}
