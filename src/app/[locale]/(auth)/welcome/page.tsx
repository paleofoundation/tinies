import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getWelcomePageState } from "@/lib/giving/signup-donation-actions";
import { WelcomeExperience } from "./WelcomeExperience";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ next?: string }> };

function WelcomeFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" style={{ backgroundColor: "var(--color-background)" }}>
      <p style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body), sans-serif" }}>Loading…</p>
    </div>
  );
}

async function WelcomeInner({ searchParams }: Props) {
  const sp = await searchParams;
  const state = await getWelcomePageState(sp.next ?? null);
  if (state.status === "redirect") {
    redirect(state.path);
  }
  return <WelcomeExperience charities={state.charities} nextPath={state.nextPath} />;
}

export default function WelcomePage(props: Props) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto" style={{ maxWidth: "var(--max-width)" }}>
        <Suspense fallback={<WelcomeFallback />}>
          <WelcomeInner {...props} />
        </Suspense>
      </main>
    </div>
  );
}
