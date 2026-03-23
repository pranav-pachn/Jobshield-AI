"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Chrome, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { googleSignIn } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
      const errorMessage = loginError instanceof Error ? loginError.message : "Login failed";
      
      // Check if this is a password setup requirement
      if ((loginError as Error & { requiresPasswordSetup?: boolean }).requiresPasswordSetup) {
        const error = loginError as Error & { email?: string };
        setRequiresPasswordSetup(true);
        setError(errorMessage);
        // Optionally pre-fill the email for password setup
        if (error.email) {
          setEmail(error.email);
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
      errors.newPassword = "Please enter a new password.";
    } else if (trimmedNewPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters.";
    }

    if (!trimmedConfirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (trimmedNewPassword !== trimmedConfirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSettingPassword(true);

    try {
      await setPassword(trimmedNewPassword);
      // Success! Now try to login with the new password
      setIsSettingPassword(false);
      setRequiresPasswordSetup(false);
      await login(email.trim(), trimmedNewPassword);
      router.replace(nextPath);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    router.push("/");
  };

  // Determine if form is valid for submission
  const isFormValid = email.trim().length > 0 && password.trim().length >= 6;

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

            {/* Password Setup Section */}
            {requiresPasswordSetup && (
              <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Set up password for email login
                  </div>
                  
                  <div className="space-y-3">
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
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm"
                  >
                    {isSettingPassword ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚡</span>
                        Setting password...
                      </span>
                    ) : (
                      "Set Password & Login"
                    )}
                  </Button>
                  
                  <div className="text-xs text-slate-400 text-center">
                    After setting a password, you can use either Google Sign-In or email login
                  </div>
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
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                disabled={isSubmitting}
                required
              />

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
                disabled={isSubmitting || isLoading || !isFormValid}
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
              Don&apos;t have an account?{" "}
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
