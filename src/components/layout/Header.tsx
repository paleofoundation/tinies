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
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-16 max-w-[1170px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl text-[#1B2432] transition-opacity hover:opacity-80"
          style={{ fontFamily: "var(--tiny-font-display), serif" }}
        >
          tinies.app
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[#1B2432] transition-opacity hover:opacity-70 hidden sm:inline-block"
              style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
            >
              {label}
            </Link>
          ))}
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#1B2432] truncate max-w-[120px] sm:max-w-[180px]" style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}>
                  {displayName(user)}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-[999px] border-2 border-[#0A6E5C] bg-transparent px-4 py-2 h-10 text-sm font-semibold text-[#0A6E5C] transition-opacity hover:opacity-90"
                  style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-[999px] bg-[#0A6E5C] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 h-12 flex items-center"
                style={{ fontFamily: "var(--tiny-font-body), sans-serif" }}
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
