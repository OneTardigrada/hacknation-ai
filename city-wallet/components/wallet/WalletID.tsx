"use client";
import { useState, useEffect } from "react";
import { createWalletIdentity, type WalletIdentity } from "@/lib/wallet-id";

export function WalletID() {
  const [identity, setIdentity] = useState<WalletIdentity | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cityWalletId") : null;
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      const id = createWalletIdentity();
      if (typeof window !== "undefined") localStorage.setItem("cityWalletId", JSON.stringify(id));
      setIdentity(id);
    }
  }, []);

  if (!identity) return null;

  return (
    <div
      className="rounded-2xl p-4 text-white space-y-2"
      style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
          City Wallet ID
        </p>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[10px] opacity-70">Anonym</span>
        </div>
      </div>
      <p className="text-xl font-black tracking-widest" style={{ color: "#E60000" }}>
        {identity.walletId}
      </p>
      <p className="text-xs opacity-60">{identity.pseudonym}</p>
      <div className="border-t border-white/10 pt-2">
        <p className="text-[9px] opacity-50">
          Kein Name · Keine E-Mail · DSGVO-konform
        </p>
      </div>
    </div>
  );
}
