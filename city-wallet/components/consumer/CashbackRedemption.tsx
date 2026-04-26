"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard } from "lucide-react";
import { generateOfferToken } from "@/lib/wallet-id";

interface CashbackRedemptionProps {
  merchantName: string;
  discountValue: string;
  expiryMinutes: number;
  onClose: () => void;
}

export function CashbackRedemption({ merchantName, discountValue, expiryMinutes, onClose }: CashbackRedemptionProps) {
  const [token] = useState(generateOfferToken);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-3xl overflow-hidden bg-white shadow-offer p-5 space-y-4"
    >
      {done ? (
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
            <Check size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="text-xl font-bold text-gray-900">Gutschrift unterwegs!</p>
          <p className="text-sm text-gray-500">
            {discountValue} werden auf deine Sparkassen-Card gutgeschrieben.
          </p>
          <button onClick={onClose} className="mt-2 text-sm text-sparkasse-red underline">
            Fertig
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: "#22c55e" }}>
              <Check size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold text-gray-900">Angebot aktiviert!</p>
              <p className="text-xs text-gray-500">Gültig bei {merchantName}</p>
            </div>
          </div>

          {/* Simulated Sparkassen-Card */}
          <div
            className="rounded-2xl p-4 text-white space-y-3"
            style={{ background: "linear-gradient(135deg, #E60000 0%, #B30000 100%)" }}
          >
            <p className="text-xs opacity-80 uppercase tracking-wider">Sparkassen-Card</p>
            <p className="text-lg font-mono tracking-widest">•••• •••• •••• 4729</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70">Inhaber</p>
                <p className="text-sm font-semibold">Stadt Wallet Demo</p>
              </div>
              <p className="text-2xl font-black">{discountValue}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 space-y-1">
            <p className="text-sm text-gray-700">
              Zahle einfach mit deiner Sparkassen-Card bei <strong>{merchantName}</strong>.
            </p>
            <p className="text-sm font-semibold text-sparkasse-red">
              {discountValue} werden automatisch zurückgebucht.
            </p>
            <p className="text-xs text-gray-400 mt-1">Token: {token}</p>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full py-3 rounded-2xl text-white font-semibold text-base disabled:opacity-70 transition-all active:scale-95"
            style={{ background: "#E60000", boxShadow: "0 4px 16px rgba(230,0,0,0.35)" }}
          >
            {processing ? "Verarbeite..." : "Jetzt mit Karte zahlen →"}
          </button>

          <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600">
            Abbrechen
          </button>
        </>
      )}
    </motion.div>
  );
}
