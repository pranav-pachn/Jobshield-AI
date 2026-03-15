"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Chrome, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn, loginRequest } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const nextPath = nextParam ? decodeURIComponent(nextParam) : "/dashboard";

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace(nextPath);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  if (isLoading) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-blue-400 mb-3">⚡</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col items-center justify-center px-6 py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <div className="group">
          {/* Glow border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />

          {/* Card content */}
          <div className="relative px-8 py-12 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  to JobShield AI
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Secure your job search journey
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {/* Email input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Sign in button */}
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-300 mt-6"
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
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

            {/* Google sign in button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isLoading}
              className="w-full h-11 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-blue-400/50 text-slate-200 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>

            {/* Sign up link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Get started
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
