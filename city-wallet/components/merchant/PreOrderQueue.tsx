"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, ShoppingBag, Check } from "lucide-react";
import type { PreOrder } from "@/lib/preorder";

interface PreOrderQueueProps {
  orders: PreOrder[];
}

const CARD_STYLE: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #EEF0F3",
  boxShadow: "0 1px 2px rgba(15,20,30,0.04), 0 8px 24px rgba(15,20,30,0.04)",
};

// Calmer, more cohesive status palette
const STATUS_META: Record<PreOrder["status"], { dot: string; bg: string; text: string; label: string }> = {
  pending:    { dot: "#F59E0B", bg: "#FEF3C7", text: "#92400E", label: "Neu" },
  confirmed:  { dot: "#3B82F6", bg: "#DBEAFE", text: "#1D4ED8", label: "Bestätigt" },
  ready:      { dot: "#10B981", bg: "#D1FAE5", text: "#065F46", label: "Bereit" },
  picked_up:  { dot: "#9CA3AF", bg: "#F3F4F6", text: "#6B7280", label: "Abgeholt" },
};

export function PreOrderQueue({ orders: initialOrders }: PreOrderQueueProps) {
  const [orders, setOrders] = useState<PreOrder[]>(initialOrders);

  const updateStatus = (id: string, status: PreOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const activeCount = orders.filter((o) => o.status !== "picked_up").length;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={CARD_STYLE}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#FFF1F1", color: "#E60000" }}
          >
            <ShoppingBag size={14} strokeWidth={2.2} />
          </div>
          <p className="text-[12px] font-semibold text-gray-800">Pre-Order Queue</p>
        </div>
        {activeCount > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "#FFF1F1", color: "#E60000" }}
          >
            {activeCount} aktiv
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#F8F9FA", color: "#9CA3AF" }}
          >
            <Inbox size={22} strokeWidth={1.75} />
          </div>
          <p className="text-[12px] text-gray-500 text-center font-medium">
            Derzeit keine neuen Bestellungen.
          </p>
          <p className="text-[10px] text-gray-400 text-center">
            Eingehende Pre-Orders erscheinen hier in Echtzeit.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {orders.map((order) => {
              const sc = STATUS_META[order.status];
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl p-3"
                  style={{
                    background: "#F8F9FA",
                    border: "1px solid #EEF0F3",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">{order.item}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {order.scheduledTime} · <span className="text-gray-700 font-medium">{order.discount}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{order.token}</p>
                    </div>
                    <span
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                      {sc.label}
                    </span>
                  </div>
                  {order.status !== "picked_up" && (
                    <div className="flex gap-1.5">
                      {order.status === "pending" && (
                        <button
                          onClick={() => updateStatus(order.id, "confirmed")}
                          className="flex-1 py-2 text-[11px] rounded-lg text-white font-semibold transition-transform active:scale-[0.97]"
                          style={{ background: "#3B82F6" }}
                        >
                          Bestätigen
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus(order.id, "ready")}
                          className="flex-1 py-2 text-[11px] rounded-lg text-white font-semibold flex items-center justify-center gap-1 transition-transform active:scale-[0.97]"
                          style={{ background: "#10B981" }}
                        >
                          <Check size={12} strokeWidth={2.6} />
                          Fertig zur Abholung
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => updateStatus(order.id, "picked_up")}
                          className="flex-1 py-2 text-[11px] rounded-lg font-semibold transition-transform active:scale-[0.97]"
                          style={{ background: "#FFFFFF", color: "#374151", border: "1px solid #E5E7EB" }}
                        >
                          Als abgeholt markieren
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
