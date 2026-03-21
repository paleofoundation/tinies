import { redirect } from "next/navigation";
import { getCharityByInviteToken } from "@/lib/charity/actions";
import { createClient } from "@/lib/supabase/server";
import { CharityInviteAcceptClient } from "./CharityInviteAcceptClient";

type Props = { params: Promise<{ token: string }> };

export default async function CharityInvitePage({ params }: Props) {
  const { token } = await params;
  const charity = await getCharityByInviteToken(token);
  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
        <h1 className="font-normal" style={{ fontFamily: "var(--font-heading), serif", fontSize: "var(--text-xl)" }}>
          Invalid or expired invite
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          This link may have been used already or is no longer valid.
        </p>
        <a href="/" className="mt-6 text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
          Go to tinies.app
        </a>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { acceptCharityInvite } = await import("@/lib/charity/actions");
    const result = await acceptCharityInvite(token);
    if (result.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{result.error}</p>
          <a href="/" className="mt-6 text-sm font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
            Go to tinies.app
          </a>
        </div>
      );
    }
    redirect("/dashboard/charity");
  }

  return (
    <CharityInviteAcceptClient token={token} charityName={charity.name} />
  );
}
