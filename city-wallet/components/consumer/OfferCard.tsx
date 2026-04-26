"use client";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X, MapPin, Clock } from "lucide-react";
import type { GeneratedOfferUI } from "@/lib/offer-prompt";
import { STUTTGART_CONFIG } from "@/config/city.config";
import { ContextBadges } from "./ContextBadges";
import { CountdownTimer } from "./CountdownTimer";

interface OfferCardProps {
  offer: GeneratedOfferUI;
  weather: { temp: number; condition: string };
  txLabel: string;
  onAccept: () => void;
  onDismiss: () => void;
  onExpire: () => void;
  seasonalTag?: string | null;
}

const COLOR_SCHEMES: Record<string, string> = {
  warm_amber: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
  cool_blue: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
  fresh_green: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
  vibrant_coral: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
};

const SEASONAL_SCHEMES: Record<string, string> = {
  halloween: "linear-gradient(135deg, #1a0a2e 0%, #3d1565 100%)",
  christmas: "linear-gradient(135deg, #0d2b0d 0%, #1a4a1a 100%)",
  summer: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
};

function DiscountCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / 20;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val}%</span>;
}

export function OfferCard({ offer, weather, txLabel, onAccept, onDismiss, onExpire, seasonalTag }: OfferCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const acceptOpacity = useTransform(x, [0, 100], [0, 1]);
  const dismissOpacity = useTransform(x, [-100, 0], [1, 0]);
  const [hintShown, setHintShown] = useState(false);
  const [heroFailed, setHeroFailed] = useState(false);

  const isHalloween = seasonalTag === "halloween";
  const isChristmas = seasonalTag === "christmas";
  const background =
    seasonalTag && SEASONAL_SCHEMES[seasonalTag]
      ? SEASONAL_SCHEMES[seasonalTag]
      : offer.gradientOverride ?? COLOR_SCHEMES[offer.colorScheme] ?? COLOR_SCHEMES.warm_amber;

  const textColor = isHalloween || isChristmas ? "#F9FAFB" : "#1A1A1A";
  const subColor = isHalloween || isChristmas ? "#D1D5DB" : "#6B7280";

  // Hint animation after 8s
  useEffect(() => {
    const t = setTimeout(() => setHintShown(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100 || info.velocity.x > 500) onAccept();
    else if (info.offset.x < -100 || info.velocity.x < -500) onDismiss();
  };

  const discountNum = parseInt(offer.discountValue.replace(/[^0-9]/g, "")) || 15;

  const now = new Date();
  const timeLabel = now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

  // Resolve hero image from city config by merchant name
  const merchantCfg = STUTTGART_CONFIG.merchants.find(
    (m) => m.name === offer.merchantName
  );
  const heroImage = merchantCfg?.heroImage;
  const showHero = !!heroImage && !heroFailed;
  const tagline = merchantCfg?.tagline;
  const distanceLabel =
    offer.distanceMeters != null ? `${Math.round(offer.distanceMeters)} m entfernt` : null;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, background }}
      animate={hintShown ? { x: [0, 18, 0] } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="relative w-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
      aria-label={offer.accessibilityLabel}
      role="article"
    >
      {/* Accept / Dismiss overlays */}
      <motion.div
        style={{ opacity: acceptOpacity }}
        className="absolute inset-0 bg-green-500/20 rounded-3xl z-10 flex items-center justify-end pr-8"
      >
        <Check size={36} className="text-green-500" strokeWidth={3} />
      </motion.div>
      <motion.div
        style={{ opacity: dismissOpacity }}
        className="absolute inset-0 bg-red-500/10 rounded-3xl z-10 flex items-center justify-start pl-8"
      >
        <X size={36} className="text-red-400" strokeWidth={3} />
      </motion.div>

      {/* Hero image header (iOS-style) */}
      {showHero && !isHalloween && !isChristmas && (
        <div className="relative w-full" style={{ height: 160 }}>
          <Image
            src={heroImage as string}
            alt={offer.merchantName}
            fill
            sizes="360px"
            className="object-cover"
            unoptimized
            onError={() => setHeroFailed(true)}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          {/* Floating discount chip */}
          <div className="absolute top-3 right-3">
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full text-white tracking-wide"
              style={{
                background: "rgba(230,0,0,0.95)",
                boxShadow: "0 4px 14px rgba(230,0,0,0.45)",
              }}
            >
              −{discountNum}% LIVE
            </span>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <h2
              className="text-2xl font-black text-white"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.05 }}
            >
              {offer.merchantName}
            </h2>
            {tagline && (
              <p className="text-[11px] text-white/85 mt-0.5 leading-snug line-clamp-1">
                {tagline}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-white/95">
              {distanceLabel && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} strokeWidth={2.2} />
                  {distanceLabel}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={11} strokeWidth={2.2} />
                {timeLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Z:1 — Context badges */}
        <ContextBadges
          temp={weather.temp}
          condition={weather.condition}
          distanceMeters={offer.distanceMeters}
          txLabel={txLabel}
          time={timeLabel}
        />

        {/* Z:2 — Emoji visual (only when no hero image) */}
        {(!showHero || isHalloween || isChristmas) && (
          <div className="flex items-center justify-center py-2">
            <span className="text-6xl" role="img" aria-label={offer.emoji}>
              {offer.emoji}
            </span>
          </div>
        )}

        {/* Z:3 — Headline */}
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: subColor }}>
            {offer.discountReason}
          </p>
          <h2 className="text-xl font-bold leading-tight" style={{ color: textColor }}>
            {offer.headline}
          </h2>
          <p className="text-sm mt-1" style={{ color: subColor }}>
            {offer.subline}
          </p>
        </div>

        {/* Z:4 — Discount value — BIG */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-5xl font-black tracking-tight leading-none"
              style={{ color: isHalloween ? "#a855f7" : isChristmas ? "#22c55e" : "#E60000" }}
            >
              <DiscountCounter target={discountNum} />
              <span className="text-2xl ml-1">% OFF</span>
            </p>
            <p className="text-sm mt-1" style={{ color: subColor }}>
              {offer.merchantName}
            </p>
          </div>
          <CountdownTimer minutes={offer.expiryMinutes} onExpire={onExpire} />
        </div>

        {/* Z:5 — CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={onDismiss}
            className="text-xs px-4 py-3 rounded-2xl text-gray-500 hover:bg-white/40 transition-colors font-semibold"
          >
            Später
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-transform active:scale-[0.98]"
            style={{
              background: isHalloween
                ? "linear-gradient(135deg,#9333ea,#6b21a8)"
                : isChristmas
                ? "linear-gradient(135deg,#16a34a,#15803d)"
                : "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)",
              boxShadow: isHalloween
                ? "0 8px 22px rgba(124,58,237,0.5)"
                : isChristmas
                ? "0 8px 22px rgba(22,163,74,0.4)"
                : "0 10px 26px rgba(230,0,0,0.38), 0 1px 0 rgba(255,255,255,0.25) inset",
            }}
          >
            {offer.cta} →
          </button>
        </div>

        {hintShown && (
          <p className="text-center text-xs text-gray-400 mt-1">← Ablehnen · Annehmen →</p>
        )}
      </div>
    </motion.div>
  );
}
