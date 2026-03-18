"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";
import { getUnreadMessageCount } from "@/app/dashboard/messages/actions";
import { getLinkedCharity } from "@/lib/charity/actions";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [linkedCharity, setLinkedCharity] = useState<{ slug: string; name: string } | null>(null);

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

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLinkedCharity(null);
      return;
    }
    getLinkedCharity().then((c) => setLinkedCharity(c));
    getUnreadMessageCount().then(({ count }) => setUnreadCount(count));
    const interval = setInterval(() => {
      getUnreadMessageCount().then(({ count }) => setUnreadCount(count));
    }, 15_000);
    return () => clearInterval(interval);
  }, [user]);

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
                {linkedCharity && (
                  <Link
                    href="/dashboard/charity"
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Charity Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard/messages"
                  className="relative flex items-center rounded-[var(--radius-lg)] p-1.5 transition-opacity hover:opacity-80"
                  style={{ color: "var(--color-text)" }}
                  aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : "Messages"}
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
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
