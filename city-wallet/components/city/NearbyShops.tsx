"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronRight, X, Coffee, Croissant, Sparkles, Tag } from "lucide-react";
import type { MerchantWithDistance } from "@/lib/geofence";

interface NearbyShopsProps {
  merchants: MerchantWithDistance[];
  activeMerchantId: string;
  onSelectMerchant: (id: string) => void;
  onGenerateOffer: () => void;
  generating: boolean;
}

const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  cafe: Coffee,
  bakery: Croissant,
  smoothie: Sparkles,
  restaurant: Coffee,
  retail: Tag,
};

export function NearbyShops({
  merchants,
  activeMerchantId,
  onSelectMerchant,
  onGenerateOffer,
  generating,
}: NearbyShopsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const opened = merchants.find((m) => m.id === openId) ?? null;

  return (
    <div className="space-y-3 p-1">
      <div className="px-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">
          Im Geofence
        </p>
        <h3 className="text-base font-black text-gray-900 mt-0.5" style={{ letterSpacing: "-0.01em" }}>
          {merchants.length === 0
            ? "Keine Shops in Reichweite"
            : `${merchants.length} Shop${merchants.length === 1 ? "" : "s"} verfügbar`}
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Sortiert nach Entfernung · Nur Live-Offers im Radius
        </p>
      </div>

      <div className="space-y-2.5">
        {merchants.map((m) => {
          const isActive = m.id === activeMerchantId;
          const CatIcon = CATEGORY_ICON[m.category] ?? Tag;
          return (
            <motion.button
              key={m.id}
              layout
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                onSelectMerchant(m.id);
                setOpenId(m.id);
              }}
              className="w-full text-left rounded-2xl overflow-hidden relative"
              style={{
                background: "#FFFFFF",
                border: isActive ? "1.5px solid #E60000" : "1px solid rgba(15,20,30,0.06)",
                boxShadow: isActive
                  ? "0 8px 24px rgba(230,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset"
                  : "0 4px 14px rgba(15,20,30,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              {/* Hero (SVG-only — no images) */}
              <div className="relative w-full" style={{ height: 96 }}>
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg,#FEE2E2,#FECACA)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CatIcon size={28} strokeWidth={1.75} />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
                  }}
                />
                <span
                  className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    color: "#111827",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CatIcon size={10} strokeWidth={2} />
                  {m.category}
                </span>
                <span
                  className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 text-white"
                  style={{ background: "rgba(230,0,0,0.92)" }}
                >
                  <MapPin size={10} strokeWidth={2} />
                  {Math.round(m.distanceMeters)} m
                </span>
                <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-end justify-between">
                  <div>
                    <p className="text-[14px] font-black text-white" style={{ letterSpacing: "-0.01em" }}>
                      {m.name}
                    </p>
                    {m.tagline && (
                      <p className="text-[9px] text-white/85 leading-tight mt-0.5 line-clamp-1">
                        {m.tagline}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}
                  >
                    bis −{m.maxDiscount}%
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">{m.productFocus}</span>
                </div>
                <ChevronRight size={14} className="text-gray-400" strokeWidth={2} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(15,20,30,0.45)", backdropFilter: "blur(8px)" }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[28px] overflow-hidden bg-white"
              style={{
                boxShadow:
                  "0 30px 80px rgba(15,20,30,0.35), 0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              {/* Hero (SVG-only — no images) */}
              <div className="relative w-full" style={{ height: 220 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#FEE2E2,#FECACA)" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {(() => {
                    const OpenedIcon = CATEGORY_ICON[opened.category] ?? Tag;
                    return <OpenedIcon size={64} strokeWidth={1.5} />;
                  })()}
                </div>
                <button
                  onClick={() => setOpenId(null)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 12px rgba(15,20,30,0.18)",
                  }}
                  aria-label="Schließen"
                >
                  <X size={16} strokeWidth={2.2} className="text-gray-700" />
                </button>
                <span
                  className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 text-white"
                  style={{ background: "rgba(230,0,0,0.95)" }}
                >
                  <MapPin size={11} strokeWidth={2.2} />
                  {Math.round(opened.distanceMeters)} m entfernt
                </span>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                    {opened.category}
                  </p>
                  <h2
                    className="text-2xl font-black text-gray-900 mt-1"
                    style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
                  >
                    {opened.name}
                  </h2>
                  {opened.tagline && (
                    <p className="text-sm text-gray-500 mt-1.5 leading-snug">
                      {opened.tagline}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <div
                    className="flex-1 rounded-2xl p-3"
                    style={{ background: "#F8F9FA", border: "1px solid rgba(15,20,30,0.05)" }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Fokus
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-1">{opened.productFocus}</p>
                  </div>
                  <div
                    className="flex-1 rounded-2xl p-3"
                    style={{ background: "#FFF4F4", border: "1px solid rgba(230,0,0,0.15)" }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-600/70">
                      Bis zu
                    </p>
                    <p className="text-xl font-black text-red-600 mt-0.5" style={{ letterSpacing: "-0.02em" }}>
                      −{opened.maxDiscount}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectMerchant(opened.id);
                    onGenerateOffer();
                    setOpenId(null);
                  }}
                  disabled={generating}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-[0.98]"
                  style={{
                    background: generating
                      ? "linear-gradient(135deg,#9CA3AF,#6B7280)"
                      : "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)",
                    boxShadow: generating
                      ? "none"
                      : "0 10px 26px rgba(230,0,0,0.32), 0 1px 0 rgba(255,255,255,0.25) inset",
                  }}
                >
                  {generating ? "Wird generiert…" : "Live-Angebot generieren →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
