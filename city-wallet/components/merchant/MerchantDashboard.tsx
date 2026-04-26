"use client";
import { Store, TrendingUp, Zap, Wallet } from "lucide-react";
import { QuietHourChart } from "./QuietHourChart";
import { RuleConfigurator } from "./RuleConfigurator";
import { PreOrderQueue } from "./PreOrderQueue";
import type { MerchantRules } from "@/lib/offer-prompt";
import type { PreOrder } from "@/lib/preorder";
import type { MerchantConfig } from "@/config/city.config";

interface MerchantDashboardProps {
  merchant: MerchantConfig;
  hourlyData: { hour: number; tx: number; label: string }[];
  currentHour: number;
  acceptCount: number;
  dismissCount: number;
  revenueRecovered: number;
  offerCount: number;
  rules: MerchantRules;
  onRulesChange: (r: MerchantRules) => void;
  preOrders: PreOrder[];
  offerFiredAt?: number;
  onGenerateOffer?: () => void;
  generating?: boolean;
}

// ─── Design tokens (single source of truth for the merchant tablet UI) ───
const CARD_STYLE: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #EEF0F3",
  boxShadow: "0 1px 2px rgba(15,20,30,0.04), 0 8px 24px rgba(15,20,30,0.04)",
};
const SECTION_TITLE_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 px-1";

export function MerchantDashboard({
  merchant, hourlyData, currentHour,
  acceptCount, dismissCount, revenueRecovered, offerCount,
  rules, onRulesChange, preOrders, offerFiredAt,
  onGenerateOffer, generating = false,
}: MerchantDashboardProps) {
  const total = acceptCount + dismissCount;
  const acceptRate = total > 0 ? Math.round((acceptCount / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* ─── Hero: merchant identity ─── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          ...CARD_STYLE,
          boxShadow: "0 12px 32px rgba(15,20,30,0.10)",
        }}
      >
        <div className="relative w-full" style={{ height: 168 }}>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,#FFE4E6,#FECACA)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 84,
                height: 84,
                background: "rgba(255,255,255,0.55)",
                boxShadow: "inset 0 0 0 1px rgba(230,0,0,0.18)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Store size={40} strokeWidth={1.75} color="#E60000" />
            </div>
          </div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.72) 100%)" }}
          />
          {/* Live status pill */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-gray-800">Live</span>
          </div>
          {/* Bottom title */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Store size={11} strokeWidth={2.2} className="text-white/80" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
                {merchant.category}
              </p>
            </div>
            <h2
              className="text-[26px] font-black text-white"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              {merchant.name}
            </h2>
          </div>
        </div>
      </div>

      {/* ─── Section: Heute im Überblick ─── */}
      <div className="space-y-2">
        <p className={SECTION_TITLE_CLASS}>Heute im Überblick</p>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Live Offers */}
          <div className="rounded-2xl p-3.5" style={CARD_STYLE}>
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "#FFF1F1", color: "#E60000" }}
            >
              <Zap size={14} strokeWidth={2.2} />
            </div>
            <p className="text-[22px] font-black text-gray-900 leading-none" style={{ letterSpacing: "-0.025em" }}>
              {offerCount}
            </p>
            <p className="text-[11px] text-gray-500 font-medium mt-1.5">Live-Offers</p>
          </div>
          {/* Accept rate */}
          <div className="rounded-2xl p-3.5" style={CARD_STYLE}>
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "#ECFDF5", color: "#059669" }}
            >
              <TrendingUp size={14} strokeWidth={2.2} />
            </div>
            <div className="flex items-baseline gap-0.5 leading-none">
              <p className="text-[22px] font-black text-gray-900" style={{ letterSpacing: "-0.025em" }}>
                {acceptRate}
              </p>
              <p className="text-sm font-bold text-gray-400">%</p>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1.5">Akzeptanz</p>
          </div>
          {/* Recovery */}
          <div className="rounded-2xl p-3.5" style={CARD_STYLE}>
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "#FFF1F1", color: "#E60000" }}
            >
              <Wallet size={14} strokeWidth={2.2} />
            </div>
            <p className="text-[22px] font-black text-gray-900 leading-none" style={{ letterSpacing: "-0.025em" }}>
              €{revenueRecovered.toFixed(0)}
            </p>
            <p className="text-[11px] text-gray-500 font-medium mt-1.5">Recovery</p>
          </div>
        </div>
        {/* Slim accept-rate progress as ambient indicator */}
        {total > 0 && (
          <div className="rounded-2xl px-4 py-3" style={CARD_STYLE}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-gray-600">
                {acceptCount} von {total} angenommen
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: acceptRate >= 50 ? "#059669" : "#E60000" }}
              >
                {acceptRate}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${acceptRate}%`,
                  background: acceptRate >= 50
                    ? "linear-gradient(90deg,#10B981,#059669)"
                    : "linear-gradient(90deg,#F87171,#E60000)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Section: Aktivität ─── */}
      <div className="space-y-2">
        <p className={SECTION_TITLE_CLASS}>Aktivität · letzte 24h</p>
        <QuietHourChart
          data={hourlyData}
          currentHour={currentHour}
          offerFiredAt={offerFiredAt}
        />
      </div>

      {/* ─── Section: Konfiguration ─── */}
      <div className="space-y-2">
        <p className={SECTION_TITLE_CLASS}>Kampagne</p>
        <RuleConfigurator initial={rules} onChange={onRulesChange} />
      </div>

      {/* ─── Section: Bestellungen ─── */}
      <div className="space-y-2">
        <p className={SECTION_TITLE_CLASS}>Bestellungen</p>
        <PreOrderQueue orders={preOrders} />
      </div>

      {/* ─── Primary CTA: fire an offer for this merchant ─── */}
      {onGenerateOffer && (
        <button
          onClick={onGenerateOffer}
          disabled={generating}
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-white text-[14px] font-bold transition-opacity disabled:opacity-60"
          style={{
            background: "#E60000",
            boxShadow: "0 8px 22px rgba(230,0,0,0.28), 0 1px 0 rgba(255,255,255,0.18) inset",
            letterSpacing: "-0.01em",
          }}
        >
          <Zap size={16} strokeWidth={2.4} />
          {generating ? "Wird generiert…" : "Angebot generieren"}
        </button>
      )}
    </div>
  );
}
