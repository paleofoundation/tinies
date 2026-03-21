/**
 * Pure booking price helpers. Used on client (display) and server (createBookingWithPaymentIntent).
 */

export function computeBookingTotalCents(
  basePriceEur: number,
  additionalPetPriceEur: number,
  petCount: number
): number {
  if (petCount < 1) return 0;
  const baseCents = Math.round(basePriceEur * 100);
  const additionalCents = Math.round(additionalPetPriceEur * 100);
  return baseCents + (petCount - 1) * additionalCents;
}

/**
 * Round-up to the next whole euro (charge amount).
 * - If total is already a whole euro (e.g. EUR 50.00), round-up is EUR 1.00 (100 cents).
 * - Otherwise round-up is 1–99 cents (next euro).
 */
export function computeRoundUpCents(totalCents: number): number {
  if (totalCents <= 0) return 0;
  const remainder = totalCents % 100;
  if (remainder === 0) return 100;
  return 100 - remainder;
}
