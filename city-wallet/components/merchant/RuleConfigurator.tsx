"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Check } from "lucide-react";
import type { MerchantRules } from "@/lib/offer-prompt";

interface RuleConfiguratorProps {
  initial: MerchantRules;
  onChange: (rules: MerchantRules) => void;
}

const CARD_STYLE: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #EEF0F3",
  boxShadow: "0 1px 2px rgba(15,20,30,0.04), 0 8px 24px rgba(15,20,30,0.04)",
};

const GOAL_OPTIONS = [
  { id: "quiet_hour_fill", label: "Ruhige Stunden", hint: "Auslastung erhöhen" },
  { id: "brand_awareness", label: "Bekanntheit", hint: "Reichweite steigern" },
  { id: "upsell", label: "Upsell", hint: "Warenkorb erhöhen" },
];
const TONE_OPTIONS = [
  { id: "warm", label: "Warm" },
  { id: "factual", label: "Faktisch" },
  { id: "energetic", label: "Energisch" },
];

export function RuleConfigurator({ initial, onChange }: RuleConfiguratorProps) {
  const [rules, setRules] = useState<MerchantRules>(initial);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<MerchantRules>) => {
    const next = { ...rules, ...patch };
    setRules(next);
    setSaved(false);
  };

  const save = () => {
    onChange(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl p-4 space-y-5" style={CARD_STYLE}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#FFF1F1", color: "#E60000" }}
          >
            <Settings2 size={14} strokeWidth={2.2} />
          </div>
          <p className="text-[12px] font-semibold text-gray-800">Kampagnen-Einstellungen</p>
        </div>
        {/* Active toggle in header for quick access */}
        <button
          onClick={() => update({ active: !rules.active })}
          className="flex items-center gap-1.5"
          aria-label="Angebote aktiv"
        >
          <span className="text-[11px] font-medium text-gray-600">
            {rules.active ? "Aktiv" : "Pausiert"}
          </span>
          <span
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{ background: rules.active ? "#E60000" : "#D1D5DB" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: rules.active ? "translateX(16px)" : "translateX(0)" }}
            />
          </span>
        </button>
      </div>

      {/* Max Discount slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-medium text-gray-700">Max. Rabatt</label>
          <span
            className="text-[12px] font-bold tabular-nums px-2 py-0.5 rounded-md"
            style={{ background: "#FFF1F1", color: "#E60000" }}
          >
            {rules.maxDiscount}%
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          value={rules.maxDiscount}
          onChange={(e) => update({ maxDiscount: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
          <span>5%</span>
          <span>40%</span>
        </div>
      </div>

      {/* Goal — segmented selector */}
      <div className="space-y-2">
        <label className="text-[12px] font-medium text-gray-700">Auslöser-Ziel</label>
        <div className="grid grid-cols-3 gap-1.5">
          {GOAL_OPTIONS.map((opt) => {
            const active = rules.goal === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update({ goal: opt.id })}
                className="rounded-xl px-2 py-2 text-left transition-all"
                style={{
                  background: active ? "#FFF1F1" : "#F8F9FA",
                  border: active ? "1px solid #E60000" : "1px solid #EEF0F3",
                }}
              >
                <p
                  className="text-[11px] font-bold leading-tight"
                  style={{ color: active ? "#E60000" : "#374151" }}
                >
                  {opt.label}
                </p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone — segmented control */}
      <div className="space-y-2">
        <label className="text-[12px] font-medium text-gray-700">Ton-Stil</label>
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "#F3F4F6" }}
        >
          {TONE_OPTIONS.map((t) => {
            const active = rules.tone === t.id;
            return (
              <button
                key={t.id}
                onClick={() => update({ tone: t.id })}
                className="flex-1 py-1.5 text-[11px] rounded-lg transition-all font-semibold"
                style={{
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#E60000" : "#6B7280",
                  boxShadow: active ? "0 1px 3px rgba(15,20,30,0.08)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Focus */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-gray-700">Produkt-Fokus</label>
        <input
          type="text"
          value={rules.productFocus}
          onChange={(e) => update({ productFocus: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-[12px] focus:outline-none focus:ring-2 transition-all"
          style={{
            background: "#F8F9FA",
            border: "1px solid #EEF0F3",
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "rgba(230,0,0,0.15)",
          }}
          placeholder="z.B. Heiße Getränke"
        />
      </div>

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={save}
        className="w-full py-3 rounded-xl text-white font-semibold text-[13px] transition-all flex items-center justify-center gap-1.5"
        style={{
          background: saved ? "#10B981" : "#E60000",
          boxShadow: saved
            ? "0 6px 16px rgba(16,185,129,0.28)"
            : "0 6px 16px rgba(230,0,0,0.28)",
        }}
      >
        {saved ? (
          <>
            <Check size={15} strokeWidth={2.6} />
            Gespeichert
          </>
        ) : (
          "Regeln speichern"
        )}
      </motion.button>
    </div>
  );
}
