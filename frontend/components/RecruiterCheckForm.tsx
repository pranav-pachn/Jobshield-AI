"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecruiterCheckFormProps {
  onSubmit: (email: string, domain: string) => Promise<void>;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function RecruiterCheckForm({ onSubmit, isLoading = false, onSuccess }: RecruiterCheckFormProps) {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setDomain("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedDomain = domain.trim();

    if (!trimmedEmail && !trimmedDomain) {
      setError("Please provide either an email address or domain to check");
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (trimmedDomain && !isValidDomain(trimmedDomain)) {
      setError("Please enter a valid domain (e.g., example.com)");
      return;
    }

    try {
      await onSubmit(trimmedEmail, trimmedDomain);
      // Only reset after successful submission
      resetForm();
      onSuccess?.();
    } catch (err) {
      // Error is handled by parent component
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
      </CardHeader>
      <CardContent className="space-y-6 pt-6 bg-card/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recruiter Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@example.com"
                className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Domain Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Domain to Check (Optional)
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="pl-9 rounded-lg border-white/10 bg-black/40 text-foreground placeholder-gray-600 focus:border-primary/50 focus:ring-primary/30"
              />
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
            className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Checking Recruiter...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Check Recruiter
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

function isValidDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase().trim();
  
  // Allow localhost, IP addresses, and standard domains
  const validPatterns = [
    /^localhost$/,                                    // localhost
    /^(\d{1,3}\.){3}\d{1,3}$/,                       // IPv4 address
    /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/  // Standard domain with TLD
  ];
  
  return validPatterns.some(pattern => pattern.test(lowerDomain));
}
