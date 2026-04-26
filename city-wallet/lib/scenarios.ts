// lib/scenarios.ts
export interface DemoScenario {
  id: string;
  label: string;
  emoji: string;
  personaId: string;
  hour: number;
  weatherOverride: { temp: number; condition: string; description: string };
  merchantId: string;
  intentOverride?: string[];
  seasonalTag?: string;
  description: string;
  userLat?: number;
  userLon?: number;
}

export const SCENARIOS: DemoScenario[] = [
  {
    id: "scenario-1",
    label: "Mia · Kalt · Café ruhig",
    emoji: "☕",
    personaId: "mia",
    hour: 11,
    weatherOverride: { temp: 11, condition: "overcast clouds", description: "Bedeckt" },
    merchantId: "cafe-muller",
    description: "Mia · Di · 11°C · Café Müller hat wenig los",
    userLat: 48.20689,
    userLon: 16.36481,
  },
  {
    id: "scenario-2",
    label: "Max · Sport · Smoothie",
    emoji: "💪",
    personaId: "max",
    hour: 9,
    weatherOverride: { temp: 18, condition: "clear sky", description: "Klar" },
    merchantId: "smoothie-bar",
    intentOverride: ["gym", "protein", "sport"],
    description: "Max · Do · 18°C · Nach dem Training",
    userLat: 48.20015,
    userLon: 16.35563,
  },
  {
    id: "scenario-3",
    label: "Sofia · Regen · Bäckerei",
    emoji: "🥐",
    personaId: "sofia",
    hour: 12,
    weatherOverride: { temp: 9, condition: "rain", description: "Regen" },
    merchantId: "stadtbaeckerei",
    description: "Sofia · Sa · Regen · Geo-Fence Trigger",
    userLat: 48.20081,
    userLon: 16.36988,
  },
  {
    id: "scenario-4",
    label: "Halloween · Abends",
    emoji: "🎃",
    personaId: "mia",
    hour: 19,
    weatherOverride: { temp: 8, condition: "overcast clouds", description: "Bewölkt" },
    merchantId: "cafe-muller",
    seasonalTag: "halloween",
    description: "Halloween-Modus · Themed GenUI",
    userLat: 48.20689,
    userLon: 16.36481,
  },
  {
    id: "scenario-5",
    label: "Mia + Freund · Gruppe",
    emoji: "👥",
    personaId: "mia",
    hour: 15,
    weatherOverride: { temp: 14, condition: "partly cloudy", description: "Teils bewölkt" },
    merchantId: "cafe-muller",
    intentOverride: ["friend", "group", "cafe"],
    description: "Mia + Freund · Friends Layer · Group Offer",
    userLat: 48.20849,
    userLon: 16.37208,
  },
  {
    id: "scenario-6",
    label: "Geplanter Kaffee um 15 Uhr",
    emoji: "📅",
    personaId: "mia",
    hour: 14,
    weatherOverride: { temp: 12, condition: "overcast clouds", description: "Bedeckt" },
    merchantId: "cafe-muller",
    intentOverride: ["scheduled", "cafe"],
    description: "Mia plant Kaffee um 15 Uhr — Pre-Order Flow",
    userLat: 48.20689,
    userLon: 16.36481,
  },
];
