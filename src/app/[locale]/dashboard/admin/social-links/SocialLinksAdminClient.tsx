"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateSiteSocialUrls, type SiteSocialFormInput } from "@/lib/site-settings/actions";

type Props = {
  initial: SiteSocialFormInput;
};

const fields: { key: keyof SiteSocialFormInput; label: string; placeholder: string }[] = [
  { key: "socialLinkedInUrl", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/…" },
  { key: "socialFacebookUrl", label: "Facebook", placeholder: "https://www.facebook.com/…" },
  { key: "socialXUrl", label: "X (Twitter)", placeholder: "https://x.com/…" },
  { key: "socialInstagramUrl", label: "Instagram", placeholder: "https://www.instagram.com/…" },
];

export function SocialLinksAdminClient({ initial }: Props) {
  const [values, setValues] = useState<SiteSocialFormInput>(initial);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SiteSocialFormInput, string>>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setPending(true);
    const res = await updateSiteSocialUrls(values);
    setPending(false);
    if (!res.ok) {
      if (res.fieldErrors) {
        const next: Partial<Record<keyof SiteSocialFormInput, string>> = {};
        for (const k of Object.keys(res.fieldErrors) as (keyof SiteSocialFormInput)[]) {
          const msgs = res.fieldErrors[k];
          if (msgs?.[0]) next[k] = msgs[0];
        }
        setFieldErrors(next);
      }
      toast.error(res.error);
      return;
    }
    toast.success("Social links saved. Footer icons will link once URLs are set.");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-[var(--max-width)] space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body), sans-serif", color: "var(--color-text-secondary)" }}>
        These URLs power the social icons in the site footer. Leave a field empty to show the icon as inactive until you are ready.
      </p>
      <div className="space-y-5">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label htmlFor={key} className="mb-1.5 block text-sm font-semibold" style={{ fontFamily: "var(--font-body), sans-serif" }}>
              {label}
            </label>
            <input
              id={key}
              type="url"
              name={key}
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              placeholder={placeholder}
              autoComplete="off"
              className="w-full rounded-[var(--radius-lg)] border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                borderColor: fieldErrors[key] ? "var(--color-error, #DC2626)" : "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
            {fieldErrors[key] ? (
              <p className="mt-1 text-sm" style={{ color: "var(--color-error, #DC2626)", fontFamily: "var(--font-body), sans-serif" }}>
                {fieldErrors[key]}
              </p>
            ) : null}
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center rounded-[var(--radius-pill)] px-8 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        style={{ fontFamily: "var(--font-body), sans-serif", fontSize: "var(--text-base)", backgroundColor: "var(--color-primary)" }}
      >
        {pending ? "Saving…" : "Save social links"}
      </button>
    </form>
  );
}
