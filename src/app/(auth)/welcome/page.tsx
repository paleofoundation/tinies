import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedCharityForSignup } from "@/lib/giving/actions";
import { WelcomeDonationForm } from "./WelcomeDonationForm";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/welcome");

  const featuredCharity = await getFeaturedCharityForSignup();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <h1
          className="text-center font-normal tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-2xl)", color: "var(--color-text)" }}
        >
          Welcome to Tinies
        </h1>
        <p className="mt-2 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No matter the size. Start by supporting animal rescue — or skip to your dashboard.
        </p>

        <div className="mt-10 rounded-[var(--radius-lg)] border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}>
          {featuredCharity ? (
            <>
              <div className="flex items-start gap-4">
                {featuredCharity.logoUrl && (
                  <img
                    src={featuredCharity.logoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-[var(--radius-lg)] object-cover"
                  />
                )}
                <div>
                  <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>{featuredCharity.name}</h2>
                  {featuredCharity.mission && (
                    <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>{featuredCharity.mission}</p>
                  )}
                </div>
              </div>
              <WelcomeDonationForm charityId={featuredCharity.id} />
            </>
          ) : (
            <>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Support the Tinies Giving Fund. Your donation goes to animal rescue in Cyprus.
              </p>
              <WelcomeDonationForm charityId={null} />
            </>
          )}
        </div>

        <p className="mt-6 text-center">
          <a
            href="/dashboard/owner"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            Skip for now →
          </a>
        </p>
      </main>
    </div>
  );
}
