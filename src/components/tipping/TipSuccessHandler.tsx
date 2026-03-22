"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Clears `tip=success` (and related) query params after Stripe redirect and shows a thank-you toast.
 */
export function TipSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("tip") !== "success") return;
    const amount = searchParams.get("amountEur");
    const pn = searchParams.get("providerName");
    if (amount && pn) {
      toast.success(`Thank you! ${pn} will receive €${amount}.`);
    } else {
      toast.success("Thank you! Your tip went through.");
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tip");
    next.delete("amountEur");
    next.delete("providerName");
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
    router.refresh();
  }, [searchParams, router, pathname]);

  return null;
}
