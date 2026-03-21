"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@prisma/client";
import { Menu, X } from "lucide-react";
import { getUnreadMessageCount } from "@/app/dashboard/messages/actions";
import { getLinkedCharity } from "@/lib/charity/actions";
import { getHeaderNavMeta } from "@/lib/header-actions";
import { dashboardHrefForUser } from "@/lib/utils/dashboard-nav";

function displayName(user: User): string {
  const meta = user.user_metadata;
  if (meta?.name && typeof meta.name === "string") return meta.name;
  if (meta?.full_name && typeof meta.full_name === "string") return meta.full_name;
  if (user.email) return user.email;
  return "Account";
}

function initialsForUser(user: User): string {
  const name = displayName(user);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[parts.length - 1][0];
    return `${a}${b}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return "?";
}

function avatarUrlForUser(user: User, dbAvatarUrl: string | null): string | null {
  if (dbAvatarUrl) return dbAvatarUrl;
  const meta = user.user_metadata;
  if (meta?.avatar_url && typeof meta.avatar_url === "string") return meta.avatar_url;
  if (meta?.picture && typeof meta.picture === "string") return meta.picture;
  return null;
}

const CENTER_NAV = [
  { href: "/services", label: "Find Care" },
  { href: "/for-providers", label: "Become a Provider" },
  { href: "/adopt", label: "Adopt" },
  { href: "/blog", label: "Blog" },
] as const;

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [linkedCharity, setLinkedCharity] = useState<{ slug: string; name: string } | null>(null);
  const [hasProviderProfile, setHasProviderProfile] = useState(false);
  const [dbRole, setDbRole] = useState<UserRole | null>(null);
  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null);
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
      setDbRole(null);
      setDbAvatarUrl(null);
      return;
    }
    getLinkedCharity().then((c) => setLinkedCharity(c));
    getHeaderNavMeta().then((m) => {
      setHasProviderProfile(m.hasProviderProfile);
      setDbRole(m.dbRole);
      setDbAvatarUrl(m.avatarUrl);
    });
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
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    user != null
      ? dashboardHrefForUser(dbRole, user.user_metadata?.role, hasProviderProfile)
      : "/dashboard/owner";

  const resolvedAvatarUrl = user ? avatarUrlForUser(user, dbAvatarUrl) : null;
  const showAvatarImage = Boolean(
    resolvedAvatarUrl && (resolvedAvatarUrl.startsWith("http") || resolvedAvatarUrl.startsWith("/"))
  );

  const linkClass = "text-sm font-medium transition-colors hover:opacity-80";
  const linkStyle = { fontFamily: "var(--font-body), sans-serif", color: "var(--color-text)" };

  const menuItemClass =
    "block w-full px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[var(--color-background)]";

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-80"
          style={{
            fontFamily: "var(--font-heading), serif",
            fontSize: "var(--text-xl)",
            color: "var(--color-text)",
          }}
        >
          tinies.app
        </Link>

        {/* Center nav — desktop & tablet (md+) */}
        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex" aria-label="Main">
          {CENTER_NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass} style={linkStyle}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Right — desktop & tablet */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                style={{ backgroundColor: "var(--color-primary)" }}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                {showAvatarImage && resolvedAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- OAuth / storage URLs; avoids remotePatterns drift
                  <img
                    src={resolvedAvatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden>{initialsForUser(user)}</span>
                )}
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 min-w-[220px] rounded-[var(--radius-lg)] border py-1 shadow-lg"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                  role="menu"
                >
                  <Link
                    href={dashboardHref}
                    className={menuItemClass}
                    style={linkStyle}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/messages"
                    className={`${menuItemClass} flex items-center justify-between gap-2`}
                    style={linkStyle}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span
                        className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className={menuItemClass}
                    style={linkStyle}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="my-1 border-t" style={{ borderColor: "var(--color-border)" }} role="separator" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={menuItemClass}
                    style={linkStyle}
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <>
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
          ) : null}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex items-center md:hidden">
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex flex-col md:hidden"
          style={{ top: "4rem", backgroundColor: "var(--color-background)" }}
        >
          <nav className="flex flex-1 flex-col gap-0 overflow-auto px-6 py-6" aria-label="Mobile">
            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {CENTER_NAV.map(({ href, label }) => (
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
                  className="flex items-center justify-between py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="py-4 text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <div className="my-2 border-t" style={{ borderColor: "var(--color-border)" }} />
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void handleSignOut();
                  }}
                  className="py-4 text-left text-lg font-medium transition-opacity hover:opacity-80"
                  style={linkStyle}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                {CENTER_NAV.map(({ href, label }) => (
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
