"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, Chrome, Shield, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerRequest } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";

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
  const [showDualAuth, setShowDualAuth] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field errors when user starts typing
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
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
    // Redirect to backend Google OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    router.push("/");
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col items-center justify-center px-6 py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back button - moved outside card group */}
        <button
          type="button"
          onClick={handleBackClick}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 cursor-pointer group relative z-50"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
          <span className="text-sm font-medium">Back to Landing Page</span>
        </button>

        <div className="group">
          {/* Glow border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />

          {/* Card content */}
          <div className="relative px-8 py-12 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Join
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  JobShield AI
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Protect your job search today
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4 mb-6">
              {/* Full Name input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors"
                  required
                />
              </div>

              {/* Email input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors"
                  required
                />
              </div>

              {/* Password input */}
              <PasswordInput
                placeholder="Create password"
                value={formData.password}
                onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                error={fieldErrors.password}
              />

              {/* Confirm Password input */}
              <PasswordInput
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                error={fieldErrors.confirmPassword}
              />

            {/* Dual Authentication Option */}
            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                <Shield className="w-4 h-4" />
                Enhanced Security Option
              </div>
              <p className="text-slate-400 text-xs mb-3">
                Set up both email and Google authentication for maximum security
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDualAuth(!showDualAuth)}
                className="w-full h-8 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs"
              >
                {showDualAuth ? "Hide" : "Show"} Dual Authentication Setup
              </Button>
            </div>

            {/* Dual Auth Setup */}
            {showDualAuth && (
              <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Quick Setup Guide
                  </div>
                  <div className="space-y-2 text-xs text-slate-400">
                    <p>1. Create your account with email & password above</p>
                    <p>2. After signing up, go to Account Settings</p>
                    <p>3. Click &quot;Connect Google&quot; to enable dual authentication</p>
                  </div>
                  <div className="text-xs text-purple-400 text-center">
                    ✨ You&apos;ll be able to use both login methods!
                  </div>
                </div>
              </div>
            )}

              {/* Terms checkbox */}
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-slate-400 hover:text-slate-300 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </a>
                </label>
              </div>

              {/* Sign up button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-300 mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-950 text-slate-400">Or</span>
              </div>
            </div>

            {/* Google sign up button */}
            <Button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-11 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-blue-400/50 text-slate-200 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Chrome className="w-5 h-5" />
              Sign up with Google
            </Button>

            {/* Sign in link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
