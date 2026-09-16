"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn, setPassword as apiSetPassword } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell, GoogleIcon } from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" />
            Loading...
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const forceParam = searchParams.get("force");
  const nextPath = nextParam ? decodeURIComponent(nextParam) : "/dashboard";
  const forceLogin = forceParam === "true";

  useEffect(() => {
    if (!isLoading && isAuthenticated && !forceLogin) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router, forceLogin]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRequiresPasswordSetup(false);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter your email and password.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login(trimmedEmail, trimmedPassword);
      router.replace(nextPath);
    } catch (loginError) {
      const errorMessage = loginError instanceof Error ? loginError.message : "Authentication failed";

      if ((loginError as Error & { requiresPasswordSetup?: boolean }).requiresPasswordSetup) {
        const err = loginError as Error & { email?: string };
        setRequiresPasswordSetup(true);
        setError(errorMessage);
        if (err.email) {
          setEmail(err.email);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  const handleSetPassword = async () => {
    setError(null);
    setPasswordErrors({});

    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const errors: typeof passwordErrors = {};

    if (!trimmedNewPassword) {
      errors.newPassword = "Password is required.";
    } else if (trimmedNewPassword.length < 6) {
      errors.newPassword = "Must be at least 6 characters.";
    }

    if (!trimmedConfirmPassword) {
      errors.confirmPassword = "Confirmation is required.";
    } else if (trimmedNewPassword !== trimmedConfirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSettingPassword(true);

    try {
      await apiSetPassword(trimmedNewPassword);
      setIsSettingPassword(false);
      setRequiresPasswordSetup(false);
      await login(email.trim(), trimmedNewPassword);
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  const isFormValid = email.trim().length > 0 && password.trim().length >= 6;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05080f] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthShell mode="login">
      {/* Header */}
      <div className="mb-6 text-left space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight font-serif">
          Welcome back.
        </h2>
        <p className="text-slate-400 text-sm font-sans">
          Sign in to continue your investigation.
        </p>
      </div>

      {/* Error Alert */}
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

      {/* Password Setup Modal/Card (Google OAuth upgrade flow) */}
      {requiresPasswordSetup && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Set Account Password
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Set a password to enable direct email sign-in alongside Google.
          </p>

          <div className="space-y-2.5">
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={setNewPassword}
              disabled={isSettingPassword}
              error={passwordErrors.newPassword}
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={isSettingPassword}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <Button
            type="button"
            onClick={handleSetPassword}
            disabled={isSettingPassword}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs cursor-pointer"
          >
            {isSettingPassword ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Password & Continue"
            )}
          </Button>
        </div>
      )}

      {/* Credential Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="candidate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 bg-[#05080f] border border-slate-800 hover:border-slate-700 focus:border-[#00ff88]/80 focus:ring-1 focus:ring-[#00ff88]/30 text-slate-100 placeholder-slate-500 rounded-lg text-sm transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[11px] font-mono tracking-wider uppercase text-slate-300">
              Password
            </label>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setError("Password reset instructions will be sent to your email if an account exists.");
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-sans"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••••••"
            value={password}
            onChange={setPassword}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !isFormValid}
          className="w-full h-11 mt-1 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold rounded-lg transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-sans text-sm"
        >
          {isSubmitting || isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Signing in...</span>
            </span>
          ) : (
            <span>Sign In →</span>
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
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || isLoading}
        className="w-full h-11 bg-[#05080f] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <GoogleIcon className="w-4 h-4" />
        <span>Continue with Google</span>
      </Button>

      {/* Account Switcher & Trust Microcopy */}
      <div className="mt-6 pt-5 border-t border-slate-800/60 text-center space-y-2">
        <p className="text-xs text-slate-400 font-sans">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-[#00ff88] hover:text-emerald-300 font-medium transition-colors ml-0.5"
          >
            Sign up
          </Link>
        </p>
        <p className="text-[11px] text-slate-500 font-mono">
          Your investigations stay private.
        </p>
      </div>
    </AuthShell>
  );
}
