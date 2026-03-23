"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn } from "@/lib/auth";

export const AuthPanel: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    router.push("/login");
  };

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="group">
          {/* Glow border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500" />

          {/* Card content */}
          <div className="relative px-8 py-12 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Sign in to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  JobShield AI
                </span>
              </h2>
              <p className="text-slate-400 text-sm">
                Secure your job search journey
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4 mb-6">
              {/* Email input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors duration-150"
                  required
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 text-white placeholder-slate-500 rounded-lg transition-colors duration-150"
                  required
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
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-150 mt-6 active:scale-95"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin" style={{ animationDuration: "0.6s" }}>✓</span>
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
              className="w-full h-11 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-blue-400/50 text-slate-200 font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 active:scale-95"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>

            {/* Sign up link */}
            <p className="text-center text-slate-400 text-sm mt-6">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Get started
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
