// lib/personas.ts
export interface Persona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  movementSpeed: number; // m/s — 0.5=browsing, 1.5=walking, 4=commuting
  appHistory: string[];
  defaultHour: number;
  tone: "emotional" | "factual";
  scenarioDescription: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "mia",
    name: "Mia",
    emoji: "👩",
    description: "Studentin, flaniert durch Stuttgart",
    movementSpeed: 0.8,
    appHistory: ["warm_drink", "cafe", "bakery"],
    defaultHour: 11,
    tone: "emotional",
    scenarioDescription: "Di, 11°C, Café ruhig — Mia ist kalt, Café fast leer",
  },
  {
    id: "max",
    name: "Max",
    emoji: "🧑",
    description: "Fitness-Enthusiast, kommt vom Sport",
    movementSpeed: 3.5,
    appHistory: ["gym", "sport", "protein"],
    defaultHour: 9,
    tone: "factual",
    scenarioDescription: "Do, 18°C, Smoothie Bar — Max nach dem Training",
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "👩‍💼",
    description: "Pendlerin, kurze Mittagspause",
    movementSpeed: 1.2,
    appHistory: ["quick_bite", "pastry", "bakery"],
    defaultHour: 12,
    tone: "emotional",
    scenarioDescription: "Sa, Regen, Bäckerei — Sofia läuft zufällig vorbei",
  },
];

export function getPersona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
