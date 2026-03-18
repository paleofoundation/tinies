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

/** Round up to nearest euro; return round-up amount in cents. */
export function computeRoundUpCents(totalCents: number): number {
  const totalEur = totalCents / 100;
  const roundedEur = Math.ceil(totalEur);
  return Math.round(roundedEur * 100) - totalCents;
}
