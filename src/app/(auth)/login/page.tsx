"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginPage() {
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
    router.push(next);
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
    <div className="min-h-screen bg-[#F7F7F8] text-[#1B2432]">
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-20 sm:px-6">
        <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-normal tracking-tight text-[#1B2432] sm:text-3xl" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
              Sign in
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
              No matter the size.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-[14px] border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[#1B2432] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0A6E5C]/40"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[999px] h-12 bg-[#0A6E5C] px-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>Or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[999px] border-2 border-[#0A6E5C] bg-white px-4 h-12 font-semibold text-[#1B2432] transition-opacity hover:opacity-90 disabled:opacity-70"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
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

          <p className="mt-8 text-center text-sm text-[#6B7280]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[#0A6E5C] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
