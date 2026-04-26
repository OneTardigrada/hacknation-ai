"use client";
import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudSnow, Sun, MapPin, BarChart2, Loader2, Zap } from "lucide-react";
import { GeofenceVisualiser } from "./GeofenceVisualiser";
import { TriggerIndicator } from "./TriggerIndicator";
import type { ContextState } from "@/lib/context-engine";
import type { MerchantConfig } from "@/config/city.config";

interface ContextPanelProps {
  ctx: ContextState;
  merchants: MerchantConfig[];
  onGenerate: () => void;
  generating: boolean;
}

function WeatherIcon({ condition, size = 18 }: { condition: string; size?: number }) {
  if (condition.includes("rain") || condition.includes("drizzle")) return <CloudRain size={size} className="text-blue-400" />;
  if (condition.includes("snow")) return <CloudSnow size={size} className="text-blue-300" />;
  if (condition.includes("cloud") || condition.includes("overcast")) return <Cloud size={size} className="text-gray-400" />;
  return <Sun size={size} className="text-yellow-400" />;
}

export function ContextPanel({ ctx, merchants, onGenerate, generating }: ContextPanelProps) {
  const nearestMerchant = ctx.location.nearbyMerchants[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Context Sensing Layer
        </h2>
        <p className="text-sm text-gray-500">Live-Signale — {ctx.time.label}</p>
      </div>

      {/* Signal 1: Weather */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <WeatherIcon condition={ctx.weather.condition} />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signal 1 — Wetter</p>
            <p className="text-sm font-bold text-gray-900">
              {ctx.weather.temp}°C · {ctx.weather.description}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
            OpenWeatherMap
          </span>
        </div>
        <div className="flex gap-2">
          {ctx.weather.temp < 14 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              Kalt (+0.25 Score)
            </span>
          )}
          {ctx.weather.condition.includes("rain") && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              Regen (+0.20 Score)
            </span>
          )}
        </div>
      </div>

      {/* Signal 2: Transaction Density */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-orange-400" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signal 2 — Transaktionen</p>
            <p className="text-sm font-bold text-gray-900">
              {ctx.transactionDensity[0]?.label ?? "Laden..."}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">
            Payone-Sim
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {ctx.transactionDensity.slice(0, 3).map((td) => {
            const m = merchants.find((mm) => mm.id === td.merchantId);
            const dotColor = td.level === "LOW" ? "#f59e0b" : td.level === "HIGH" ? "#22c55e" : "#9ca3af";
            return (
              <span
                key={td.merchantId}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: td.level === "LOW" ? "#fef3c7" : td.level === "HIGH" ? "#dcfce7" : "#f3f4f6",
                  color: td.level === "LOW" ? "#92400e" : td.level === "HIGH" ? "#166534" : "#374151",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                {m?.name.split(" ")[0]}: {td.label.replace(/^[^\s]+\s/, "")}
              </span>
            );
          })}
        </div>
        {ctx.transactionDensity[0]?.level === "LOW" && (
          <span className="text-[10px] text-orange-600">Wenig los → +0.30 Score</span>
        )}
      </div>

      {/* Signal 3: Geo-Fence */}
      <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-green-500" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signal 3 — Geo-Fence</p>
            <p className="text-sm font-bold text-gray-900">
              {nearestMerchant?.distanceMeters}m · {nearestMerchant?.merchant.name}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
            On-Device
          </span>
        </div>
        <GeofenceVisualiser
          merchants={merchants}
          activeMerchantId={ctx.location.zoneMerchantId ?? nearestMerchant?.merchant.id ?? null}
          inZone={ctx.location.inZone}
          triggerScore={ctx.triggerScore}
        />
      </div>

      {/* Composite Score */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Composite Trigger Score</p>
          <TriggerIndicator score={ctx.triggerScore} />
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all"
            style={{
              width: `${ctx.triggerScore * 100}%`,
              background: ctx.triggerScore >= 0.7
                ? "linear-gradient(90deg, #E60000, #ff4444)"
                : ctx.triggerScore >= 0.4
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #22c55e, #4ade80)",
            }}
            animate={{ width: `${ctx.triggerScore * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Schwellenwert: 0.70 → {ctx.triggerScore >= 0.7 ? "Angebot wird generiert" : `${((0.7 - ctx.triggerScore) * 100).toFixed(0)}% fehlen noch`}
        </p>
      </div>

      {/* Generate Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onGenerate}
        disabled={generating}
        className="w-full py-3.5 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-all"
        style={{
          background: "#E60000",
          boxShadow: "0 4px 16px rgba(230,0,0,0.35)",
        }}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Generiere Angebot…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Zap size={16} />
            Angebot generieren
          </span>
        )}
      </motion.button>
    </div>
  );
}
