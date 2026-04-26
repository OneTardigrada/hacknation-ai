"use client";
import { motion } from "framer-motion";

export function PrivacyLayer() {
  const layers = [
    {
      label: "RAW SIGNALS (Gerät — PRIVAT)",
      color: "#fef3c7",
      borderColor: "#f59e0b",
      items: [
        "GPS-Koordinaten → verarbeitet lokal",
        "Bewegungsgeschwindigkeit → verarbeitet lokal",
        "App-Verlauf → verarbeitet lokal",
        "Wetter-Cache → öffentlich, harmlos",
      ],
      badge: "VERLÄSST GERÄT NIE",
      badgeColor: "#166534",
      badgeBg: "#dcfce7",
    },
    {
      label: "ON-DEVICE SLM LAYER (Phi-3 / Gemma)",
      color: "#eff6ff",
      borderColor: "#3b82f6",
      items: [
        "Abstraktion: GPS → Distanz-Bucket",
        "Intent: 'warm_drink · 200m · now'",
        "Kein PII im Output",
        "Demo: deterministische Logik (Architektur identisch)",
      ],
      badge: "ON-DEVICE PROCESSING",
      badgeColor: "#1d4ed8",
      badgeBg: "#dbeafe",
    },
    {
      label: "INTENT VECTOR → Cloud (kein PII)",
      color: "#f0fdf4",
      borderColor: "#22c55e",
      items: [
        "need: 'warm_drink'",
        "urgency: 'now'",
        "radiusMeters: 200",
        "mood: 'comfort'",
        "priceRange: 'budget'",
        "merchantProximityBucket: 'cafe_nearby'",
      ],
      badge: "KEIN NAME · KEINE GPS · KEIN PII",
      badgeColor: "#166534",
      badgeBg: "#dcfce7",
    },
    {
      label: "CLOUD BACKEND (GPT-4o generiert Angebot)",
      color: "#fdf4ff",
      borderColor: "#a855f7",
      items: [
        "Empfängt: Intent-Vektor + Händler-Kontext",
        "GPT-4o generiert: headline, discount, colorScheme…",
        "KEIN Datenbankabfrage — alles dynamisch",
        "Gibt zurück: Angebots-JSON",
      ],
      badge: "GENERATIV · KEIN DB-LOOKUP",
      badgeColor: "#7e22ce",
      badgeBg: "#f3e8ff",
    },
    {
      label: "GENUI ASSEMBLY — On-Device",
      color: "#fff7ed",
      borderColor: "#f97316",
      items: [
        "Angebots-JSON + lokale Präferenzen",
        "UI wird on-device zusammengebaut",
        "Personalisierung lokal — nie hochgeladen",
        "Dynamisches Farbschema vom LLM",
      ],
      badge: "PRIVACY-BY-DESIGN",
      badgeColor: "#9a3412",
      badgeBg: "#ffedd5",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          DSGVO — Privacy Architecture
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Datenpfad: was bleibt lokal, was verlässt das Gerät
        </p>
      </div>

      {layers.map((layer, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl p-3 border"
          style={{ background: layer.color, borderColor: layer.borderColor }}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-[10px] font-bold text-gray-700 leading-tight">{layer.label}</p>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: layer.badgeBg, color: layer.badgeColor }}
            >
              {layer.badge}
            </span>
          </div>
          <ul className="space-y-0.5">
            {layer.items.map((item, j) => (
              <li key={j} className="text-[10px] text-gray-600 flex items-start gap-1">
                <span className="shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {i < layers.length - 1 && (
            <div className="flex justify-center mt-2">
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-gray-400 text-sm"
              >
                ↓
              </motion.span>
            </div>
          )}
        </motion.div>
      ))}

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
        <p className="text-[10px] font-bold text-green-800">
          DSGVO-Konform by Architecture
        </p>
        <p className="text-[10px] text-green-700 mt-0.5">
          Keine Koordinaten · Kein Name · Kein Profil in der Cloud
        </p>
      </div>
    </div>
  );
}
