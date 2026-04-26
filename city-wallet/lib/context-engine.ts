// lib/context-engine.ts
import type { MerchantConfig } from "@/config/city.config";

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  icon: string;
}

export interface TransactionDensity {
  merchantId: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  label: string;
}

export interface LocationContext {
  nearbyMerchants: { merchant: MerchantConfig; distanceMeters: number }[];
  inZone: boolean;
  zoneMerchantId: string | null;
}

export interface TimePeriod {
  hour: number;
  period: "morning" | "lunch" | "afternoon" | "evening" | "night";
  label: string;
}

export interface ContextState {
  weather: WeatherData;
  transactionDensity: TransactionDensity[];
  location: LocationContext;
  time: TimePeriod;
  triggerScore: number;
  persona: string;
  seasonalTag: string | null;
}

export function computeTriggerScore(ctx: Partial<ContextState>): number {
  let score = 0;
  if (ctx.weather?.temp !== undefined && ctx.weather.temp < 14) score += 0.25;
  if (ctx.weather?.condition === "rain" || ctx.weather?.condition === "drizzle") score += 0.2;
  if (ctx.transactionDensity?.[0]?.level === "LOW") score += 0.3;
  if (ctx.time?.period === "lunch") score += 0.15;
  if (ctx.location?.nearbyMerchants?.[0]?.distanceMeters !== undefined &&
      ctx.location.nearbyMerchants[0].distanceMeters < 150) score += 0.1;
  return Math.min(score, 1);
}

export function getTimePeriod(hour: number): TimePeriod {
  let period: TimePeriod["period"];
  let label: string;
  if (hour >= 6 && hour < 11) { period = "morning"; label = "Morgen"; }
  else if (hour >= 11 && hour < 14) { period = "lunch"; label = "Mittagszeit"; }
  else if (hour >= 14 && hour < 18) { period = "afternoon"; label = "Nachmittag"; }
  else if (hour >= 18 && hour < 22) { period = "evening"; label = "Abend"; }
  else { period = "night"; label = "Nacht"; }
  return { hour, period, label };
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
