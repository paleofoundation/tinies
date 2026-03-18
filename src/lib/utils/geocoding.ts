/**
 * Geocoding via Google Geocoding API.
 * Used when owners search by address/location.
 */

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export type GeocodeResult = {
  lat: number;
  lng: number;
};

/**
 * Convert an address string to lat/lng using Google Geocoding API.
 * Returns { lat, lng } or null if not found or API key missing.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key?.trim()) {
    console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set; geocoding disabled.");
    return null;
  }
  const trimmed = address?.trim();
  if (!trimmed) return null;

  try {
    const params = new URLSearchParams({
      address: trimmed,
      key,
    });
    const res = await fetch(`${GEOCODE_URL}?${params}`);
    const data = (await res.json()) as {
      status: string;
      results?: Array<{
        geometry?: { location?: { lat: number; lng: number } };
      }>;
    };
    if (data.status !== "OK" || !data.results?.length) return null;
    const loc = data.results[0]?.geometry?.location;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number")
      return null;
    return { lat: loc.lat, lng: loc.lng };
  } catch (e) {
    console.error("geocodeAddress failed:", e);
    return null;
  }
}
