"use client";
import { motion } from "framer-motion";
import { Target, CheckCircle2, XCircle, Wallet, Activity } from "lucide-react";

interface OfferPerformanceProps {
  acceptCount: number;
  dismissCount: number;
  revenueRecovered: number;
  offerCount: number;
}

export function OfferPerformance({ acceptCount, dismissCount, revenueRecovered, offerCount }: OfferPerformanceProps) {
  const total = acceptCount + dismissCount;
  const acceptRate = total > 0 ? Math.round((acceptCount / total) * 100) : 0;

  const metrics = [
    { label: "Generierte Angebote", value: offerCount, Icon: Target, color: "#6B7280", bg: "#F3F4F6" },
    { label: "Angenommen", value: acceptCount, Icon: CheckCircle2, color: "#166534", bg: "#DCFCE7" },
    { label: "Abgelehnt", value: dismissCount, Icon: XCircle, color: "#991B1B", bg: "#FEE2E2" },
    { label: "Revenue Recovery", value: `€${revenueRecovered.toFixed(2)}`, Icon: Wallet, color: "#92400E", bg: "#FEF3C7" },
  ];

  return (
    <div
      className="bg-white rounded-2xl p-5 space-y-3"
      style={{
        border: "1px solid rgba(15,20,30,0.05)",
        boxShadow: "0 8px 20px rgba(15,20,30,0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}
        >
          <Activity size={14} strokeWidth={2} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-700">
          Offer Performance
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <motion.div
            key={m.label}
            className="rounded-xl p-3"
            style={{ background: m.bg }}
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <div className="flex items-center gap-1.5">
              <m.Icon size={16} strokeWidth={1.75} style={{ color: m.color }} />
              <motion.span
                className="text-xl font-black"
                style={{ color: m.color }}
                key={String(m.value)}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {m.value}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
      {total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Akzeptanzrate</span>
            <span className="text-xs font-bold" style={{ color: acceptRate >= 50 ? "#166534" : "#E60000" }}>
              {acceptRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-green-500"
              animate={{ width: `${acceptRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
