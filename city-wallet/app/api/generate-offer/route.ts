// app/api/generate-offer/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { buildOfferPrompt, fallbackOffer, type MerchantRules } from "@/lib/offer-prompt";
import { STUTTGART_CONFIG } from "@/config/city.config";
import type { IntentVector } from "@/lib/slm-layer";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { intent, merchantId, rules } = body as {
    intent: IntentVector;
    merchantId: string;
    rules: MerchantRules;
  };

  const merchant = STUTTGART_CONFIG.merchants.find((m) => m.id === merchantId) ?? STUTTGART_CONFIG.merchants[0];
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return fallback as stream
    const offer = fallbackOffer(merchant, intent);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(offer)));
        controller.close();
      },
    });
    return new Response(stream, { headers: { "Content-Type": "application/json" } });
  }

  const client = new OpenAI({ apiKey });
  const messages = buildOfferPrompt(intent, merchant, rules, STUTTGART_CONFIG.city.locale);

  try {
    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      max_tokens: 400,
      temperature: 0.8,
    });

    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          buffer += delta;
          controller.enqueue(new TextEncoder().encode(delta));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    const offer = fallbackOffer(merchant, intent);
    return new Response(JSON.stringify(offer), { headers: { "Content-Type": "application/json" } });
  }
}
