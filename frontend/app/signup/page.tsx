"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  User, 
  AlertCircle, 
  Loader2, 
  Check, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn, registerRequest } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell, GoogleIcon } from "@/components/auth/AuthShell";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    const errors: typeof fieldErrors = {};

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service to create your account.");
      return;
    }

    setIsLoading(true);

    try {
      await registerRequest({
        name: fullName,
        email,
        password,
      });

      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    googleSignIn();
  };

  return (
    <AuthShell mode="signup">
      {/* Header */}
      <div className="mb-6 text-left space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
          Start investigating.
        </h2>
        <p className="text-slate-400 text-sm font-sans">
          Create your JobShield account and investigate suspicious job postings with confidence.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div 
          role="alert" 
          aria-live="polite" 
          className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-[11px] font-mono tracking-wider uppercase text-slate-300">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              className="pl-10 h-11 bg-[#05080f] border border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/80 focus:ring-1 focus:ring-[#00ff88]/30 text-slate-100 placeholder-slate-500 rounded-lg text-sm transition-colors"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-[11px] font-mono tracking-wider uppercase text-slate-300">
            Email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="candidate@company.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 h-11 bg-[#05080f] border border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/80 focus:ring-1 focus:ring-[#00ff88]/30 text-slate-100 placeholder-slate-500 rounded-lg text-sm transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-300">
            Password
          </label>
          <PasswordInput
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(value) => setFormData((prev) => ({ ...prev, password: value }))}
            error={fieldErrors.password}
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono tracking-wider uppercase text-slate-300">
              Confirm Password
            </label>
            {passwordsMatch && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </span>
            )}
            {passwordsMismatch && (
              <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" /> Passwords do not match
              </span>
            )}
          </div>
          <PasswordInput
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData((prev) => ({ ...prev, confirmPassword: value }))}
            error={fieldErrors.confirmPassword}
            required
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-800 bg-[#05080f] accent-emerald-500 cursor-pointer"
            required
          />
          <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer font-sans">
            I agree to the Terms of Service and Privacy Policy.
          </label>
        </div>

        {/* Submit CTA */}
        <Button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          className="w-full h-11 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-sans text-sm mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Creating account...</span>
            </span>
          ) : (
            <span>Create Account →</span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/80" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#080c14] text-slate-500 font-sans">
            or
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full h-11 bg-[#05080f] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <GoogleIcon className="w-4 h-4" />
        <span>Continue with Google</span>
      </Button>

      {/* Footer / Switch to Login */}
      <div className="mt-6 pt-5 border-t border-slate-800/60 text-center space-y-2">
        <p className="text-xs text-slate-400 font-sans">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#00ff88] hover:text-emerald-300 font-medium transition-colors ml-0.5"
          >
            Sign in
          </Link>
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          Your investigations stay private.
        </p>
      </div>
    </AuthShell>
  );
}
