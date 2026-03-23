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
    <Card className="glass-card shadow-2xl border-primary/20 bg-background/50 overflow-hidden">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
        <CardTitle className="text-xl flex items-center gap-2 text-foreground font-mono">
          <Search className="h-5 w-5 text-primary" />
          Recruiter Verification
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Enter recruiter details to verify their identity and trustworthiness
        </p>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 bg-card/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name + Company */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Recruiter Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recruiter Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="TCS, Google, etc."
                  className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* Email Address — full width */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address <span className="text-primary/80">(strongest signal)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Row 3: Website + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Website URL <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phone Number <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
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
            className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing Recruiter...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Verify Recruiter
              </>
            )}
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
