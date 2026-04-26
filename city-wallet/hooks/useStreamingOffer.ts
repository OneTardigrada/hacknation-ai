"use client";
import { useState, useCallback, useEffect } from "react";
import type { GeneratedOfferUI } from "@/lib/offer-prompt";
import type { IntentVector } from "@/lib/slm-layer";
import type { MerchantRules } from "@/lib/offer-prompt";
import { fallbackOffer } from "@/lib/offer-prompt";
import { STUTTGART_CONFIG } from "@/config/city.config";

export type OfferState = "idle" | "generating" | "ready" | "accepted" | "dismissed" | "expired";

export function useStreamingOffer() {
  const [offer, setOffer] = useState<GeneratedOfferUI | null>(null);
  const [state, setState] = useState<OfferState>("idle");
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const generateOffer = useCallback(
    async (intent: IntentVector, merchantId: string, rules: MerchantRules) => {
      setState("generating");
      setStreamedText("");
      setIsStreaming(true);
      setOffer(null);

      try {
        const res = await fetch("/api/generate-offer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent, merchantId, rules }),
        });

        if (!res.ok) throw new Error("API error");
        if (!res.body) throw new Error("No stream");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          setStreamedText(buffer);
        }

        // Parse completed JSON
        const parsed = JSON.parse(buffer) as GeneratedOfferUI;
        setOffer(parsed);
        setState("ready");
      } catch {
        // Fallback offer
        const merchant =
          STUTTGART_CONFIG.merchants.find((m) => m.id === merchantId) ??
          STUTTGART_CONFIG.merchants[0];
        setOffer(fallbackOffer(merchant, intent));
        setState("ready");
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const accept = useCallback(() => setState("accepted"), []);
  const dismiss = useCallback(() => setState("dismissed"), []);
  const expire = useCallback(() => setState("expired"), []);
  const reset = useCallback(() => {
    setState("idle");
    setOffer(null);
    setStreamedText("");
  }, []);

  return { offer, state, streamedText, isStreaming, generateOffer, accept, dismiss, expire, reset };
}
