"use client";
import { motion } from "framer-motion";
import { PERSONAS, type Persona } from "@/lib/personas";

interface PersonaSelectorProps {
  selected: string;
  onChange: (personaId: string) => void;
}

export function PersonaSelector({ selected, onChange }: PersonaSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Persona
      </p>
      <div className="grid grid-cols-3 gap-2">
        {PERSONAS.map((p) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(p.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors text-center"
            style={{
              background: selected === p.id ? "#FFF1F2" : "#F9FAFB",
              borderColor: selected === p.id ? "#E60000" : "#E5E7EB",
            }}
          >
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)" }}>{p.name.slice(0, 2).toUpperCase()}</span>
            <span className="text-xs font-semibold text-gray-800">{p.name}</span>
            <span className="text-[9px] text-gray-500 leading-tight">{p.description.split(",")[0]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
