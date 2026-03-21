"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleProviderFavorite } from "@/lib/providers/favorite-actions";
import type { FavoriteViewerKind } from "@/lib/providers/favorite-actions-types";

type Props = {
  providerUserId: string;
  initialFavorited: boolean;
  viewerKind: FavoriteViewerKind;
  /** Path for `next` after login. If omitted, current pathname + search is used. */
  loginReturnPath?: string;
  /** Visually larger on profile hero */
  size?: "default" | "lg";
};

export function ProviderFavoriteButton({
  providerUserId,
  initialFavorited,
  viewerKind,
  loginReturnPath: loginReturnPathProp,
  size = "default",
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginReturnPath =
    loginReturnPathProp ??
    (typeof pathname === "string"
      ? `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      : "/services/search");

  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const iconClass = size === "lg" ? "h-7 w-7" : "h-6 w-6";
  const pad = size === "lg" ? "p-2.5" : "p-2";

  if (viewerKind === "authenticated_non_owner") {
    return null;
  }

  if (viewerKind === "guest") {
    const href = `/login?next=${encodeURIComponent(loginReturnPath)}`;
    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center rounded-full border transition-colors hover:bg-[var(--color-primary-50)] ${pad}`}
        style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
        aria-label="Sign in to save this provider to favorites"
        title="Save to favorites"
      >
        <Heart className={iconClass} strokeWidth={2} aria-hidden />
      </Link>
    );
  }

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    setBusy(true);
    const res = await toggleProviderFavorite(providerUserId);
    setBusy(false);
    if (res.error) {
      setFavorited(!next);
      toast.error(res.error);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => void handleClick(e)}
      disabled={busy}
      className={`inline-flex items-center justify-center rounded-full border transition-colors hover:bg-[var(--color-primary-50)] disabled:opacity-60 ${pad}`}
      style={{
        borderColor: favorited ? "var(--color-primary)" : "var(--color-border)",
        color: "var(--color-primary)",
        backgroundColor: favorited ? "rgba(10, 128, 128, 0.12)" : "transparent",
      }}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      title={favorited ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart
        className={iconClass}
        strokeWidth={2}
        aria-hidden
        style={
          favorited
            ? { fill: "var(--color-primary)", color: "var(--color-primary)" }
            : { fill: "none" }
        }
      />
    </button>
  );
}
