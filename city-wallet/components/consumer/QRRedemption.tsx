"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas as QRCode } from "qrcode.react";
import { Store } from "lucide-react";
import { generateOfferToken } from "@/lib/wallet-id";

interface QRRedemptionProps {
  merchantName: string;
  discountValue: string;
  expiryMinutes: number;
  onClose: () => void;
}

export function QRRedemption({ merchantName, discountValue, expiryMinutes, onClose }: QRRedemptionProps) {
  const [token] = useState(generateOfferToken);

  const qrValue = `citywallet://redeem?token=${token}&merchant=${merchantName}&discount=${discountValue}`;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop Blur Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />
      
      {/* QR Code Container */}
      <motion.div 
        className="relative bg-white rounded-2xl p-6 space-y-4 mx-4 max-w-sm w-full z-10" 
        style={{
          boxShadow: "0 20px 60px rgba(15,20,30,0.3)"
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <p className="font-bold text-gray-900 text-center">QR-Code Einlösen</p>
        <p className="text-sm text-gray-500 text-center">{merchantName} • {discountValue} Rabatt</p>
        
        <div className="flex justify-center">
          <QRCode value={qrValue} size={160} fgColor="#1A1A1A" bgColor="#FFFFFF" />
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400 font-mono">{token}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Store size={12} className="text-gray-500" strokeWidth={1.5} />
          <p className="text-xs text-gray-500 text-center">Zeige diesen Code an der Kasse vor</p>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3 rounded-xl font-semibold text-white transition-colors"
          style={{ background: "#E60000" }}
        >
          Schließen
        </button>
      </motion.div>
    </div>
  );
}