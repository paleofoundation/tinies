"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export async function createCampaignDonationCheckout(input: {
  orgSlug: string;
  campaignSlug: string;
  amountCents: number;
  donorDisplayName: string;
  donorMessage: string;
  anonymous: boolean;
}): Promise<{ checkoutUrl: string | null; error?: string }> {
  if (input.amountCents < 100) {
    return { checkoutUrl: null, error: "Minimum donation is €1." };
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      slug: { equals: input.campaignSlug.trim(), mode: "insensitive" },
      status: "active",
      rescueOrg: {
        slug: { equals: input.orgSlug.trim(), mode: "insensitive" },
        verified: true,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      rescueOrgId: true,
      rescueOrg: { select: { slug: true } },
    },
  });
  if (!campaign) {
    return { checkoutUrl: null, error: "This campaign is not available for donations." };
  }

  const charityRow = await prisma.charity.findFirst({
    where: {
      rescueOrgId: campaign.rescueOrgId,
      active: true,
      verified: true,
    },
    select: { id: true },
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orgSlug = campaign.rescueOrg.slug;
  const successUrl = `${APP_URL}/rescue/${encodeURIComponent(orgSlug)}/campaign/${encodeURIComponent(campaign.slug)}?thanks=1`;
  const cancelUrl = `${APP_URL}/rescue/${encodeURIComponent(orgSlug)}/campaign/${encodeURIComponent(campaign.slug)}`;

  const displayName = input.anonymous ? "" : truncate(input.donorDisplayName || "Supporter", 80);
  const message = truncate(input.donorMessage || "", 450);

  try {
    const stripe = getStripeServer();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user?.id ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Campaign: ${campaign.title}`,
              description: "Donation to a verified rescue campaign on Tinies",
            },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "campaign_donation",
        campaignId: campaign.id,
        userId: user?.id ?? "",
        charityId: charityRow?.id ?? "",
        amountCents: String(input.amountCents),
        anonymous: input.anonymous ? "1" : "0",
        donorDisplayName: displayName,
        donorMessage: message,
      },
    });
    const url = session.url;
    if (!url) return { checkoutUrl: null, error: "Checkout could not be started." };
    return { checkoutUrl: url };
  } catch (e) {
    console.error("createCampaignDonationCheckout", e);
    return {
      checkoutUrl: null,
      error: e instanceof Error ? e.message : "Failed to start checkout.",
    };
  }
}
