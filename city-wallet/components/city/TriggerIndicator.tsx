"use client";
import { motion } from "framer-motion";

interface TriggerIndicatorProps {
  score: number;
  label?: string;
}

export function TriggerIndicator({ score, label }: TriggerIndicatorProps) {
  const color =
    score >= 0.7 ? "#E60000" : score >= 0.4 ? "#f59e0b" : "#22c55e";
  const statusLabel =
    score >= 0.7 ? "Feuer" : score >= 0.4 ? "Aufwärmen" : "Ruhig";

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <motion.div
          className="w-5 h-5 rounded-full"
          style={{ background: color }}
          animate={score >= 0.7 ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : { scale: 1 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        {score >= 0.7 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: color }}
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700">{statusLabel}</p>
        {label && <p className="text-[10px] text-gray-400">{label}</p>}
      </div>
    </div>
  );
}
