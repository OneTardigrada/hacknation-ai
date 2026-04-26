// lib/geofence.ts
import { haversineDistance } from "./context-engine";
import type { MerchantConfig } from "@/config/city.config";

export interface MerchantWithDistance extends MerchantConfig {
  distanceMeters: number;
  inRadius: boolean;
}

/** Annotate every merchant with current distance to user + inRadius flag, sorted by distance. */
export function annotateMerchants(
  merchants: MerchantConfig[],
  userLat: number,
  userLon: number,
  radiusMeters: number
): MerchantWithDistance[] {
  return merchants
    .map((m) => {
      const distanceMeters = haversineDistance(userLat, userLon, m.lat, m.lon);
      return { ...m, distanceMeters, inRadius: distanceMeters <= radiusMeters };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/** Filter to only those within the geofence radius (single source of truth). */
export function filterInRadius(
  merchants: MerchantConfig[],
  userLat: number,
  userLon: number,
  radiusMeters: number
): MerchantWithDistance[] {
  return annotateMerchants(merchants, userLat, userLon, radiusMeters).filter(
    (m) => m.inRadius
  );
}

/**
 * Re-rank merchants based on weather fit:
 *  - Sunny: Gastgarten merchants and "sunny" affinity bubble to the top.
 *  - Cold/Rain: warm-drink/cold/rain affinity wins.
 * Stable secondary sort by distance (preserves the original order otherwise).
 */
export function prioritizeForWeather<T extends MerchantConfig & { distanceMeters?: number }>(
  merchants: T[],
  weather: { temp?: number; condition?: string }
): T[] {
  const c = (weather.condition ?? "").toLowerCase();
  const isSunny = c.includes("clear") || c.includes("sun");
  const isRain = c.includes("rain") || c.includes("drizzle");
  const isSnow = c.includes("snow");
  const isCold = (weather.temp ?? 99) <= 12;

  const score = (m: T) => {
    let s = 0;
    if (isSunny) {
      if (m.hasGuestGarden) s += 4;
      if ((m.weatherAffinity ?? []).includes("sunny")) s += 2;
    }
    if (isRain && (m.weatherAffinity ?? []).includes("rain")) s += 3;
    if (isSnow && (m.weatherAffinity ?? []).includes("snow")) s += 3;
    if (isCold && (m.weatherAffinity ?? []).includes("cold")) s += 2;
    return s;
  };

  return [...merchants].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0);
  });
}

export interface GeofenceZone {
  merchantId: string;
  merchantName: string;
  lat: number;
  lon: number;
  radiusMeters: number;
}

export interface GeofenceResult {
  inZone: boolean;
  merchantId: string | null;
  distanceMeters: number;
  zone: GeofenceZone | null;
}

export function checkGeofences(
  userLat: number,
  userLon: number,
  merchants: MerchantConfig[],
  radiusMeters: number = 150
): GeofenceResult {
  for (const m of merchants) {
    const dist = haversineDistance(userLat, userLon, m.lat, m.lon);
    if (dist <= radiusMeters) {
      return {
        inZone: true,
        merchantId: m.id,
        distanceMeters: Math.round(dist),
        zone: { merchantId: m.id, merchantName: m.name, lat: m.lat, lon: m.lon, radiusMeters },
      };
    }
  }
  // Find closest even if not in zone
  let closest: MerchantConfig | null = null;
  let closestDist = Infinity;
  for (const m of merchants) {
    const d = haversineDistance(userLat, userLon, m.lat, m.lon);
    if (d < closestDist) { closest = m; closestDist = d; }
  }
  return {
    inZone: false,
    merchantId: closest?.id ?? null,
    distanceMeters: Math.round(closestDist),
    zone: null,
  };
}
