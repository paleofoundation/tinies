/** True if a donation arrived after the org last opened the Donations tab. */
export function rescueDonationsTabHasNew(
  lastSeen: Date | null | undefined,
  latestDonationAt: Date | null | undefined
): boolean {
  if (!latestDonationAt) return false;
  if (!lastSeen) return true;
  return latestDonationAt.getTime() > lastSeen.getTime();
}
