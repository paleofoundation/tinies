/**
 * General utilities used across the app.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Format amount in cents to EUR display string (e.g. "€12.50" or "EUR 12.50").
 */
export function formatPrice(cents: number, options?: { useSymbol?: boolean }): string {
  const { useSymbol = true } = options ?? {};
  const value = (cents / 100).toFixed(2);
  return useSymbol ? `€${value}` : `EUR ${value}`;
}

/**
 * Format a Date for display in Europe/Nicosia context.
 * Uses Intl for locale-aware date/time formatting.
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { locale = "en-GB", ...opts } = options ?? {};
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...opts,
  }).format(d);
}

/**
 * Slugify a string for URLs: lowercase, replace spaces/special chars with hyphens.
 * For uniqueness, callers can append a short random suffix.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Merge Tailwind classes with clsx + tailwind-merge.
 * Use for conditional and overridable component classNames.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
