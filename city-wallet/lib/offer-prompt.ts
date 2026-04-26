// lib/offer-prompt.ts
import type { IntentVector } from "./slm-layer";
import type { MerchantConfig } from "@/config/city.config";

export interface MerchantRules {
  maxDiscount: number;
  goal: string;
  tone: string;
  productFocus: string;
  active: boolean;
}

export interface GeneratedOfferUI {
  headline: string;
  subline: string;
  discountValue: string;
  discountReason: string;
  cta: string;
  colorScheme: "warm_amber" | "cool_blue" | "fresh_green" | "vibrant_coral";
  gradientOverride?: string;
  emoji: string;
  visualStyle: "cozy" | "energetic" | "minimal" | "festive";
  expiryMinutes: number;
  tone: "emotional" | "factual";
  reasoning: string;
  accessibilityLabel: string;
  merchantName: string;
  merchantId: string;
  distanceMeters: number;
}

function determineTone(intent: IntentVector): "emotional" | "factual" {
  if (intent.mood === "time_pressed" || intent.urgency === "now") {
    return "factual";
  }
  if (intent.mood === "energized") return "factual";
  return "emotional";
}

const EMOTIONAL_INSTRUCTION = `
Schreibe die Headline wie eine einladende Nachricht von einem Freund.
Nutze Wetterbezug, Zeitgefühl, emotionale Wärme.
Beispiel: "Grauer Dienstag? ☕ Café Müller hat genau das Richtige."
Max 8 Wörter.
`;

const FACTUAL_INSTRUCTION = `
Schreibe die Headline wie eine schnelle, hilfreiche Info-Nachricht.
Fakten zuerst. Kein Smalltalk.
Beispiel: "15% auf Kaffee. 80m. Endet in 22 min."
Max 6 Wörter.
`;

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export function buildOfferPrompt(
  intent: IntentVector,
  merchant: MerchantConfig,
  rules: MerchantRules,
  locale: string = "de-DE"
): ChatMessage[] {
  const tone = determineTone(intent);
  const toneInstruction = tone === "emotional" ? EMOTIONAL_INSTRUCTION : FACTUAL_INSTRUCTION;

  return [
    {
      role: "system",
      content: `Du bist die Offer-Generation-Engine von City Wallet.
Du generierst IMMER valides JSON. Kein Markdown, kein Erklärtext.
Sprache: ${locale === "de-DE" ? "Deutsch" : "English"}.
Antworte NUR mit dem JSON-Objekt, keine anderen Zeichen.`,
    },
    {
      role: "user",
      content: `
INTENT VECTOR (vom lokalen SLM — kein PII):
${JSON.stringify(intent, null, 2)}

HÄNDLER-KONTEXT:
Name: ${merchant.name}
Kategorie: ${merchant.category}
Distanz-Bucket: ${intent.merchantProximityBucket}
Emoji: ${merchant.emoji}

HÄNDLER-REGELN:
Max Rabatt: ${rules.maxDiscount}%
Ziel: ${rules.goal}
Ton-Präferenz: ${rules.tone}
Produkt-Fokus: ${rules.productFocus}

TON-INSTRUKTION:
${toneInstruction}

GENERIERE JSON (nur dieses Objekt, kein Markdown):
{
  "headline": "max 8 Wörter, ${tone === "emotional" ? "einladend" : "faktisch"}",
  "subline": "ein Satz mit Rabatt und Zeitlimit",
  "discountValue": "z.B. 15% OFF",
  "discountReason": "kurzer Grund (z.B. Ruhige Stunde)",
  "cta": "2-3 Wörter",
  "colorScheme": "warm_amber|cool_blue|fresh_green|vibrant_coral",
  "emoji": "ein passendes Emoji",
  "visualStyle": "cozy|energetic|minimal|festive",
  "expiryMinutes": 25,
  "tone": "${tone}",
  "reasoning": "ein Satz warum dieses Angebot jetzt Sinn macht",
  "accessibilityLabel": "für Screen Reader",
  "merchantName": "${merchant.name}",
  "merchantId": "${merchant.id}",
  "distanceMeters": 80
}

Regeln:
- Headline DARF NICHT 'limitiertes Angebot' oder 'jetzt zugreifen' sagen
- Rabatt muss ≤ ${rules.maxDiscount}%
- Wenn tone=factual: Zahlen zuerst, keine Emotionen
- colorScheme: warm=Café/Bäckerei, fresh=Smoothie, cool=abends/regen, coral=festlich`,
    },
  ];
}

export function fallbackOffer(merchant: MerchantConfig, intent: IntentVector): GeneratedOfferUI {
  const tone = determineTone(intent);
  return {
    headline: tone === "emotional" ? `${merchant.emoji} Gönne dir eine Pause` : `${merchant.name} · 80m · 15% OFF`,
    subline: `15% Rabatt auf ${merchant.productFocus} — noch 25 Minuten`,
    discountValue: "15% OFF",
    discountReason: "Ruhige Stunde",
    cta: "Jetzt holen",
    colorScheme: merchant.category === "smoothie" ? "fresh_green" : "warm_amber",
    emoji: merchant.emoji,
    visualStyle: merchant.category === "smoothie" ? "energetic" : "cozy",
    expiryMinutes: 25,
    tone,
    reasoning: "Ruhige Stunde + Nähe = guter Moment für ein Angebot",
    accessibilityLabel: `15% Rabatt bei ${merchant.name}, 80 Meter entfernt, gültig noch 25 Minuten`,
    merchantName: merchant.name,
    merchantId: merchant.id,
    distanceMeters: 80,
  };
}
