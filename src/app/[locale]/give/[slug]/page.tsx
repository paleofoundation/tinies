import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Per-charity quick links use `/giving/[slug]` (full charity profile + donate). */
export default async function GiveCharitySlugRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/giving/${slug}`);
}
