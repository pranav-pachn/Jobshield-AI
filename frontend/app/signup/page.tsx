"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, AlertCircle, Loader2 } from "lucide-react";
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string }>({});

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

    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters." });
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
      <div className="mb-6 text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Create an account
        </h1>
        <p className="text-slate-400 text-sm">
          Get started with JobShield in seconds
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div 
          role="alert" 
          aria-live="polite" 
          className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* Quick Google 1-Click Sign-up */}
      <Button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full h-11 bg-[#05080f] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <GoogleIcon className="w-4 h-4" />
        <span>Continue with Google</span>
      </Button>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800/80" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#090d16] text-slate-500">
            or continue with email
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-xs font-medium text-slate-300">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              className="pl-10 h-11 bg-[#05080f] border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/70 focus:ring-[#00ff88]/20 text-slate-100 placeholder-slate-500 rounded-xl text-sm"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-slate-300">
            Email
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 h-11 bg-[#05080f] border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/70 focus:ring-[#00ff88]/20 text-slate-100 placeholder-slate-500 rounded-xl text-sm"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <PasswordInput
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(value) => setFormData((prev) => ({ ...prev, password: value }))}
            error={fieldErrors.password}
            className="rounded-xl h-11 bg-[#05080f] border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/70"
            disabled={isLoading}
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Creating account...</span>
            </span>
          ) : (
            <span>Create Account</span>
          )}
        </Button>

        {/* Legal microcopy */}
        <p className="text-center text-[11px] text-slate-500 leading-relaxed pt-1">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#00ff88] hover:text-emerald-300 font-medium transition-colors ml-0.5"
        >
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
