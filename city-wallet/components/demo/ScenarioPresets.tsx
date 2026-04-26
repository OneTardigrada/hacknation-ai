"use client";
import { motion } from "framer-motion";
import { Coffee, Dumbbell, ShoppingBag, Moon, Users, CalendarCheck } from "lucide-react";
import { SCENARIOS, type DemoScenario } from "@/lib/scenarios";
import type { LucideIcon } from "lucide-react";

const SCENARIO_ICONS: Record<string, LucideIcon> = {
  "scenario-1": Coffee,
  "scenario-2": Dumbbell,
  "scenario-3": ShoppingBag,
  "scenario-4": Moon,
  "scenario-5": Users,
  "scenario-6": CalendarCheck,
};

interface ScenarioPresetsProps {
  onSelect: (scenario: DemoScenario) => void;
  activeId: string | null;
}

export function ScenarioPresets({ onSelect, activeId }: ScenarioPresetsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Demo Szenarien
      </p>
      <div className="space-y-1.5">
        {SCENARIOS.map((s) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(s)}
            className="w-full text-left px-3 py-2.5 rounded-xl border transition-colors"
            style={{
              background: activeId === s.id ? "#FFF1F2" : "#F9FAFB",
              borderColor: activeId === s.id ? "#E60000" : "#E5E7EB",
            }}
          >
            <div className="flex items-center gap-2">
              {(() => { const Icon = SCENARIO_ICONS[s.id]; return Icon ? <Icon size={16} style={{ color: activeId === s.id ? "#E60000" : "#6B7280" }} /> : null; })()}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{s.label}</p>
                <p className="text-[10px] text-gray-500 truncate">{s.description}</p>
              </div>
              {activeId === s.id && (
                <span className="text-[10px] text-red-600 font-bold shrink-0">AKTIV</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
