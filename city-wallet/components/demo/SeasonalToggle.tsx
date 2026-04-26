"use client";
import { motion } from "framer-motion";
import { STUTTGART_CONFIG } from "@/config/city.config";

interface SeasonalToggleProps {
  active: string | null;
  onChange: (tag: string | null) => void;
}

export function SeasonalToggle({ active, onChange }: SeasonalToggleProps) {
  const tags = STUTTGART_CONFIG.seasonalTags;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Seasonal Mode
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange(null)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
          style={{
            background: active === null ? "#1A1A1A" : "#F9FAFB",
            color: active === null ? "#fff" : "#374151",
            borderColor: active === null ? "#1A1A1A" : "#E5E7EB",
          }}
        >
          Normal
        </button>
        {tags.map((tag) => (
          <motion.button
            key={tag.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(active === tag.id ? null : tag.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors"
            style={{
              background: active === tag.id ? (tag.colorOverride ?? "#E60000") : "#F9FAFB",
              color: active === tag.id ? "#fff" : "#374151",
              borderColor: active === tag.id ? (tag.colorOverride ?? "#E60000") : "#E5E7EB",
            }}
          >
            {tag.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
