"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { MessageCircle, Menu, X, ChevronDown } from "lucide-react";
import { getUnreadMessageCount } from "@/app/dashboard/messages/actions";
import { getLinkedCharity } from "@/lib/charity/actions";
import { getHeaderNavMeta } from "@/lib/header-actions";

function displayName(user: User): string {
  const meta = user.user_metadata;
  if (meta?.name && typeof meta.name === "string") return meta.name;
  if (meta?.full_name && typeof meta.full_name === "string") return meta.full_name;
  if (user.email) return user.email;
  return "Account";
}

const NAV_LOGGED_OUT = [
  { href: "/services", label: "Find Care" },
  { href: "/for-providers", label: "Become a Provider" },
  { href: "/adopt", label: "Adopt" },
] as const;

const NAV_LOGGED_IN = [
  { href: "/services", label: "Services" },
  { href: "/adopt", label: "Adopt" },
  { href: "/giving", label: "Giving" },
] as const;

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [linkedCharity, setLinkedCharity] = useState<{ slug: string; name: string } | null>(null);
  const [hasProviderProfile, setHasProviderProfile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      setHasProviderProfile(false);
      return;
    }
    getLinkedCharity().then((c) => setLinkedCharity(c));
    getHeaderNavMeta().then((m) => setHasProviderProfile(m.hasProviderProfile));
    getUnreadMessageCount().then(({ count }) => setUnreadCount(count));
    const interval = setInterval(() => {
      getUnreadMessageCount().then(({ count }) => setUnreadCount(count));
    }, 15_000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [userMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref = hasProviderProfile ? "/dashboard/provider" : "/dashboard/owner";

  const linkClass = "text-sm font-medium transition-colors hover:opacity-80";
  const linkStyle = { fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" };

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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {!loading &&
            (user ? (
              <>
                {NAV_LOGGED_IN.map(({ href, label }) => (
                  <Link key={href} href={href} className={linkClass} style={linkStyle}>
                    {label}
                  </Link>
                ))}
                {linkedCharity && (
                  <Link
                    href="/dashboard/charity"
                    className={linkClass}
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
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-1.5 rounded-[var(--radius-lg)] py-2 pl-2 pr-1 transition-opacity hover:opacity-80"
                    style={linkStyle}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="max-w-[140px] truncate">{displayName(user)}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </button>
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 min-w-[200px] rounded-[var(--radius-lg)] border py-2 shadow-lg"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      <Link
                        href={dashboardHref}
                        className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
                        style={linkStyle}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/owner"
                        className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
                        style={linkStyle}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Pets
                      </Link>
                      <Link
                        href="/dashboard/owner/giving"
                        className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
                        style={linkStyle}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Giving Settings
                      </Link>
                      {!hasProviderProfile && (
                        <Link
                          href="/for-providers"
                          className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
                          style={linkStyle}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Become a Provider
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-[var(--color-background)]"
                        style={linkStyle}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {NAV_LOGGED_OUT.map(({ href, label }) => (
                  <Link key={href} href={href} className={linkClass} style={linkStyle}>
                    {label}
                  </Link>
                ))}
                <Link
                  href="/signup"
                  className="rounded-[var(--radius-pill)] border-2 bg-transparent px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                  }}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="flex h-10 items-center rounded-[var(--radius-pill)] px-6 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "var(--text-sm)",
                    backgroundColor: "var(--color-primary)",
                  }}
                >
                  Sign In
                </Link>
              </>
            ))}
        </nav>

        {/* Mobile: hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {!loading && user && (
            <Link
              href="/dashboard/messages"
              className="relative flex items-center rounded-[var(--radius-lg)] p-2 transition-opacity hover:opacity-80"
              style={{ color: "var(--color-text)" }}
              aria-label={unreadCount > 0 ? `${unreadCount} unread messages` : "Messages"}
            >
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <span
                  className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] transition-opacity hover:opacity-80"
            style={{ color: "var(--color-text)" }}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {mobileMenuOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 z-40 flex flex-col bg-[var(--color-surface)] lg:hidden"
          style={{ top: "4rem" }}
        >
          <nav className="flex flex-1 flex-col gap-1 overflow-auto px-6 py-8" aria-label="Mobile">
            {user ? (
              <>
                {NAV_LOGGED_IN.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                    style={linkStyle}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                {linkedCharity && (
                  <Link
                    href="/dashboard/charity"
                    className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Charity Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard/messages"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages {unreadCount > 0 ? `(${unreadCount})` : ""}
                </Link>
                <div className="my-2 border-t" style={{ borderColor: "var(--color-border)" }} />
                <Link
                  href={dashboardHref}
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <Link
                  href="/dashboard/owner"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Pets
                </Link>
                <Link
                  href="/dashboard/owner/giving"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giving Settings
                </Link>
                {!hasProviderProfile && (
                  <Link
                    href="/for-providers"
                    className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                    style={linkStyle}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Provider
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className="py-4 text-left text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {NAV_LOGGED_OUT.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                    style={linkStyle}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="my-2 border-t" style={{ borderColor: "var(--color-border)" }} />
                <Link
                  href="/signup"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
