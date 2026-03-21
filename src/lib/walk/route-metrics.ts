/** GPS route helpers for walk tracking (shared by API, UI, and server actions). */

export type WalkRoutePoint = { lat: number; lng: number; timestamp: number };

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function totalRouteDistanceKm(route: WalkRoutePoint[]): number {
  let km = 0;
  for (let i = 1; i < route.length; i++) {
    km += haversineKm(route[i - 1].lat, route[i - 1].lng, route[i].lat, route[i].lng);
  }
  return Math.round(km * 1000) / 1000;
}

export function elapsedMinutesSince(startedAt: Date | null): number {
  if (!startedAt) return 0;
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / (60 * 1000));
}
