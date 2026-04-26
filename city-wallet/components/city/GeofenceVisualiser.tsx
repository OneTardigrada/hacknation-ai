"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import type { MerchantConfig } from "@/config/city.config";

interface GeofenceVisualiserProps {
  merchants: MerchantConfig[];
  activeMerchantId: string | null;
  inZone: boolean;
  triggerScore: number;
}

export function GeofenceVisualiser({ merchants, activeMerchantId, inZone, triggerScore }: GeofenceVisualiserProps) {
  const primary = merchants.find((m) => m.id === activeMerchantId) ?? merchants[0];

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100">
        {/* Simulated street lines */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-300" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-300" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gray-300" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gray-300" />
      </div>

      {/* User position */}
      <motion.div
        className="absolute z-20"
        style={{ left: "48%", top: "52%" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" />
      </motion.div>

      {/* Geofence rings */}
      {[150, 100, 60].map((radius, i) => (
        <motion.div
          key={radius}
          className="absolute rounded-full border-2"
          style={{
            width: radius * 1.4,
            height: radius * 1.4,
            left: `calc(52% - ${radius * 0.7}px)`,
            top: `calc(48% - ${radius * 0.7}px)`,
            borderColor: inZone
              ? `rgba(230,0,0,${0.5 - i * 0.15})`
              : `rgba(59,130,246,${0.4 - i * 0.1})`,
          }}
          animate={
            inZone
              ? { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }
              : { scale: 1, opacity: 0.4 }
          }
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
        />
      ))}

      {/* Merchant pins */}
      {merchants.slice(0, 3).map((m, i) => {
        const positions = [
          { left: "52%", top: "48%" },
          { left: "65%", top: "35%" },
          { left: "38%", top: "58%" },
        ];
        const pos = positions[i] ?? positions[0];
        const isActive = m.id === activeMerchantId;
        return (
          <motion.div
            key={m.id}
            className="absolute z-10 flex flex-col items-center"
            style={pos}
            animate={isActive && inZone ? { y: [0, -4, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md border-2"
              style={{
                background: isActive ? "#E60000" : "#fff",
                borderColor: isActive ? "#B30000" : "#d1d5db",
              }}
            >
              {m.emoji}
            </div>
            {isActive && (
              <span className="text-[9px] font-semibold text-gray-700 mt-0.5 bg-white px-1 rounded">
                {m.name.split(" ")[0]}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* Zone label */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Geo-Fence</span>
        {inZone && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ background: "#E60000" }}
          >
            Zone betreten!
          </motion.span>
        )}
      </div>

      {/* Score indicator */}
      <div className="absolute bottom-2 left-3 right-3">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] text-gray-500">Trigger Score</span>
          <span className="text-[10px] font-bold" style={{ color: triggerScore > 0.7 ? "#E60000" : triggerScore > 0.4 ? "#f59e0b" : "#6B7280" }}>
            {Math.round(triggerScore * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: triggerScore > 0.7 ? "#E60000" : triggerScore > 0.4 ? "#f59e0b" : "#22c55e" }}
            animate={{ width: `${triggerScore * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
