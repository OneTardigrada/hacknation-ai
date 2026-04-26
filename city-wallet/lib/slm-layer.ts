// lib/slm-layer.ts
// SIMULATION: In Produktion → WebLLM / transformers.js / MediaPipe LLM API
// Der SLM-Layer läuft lokal — kein PII verlässt das Gerät

export interface RawSignals {
  gpsLat: number;       // bleibt lokal — NEVER uploaded
  gpsLon: number;       // bleibt lokal — NEVER uploaded
  movementSpeed: number;
  appHistory: string[];
  weatherCache: { temp: number; condition: string };
  hour: number;
}

export interface IntentVector {
  need: "warm_drink" | "quick_bite" | "gift" | "browsing" | "protein" | "pastry";
  urgency: "now" | "soon" | "flexible";
  radiusMeters: number;
  mood: "comfort" | "energized" | "time_pressed" | "social";
  priceRange: "budget" | "mid" | "premium";
  merchantProximityBucket: string; // e.g. "cafe_nearby" — never GPS coordinates
}

function inferNeed(history: string[], hour: number): IntentVector["need"] {
  if (history.includes("protein") || history.includes("gym")) return "protein";
  if (history.includes("pastry") || history.includes("bakery")) return "pastry";
  if (hour >= 6 && hour <= 10) return "warm_drink";
  if (hour >= 11 && hour <= 13) return "quick_bite";
  if (hour >= 14 && hour <= 17) return "warm_drink";
  return "browsing";
}

function inferMood(speed: number, hour: number, history: string[]): IntentVector["mood"] {
  if (speed > 4) return "time_pressed";
  if (history.includes("gym") || history.includes("sport")) return "energized";
  if (history.includes("friend") || history.includes("group")) return "social";
  return "comfort";
}

function inferPriceRange(history: string[]): IntentVector["priceRange"] {
  if (history.includes("premium") || history.includes("luxury")) return "premium";
  if (history.includes("budget") || history.includes("cheap")) return "budget";
  return "mid";
}

function computeProximityBucket(lat: number, lon: number): string {
  // Haversine on-device — only bucket label leaves device
  // In demo: simulated
  const merchantLat = 48.778;
  const merchantLon = 9.18;
  const R = 6371000;
  const dLat = ((merchantLat - lat) * Math.PI) / 180;
  const dLon = ((merchantLon - lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((merchantLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  if (dist < 100) return "cafe_very_close";
  if (dist < 300) return "cafe_nearby";
  return "cafe_area";
}

// This function represents the On-Device SLM
// In demo: deterministic logic based on inputs
// In production: WebLLM (browser-native) or MediaPipe LLM Task API
export function processSignalsLocally(raw: RawSignals): IntentVector {
  return {
    need: inferNeed(raw.appHistory, raw.hour),
    urgency: raw.movementSpeed < 1.5 ? "now" : raw.movementSpeed < 4 ? "soon" : "flexible",
    radiusMeters: 200,
    mood: inferMood(raw.movementSpeed, raw.hour, raw.appHistory),
    priceRange: inferPriceRange(raw.appHistory),
    merchantProximityBucket: computeProximityBucket(raw.gpsLat, raw.gpsLon),
    // gpsLat and gpsLon are consumed here — never sent to the cloud
  };
}
