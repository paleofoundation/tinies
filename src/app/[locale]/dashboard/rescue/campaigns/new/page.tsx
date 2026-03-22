import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewCampaignForm } from "../NewCampaignForm";

export const dynamic = "force-dynamic";

export default async function NewRescueCampaignPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/rescue/campaigns/new");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <Link href="/dashboard/rescue/campaigns" className="text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
          ← All campaigns
        </Link>
        <h1 className="mt-6 font-normal text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
          New campaign
        </h1>
        <NewCampaignForm />
      </main>
    </div>
  );
}
