"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/adopt", label: "Adopt" },
  { href: "/giving", label: "Giving" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
] as const;

function displayName(user: User): string {
  const meta = user.user_metadata;
  if (meta?.name && typeof meta.name === "string") return meta.name;
  if (meta?.full_name && typeof meta.full_name === "string") return meta.full_name;
  if (user.email) return user.email;
  return "Account";
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <Link
          href="/"
          className="transition-opacity hover:opacity-80"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
          }}
        >
          tinies.app
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hidden text-sm font-medium transition-colors sm:inline-block"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                color: "var(--color-text)",
              }}
            >
              {label}
            </Link>
          ))}
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <span
                  className="truncate text-sm max-w-[120px] sm:max-w-[180px]"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    color: "var(--color-text)",
                  }}
                >
                  {displayName(user)}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="h-12 rounded-[var(--radius-pill)] border-2 bg-transparent px-6 font-semibold transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "var(--text-base)",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-12 items-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "var(--text-base)",
                  backgroundColor: "var(--color-primary)",
                }}
              >
                Sign In
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
