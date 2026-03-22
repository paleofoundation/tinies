import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";

/** Ensures User.stripeCustomerId is set; used for recurring off-session charges. */
export async function getOrCreateStripeCustomerForUser(
  userId: string,
  email: string,
  name: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (user?.stripeCustomerId) return user.stripeCustomerId;
  const stripe = getStripeServer();
  const customer = await stripe.customers.create({
    email: email || undefined,
    name: name || undefined,
    metadata: { userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
