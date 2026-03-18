import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCharitiesForGuardian } from "@/lib/giving/actions";
import { GuardianCheckoutForm } from "./GuardianCheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a Tinies Guardian | Monthly Giving",
  description: "Give monthly to animal rescue. Choose your tier (€3–€10/month), pick a charity or the Giving Fund, and get a Guardian badge.",
};

export default async function BecomeAGuardianPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/giving/become-a-guardian");

  let charities: Awaited<ReturnType<typeof getCharitiesForGuardian>>;
  try {
    charities = await getCharitiesForGuardian();
  } catch (e) {
    console.error("getCharitiesForGuardian", e);
    charities = [];
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/giving"
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to Giving
        </Link>
        <h1
          className="mt-4 font-normal tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Become a Tinies Guardian
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Give monthly to animal rescue. Choose your tier, pick a charity or the general fund, and complete payment.
        </p>

        <div className="mt-10 rounded-[var(--radius-lg)] border p-6 sm:p-8" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          <GuardianCheckoutForm charities={charities} />
        </div>
      </main>
    </div>
  );
}
