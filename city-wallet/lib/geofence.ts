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
