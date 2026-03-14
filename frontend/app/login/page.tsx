"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Chrome, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { googleSignIn } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading, login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");
  const nextPath = nextParam ? decodeURIComponent(nextParam) : "/dashboard";

  const tokenParam = searchParams.get("token");
  const userParam = searchParams.get("user");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [isAuthenticated, isLoading, nextPath, router]);

  useEffect(() => {
    if (tokenParam && userParam) {
      try {
        loginWithGoogle(tokenParam, userParam);
        router.replace(nextPath);
      } catch (error) {
        setError("Google sign-in failed");
      }
    }
  }, [tokenParam, userParam, loginWithGoogle, router, nextPath]);

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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/70 bg-card/80 backdrop-blur">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-cyan-500 to-primary" />
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Secure Access
          </div>
          <CardTitle className="text-2xl">Sign in to JobShield AI</CardTitle>
          <CardDescription>
            Continue to your scam intelligence dashboard and analysis tools.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="analyst@jobshield.ai"
                className="h-11 border-border/60 bg-black/20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-muted-foreground">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="h-11 border-border/60 bg-black/20"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Button type="submit" className="h-11 w-full rounded-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="h-11 w-full rounded-full border-border/60 bg-black/20"
              onClick={() => googleSignIn()}
              disabled={isSubmitting || isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Need an account? Use the backend register endpoint, then return here.
          </p>
          <div className="mt-3 text-center text-xs text-muted-foreground/80">
            <Link href="/" className="hover:text-foreground">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
