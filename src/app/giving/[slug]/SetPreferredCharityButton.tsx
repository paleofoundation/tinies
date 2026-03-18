"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { setPreferredCharity } from "@/lib/giving/actions";

type Props = { charityId: string; slug: string };

export function SetPreferredCharityButton({ charityId, slug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  async function handleSetPreferred() {
    setLoading(true);
    const result = await setPreferredCharity(charityId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setChecked(true);
    toast.success("Preferred charity updated.");
    router.refresh();
  }

  if (isLoggedIn === false) {
    return (
      <div className="mt-4">
        <Link
          href={`/login?next=/giving/${slug}`}
          className="inline-flex h-10 items-center rounded-[var(--radius-lg)] border-2 px-4 text-sm font-semibold hover:opacity-90"
          style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
        >
          Sign in to set preferred charity
        </Link>
      </div>
    );
  }

  if (isLoggedIn === null) {
    return <div className="mt-4 text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading…</div>;
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleSetPreferred}
        disabled={loading || checked}
        className="inline-flex h-10 items-center rounded-[var(--radius-lg)] border-2 px-4 text-sm font-semibold hover:opacity-90 disabled:opacity-70"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
      >
        {loading ? "Saving…" : checked ? "Saved as preferred" : "Set as my preferred charity"}
      </button>
    </div>
  );
}
