"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MENU_ITEMS, type PreOrderItem, createPreOrder } from "@/lib/preorder";
import type { PreOrder } from "@/lib/preorder";

interface PreOrderFlowProps {
  merchantId: string;
  merchantName: string;
  onOrderCreated: (order: PreOrder) => void;
}

export function PreOrderFlow({ merchantId, merchantName, onOrderCreated }: PreOrderFlowProps) {
  const [step, setStep] = useState<"select" | "time" | "confirm" | "done">("select");
  const [selectedItem, setSelectedItem] = useState<PreOrderItem | null>(null);
  const [scheduledTime, setScheduledTime] = useState("15:00");
  const [order, setOrder] = useState<PreOrder | null>(null);

  const menuItems = MENU_ITEMS[merchantId] ?? MENU_ITEMS["cafe-muller"];

  const handleConfirm = () => {
    if (!selectedItem) return;
    const o = createPreOrder(merchantId, merchantName, selectedItem, scheduledTime, "15% OFF");
    setOrder(o);
    onOrderCreated(o);
    setStep("done");
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Pre-Order & Pickup
      </p>

      {step === "select" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Was möchtest du vorbestellen?</p>
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedItem(item); setStep("time"); }}
              className="w-full text-left px-3 py-2.5 rounded-xl border flex items-center gap-3 hover:border-red-200 transition-colors"
              style={{ borderColor: "#E5E7EB" }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">€{item.price.toFixed(2)}</p>
              </div>
              <span className="text-xs text-red-600 font-semibold">15% OFF</span>
            </motion.button>
          ))}
        </div>
      )}

      {step === "time" && selectedItem && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
            <span className="text-2xl">{selectedItem.emoji}</span>
            <div>
              <p className="text-sm font-semibold">{selectedItem.label}</p>
              <p className="text-xs text-green-600 font-semibold">15% OFF → €{(selectedItem.price * 0.85).toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Abholzeit</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep("select")} className="flex-1 py-2 text-sm text-gray-500 rounded-xl border">
              Zurück
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 text-sm text-white rounded-xl font-semibold"
              style={{ background: "#E60000" }}
            >
              Vorbestellen →
            </button>
          </div>
        </div>
      )}

      {step === "done" && order && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-center py-2">
          <span className="text-4xl">✅</span>
          <p className="text-sm font-bold text-gray-900">Vorbestellung bestätigt!</p>
          <p className="text-xs text-gray-500">Abholung um {order.scheduledTime} bei {merchantName}</p>
          <p className="text-xs font-mono text-gray-400">{order.token}</p>
          <button onClick={() => setStep("select")} className="text-xs text-red-600 underline mt-2">
            Neue Vorbestellung
          </button>
        </motion.div>
      )}
    </div>
  );
}
