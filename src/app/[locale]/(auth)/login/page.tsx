"use client";

import { Suspense } from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard/owner";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Invalid email or password.");
      return;
    }
    toast.success("Welcome back!");
    router.push(`/welcome?next=${encodeURIComponent(next)}`);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setGoogleLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-[var(--radius-lg)] border p-8 sm:p-10" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <div className="text-center">
            <h1 className="font-normal tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}>
              Sign in
            </h1>
            <p className="mt-2 text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
              No matter the size.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-[var(--radius-lg)] border px-4 py-2.5 focus:outline-none focus:ring-2"
                style={{ fontFamily: "var(--font-body), sans-serif", backgroundColor: "var(--color-background)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[var(--radius-pill)] h-12 px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "var(--color-border)" }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] border-2 bg-white px-6 h-12 font-semibold transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", borderColor: "var(--color-primary)", color: "var(--color-text)" }}
            >
              {googleLoading ? (
                "Redirecting…"
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-sm" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
