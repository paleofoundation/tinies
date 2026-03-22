/**
 * Beta banner and feedback widget visibility.
 * Shown when NEXT_PUBLIC_BETA_MODE is true, or in production with NEXT_PUBLIC_APP_URL pointing at tinies.app.
 */
export function shouldShowBetaFeedbackUI(): boolean {
  if (process.env.NEXT_PUBLIC_BETA_MODE === "true") {
    return true;
  }
  if (process.env.NODE_ENV !== "production") {
    return false;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl.includes("tinies.app");
}
