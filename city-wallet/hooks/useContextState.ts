"use client";
import { useState, useEffect, useCallback } from "react";
import { computeTriggerScore, getTimePeriod, type ContextState, type WeatherData } from "@/lib/context-engine";
import { getMerchantSnapshot, type MerchantSnapshot } from "@/lib/merchant-sim";
import { STUTTGART_CONFIG } from "@/config/city.config";
import { haversineDistance } from "@/lib/context-engine";

export function useContextState(
  hour: number,
  weatherOverride?: WeatherData,
  personaSpeed: number = 0.8,
  gpsLat: number = 48.7771,
  gpsLon: number = 9.1801
) {
  const [ctx, setCtx] = useState<ContextState>(() => buildCtx(hour, weatherOverride, personaSpeed, gpsLat, gpsLon));

  function buildCtx(h: number, weather?: WeatherData, speed: number = 0.8, userLat: number = 48.7771, userLon: number = 9.1801): ContextState {
    const merchants = STUTTGART_CONFIG.merchants;
    const nearbyMerchants = merchants.map((m) => ({
      merchant: m,
      distanceMeters: Math.round(haversineDistance(userLat, userLon, m.lat, m.lon)),
    })).sort((a, b) => a.distanceMeters - b.distanceMeters);

    const txDensity = merchants.map((m) => {
      const snap = getMerchantSnapshot(m.id, h);
      return { merchantId: m.id, level: snap.level, label: snap.label };
    });

    const time = getTimePeriod(h);
    const w: WeatherData = weather ?? { temp: 11, condition: "overcast clouds", description: "Bedeckt", icon: "04d" };

    const partial = { weather: w, transactionDensity: txDensity, location: { nearbyMerchants, inZone: nearbyMerchants[0].distanceMeters < 150, zoneMerchantId: nearbyMerchants[0].distanceMeters < 150 ? nearbyMerchants[0].merchant.id : null }, time };
    const score = computeTriggerScore(partial);

    return {
      ...partial,
      triggerScore: score,
      persona: "mia",
      seasonalTag: null,
    };
  }

  useEffect(() => {
    setCtx(buildCtx(hour, weatherOverride, personaSpeed, gpsLat, gpsLon));
  }, [hour, weatherOverride?.temp, weatherOverride?.condition, gpsLat, gpsLon]);

  const updatePersona = useCallback((personaId: string) => {
    setCtx((c) => ({ ...c, persona: personaId }));
  }, []);

  const updateSeasonalTag = useCallback((tag: string | null) => {
    setCtx((c) => ({ ...c, seasonalTag: tag }));
  }, []);

  return { ctx, updatePersona, updateSeasonalTag };
}
