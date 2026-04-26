"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { generateOfferToken } from "@/lib/wallet-id";

interface QRRedemptionProps {
  merchantName: string;
  discountValue: string;
  expiryMinutes: number;
  onClose: () => void;
}

export function QRRedemption({ merchantName, discountValue, expiryMinutes, onClose }: QRRedemptionProps) {
  const [token] = useState(generateOfferToken);
  const [flipped, setFlipped] = useState(false);

  const qrValue = `citywallet://redeem?token=${token}&merchant=${merchantName}&discount=${discountValue}`;

  return (
    <div className="w-full perspective-1000">
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={() => setFlipped(true)}
      >
        {/* Front — offer summary */}
        <div
          className="w-full rounded-3xl p-5 space-y-3 bg-white shadow-offer"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="font-bold text-gray-900 text-center">QR-Code Einlösen</p>
          <p className="text-sm text-gray-500 text-center">Tippe um QR anzuzeigen</p>
          <div className="text-5xl font-black text-center" style={{ color: "#E60000" }}>
            {discountValue}
          </div>
          <p className="text-sm text-center text-gray-500">bei {merchantName}</p>
          <div className="flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "#E60000" }}
            >
              <span className="text-white text-2xl">📱</span>
            </motion.div>
          </div>
        </div>

        {/* Back — QR Code */}
        <div
          className="absolute inset-0 w-full rounded-3xl p-5 space-y-3 bg-white shadow-offer"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="font-bold text-gray-900 text-center">Zeige das dem Kassierer</p>
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={flipped ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <QRCode value={qrValue} size={160} fgColor="#1A1A1A" bgColor="#FFFFFF" />
            </motion.div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400 font-mono">{token}</p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              ✓ Bereit zum Scannen
            </motion.div>
          </div>
          <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 pt-2">
            Fertig
          </button>
        </div>
      </motion.div>
    </div>
  );
}
