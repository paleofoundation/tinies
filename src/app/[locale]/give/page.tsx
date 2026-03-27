import { redirect } from "next/navigation";

/** Canonical donate URL is `/giving/donate` (see `next.config.ts` redirects). */
export default function GivePageRedirect() {
  redirect("/giving/donate");
}
