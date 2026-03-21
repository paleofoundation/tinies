"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleRescueOrgVerification } from "../rescue-org-actions";

type Props = {
  orgId: string;
  verified: boolean;
};

export function RescueOrgVerifyButton({ orgId, verified }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const result = await toggleRescueOrgVerification(orgId);
    setPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.verified ? "Organisation verified." : "Verification removed.");
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="font-semibold hover:underline disabled:opacity-50"
      style={{ color: "var(--color-primary)", fontFamily: "var(--font-body), sans-serif" }}
    >
      {pending ? "…" : verified ? "Unverify" : "Verify"}
    </button>
  );
}
