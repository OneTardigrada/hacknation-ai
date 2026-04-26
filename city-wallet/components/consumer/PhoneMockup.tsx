"use client";
// Full PhoneMockup — Pixel home screen → Mylo app with 5 screens
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { LIGHT_STYLE } from "@/lib/map-style";
import {
  Home, Tag, CreditCard, User, MapPin, Signal, Wifi, Battery,
  Coffee, ShoppingBag, Dumbbell, Leaf, Check, X, Pencil,
  ChevronRight, Loader2, Cloud, Sun, CloudRain, CloudSnow,
  MessageCircle, Settings, Shield, TrendingUp,
  Smartphone, Euro, Star, Save, Clock, BadgePercent, Phone as PhoneIcon,
  Camera, Compass, Croissant, Sparkles, UtensilsCrossed, Minus, Plus,
  Heart, Share2, Send, Award, ShoppingBasket,
} from "lucide-react";
import { OfferCard } from "./OfferCard";
import { CashbackRedemption } from "./CashbackRedemption";
import { QRRedemption } from "./QRRedemption";
import type { GeneratedOfferUI } from "@/lib/offer-prompt";
import type { Persona } from "@/lib/personas";
import type { MerchantWithDistance } from "@/lib/geofence";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface UserProfile { name: string; age: string; preferences: string[] }
type AppScreen = "home" | "nearby" | "offers" | "wallet" | "profile";
type RedemptionView = null | "cashback" | "qr";
type PhoneMode = "homescreen" | "app";

const CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  cafe: Coffee,
  bakery: Croissant,
  smoothie: Sparkles,
  restaurant: UtensilsCrossed,
  retail: ShoppingBag,
};

const PREFS = [
  { id: "coffee", label: "Kaffee", Icon: Coffee },
  { id: "bakery", label: "Bäckerei", Icon: ShoppingBag },
  { id: "sport", label: "Sport", Icon: Dumbbell },
  { id: "healthy", label: "Bio", Icon: Leaf },
];

const PHONE_APPS = [
  { name: "Telefon", color: "#1A73E8", Icon: PhoneIcon },
  { name: "Nachrichten", color: "#34A853", Icon: MessageCircle },
  { name: "Kamera", color: "#212529", Icon: Camera },
  { name: "Karten", color: "#EA4335", Icon: MapPin },
  { name: "Mylo", color: "#E60000", Icon: Tag, isMain: true as const },
  { name: "Einstellungen", color: "#5F6368", Icon: Settings },
] as const;

// ─── Helper ─────────────────────────────────────────────────────────────────
function WeatherIcon({ condition, size = 14, color = "#6B7280" }: { condition: string; size?: number; color?: string }) {
  if (condition.includes("rain") || condition.includes("drizzle")) return <CloudRain size={size} color={color} />;
  if (condition.includes("snow")) return <CloudSnow size={size} color={color} />;
  if (condition.includes("cloud") || condition.includes("overcast")) return <Cloud size={size} color={color} />;
  return <Sun size={size} color={color} />;
}

/** True if a merchant has no opening-hours config or the given hour is in [open, close). */
function isMerchantOpen(m: { openingHours?: { open: number; close: number } }, hour: number): boolean {
  const oh = m.openingHours;
  if (!oh) return true;
  return hour >= oh.open && hour < oh.close;
}

/** Image with graceful fallback to a soft red gradient + category icon when the remote image fails to load. */
function ShopImage({ fallbackIcon: FallbackIcon, rounded = "rounded-xl", grayscale = false }: {
  src?: string;
  alt: string;
  sizes: string;
  fallbackIcon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  rounded?: string;
  grayscale?: boolean;
}) {
  // SVG-only design — always render the icon fallback, never load shop images.
  return (
    <div
      className={`absolute inset-0 ${rounded} flex items-center justify-center`}
      style={{ background: "linear-gradient(135deg,#FEE2E2,#FECACA)", filter: grayscale ? "grayscale(85%) saturate(0.6)" : undefined }}
    >
      <FallbackIcon size={20} color="#E60000" strokeWidth={1.75} />
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
}

// ─── Phone home screen ───────────────────────────────────────────────────────
function PhoneHomeScreen({ onOpenApp, hasOffer }: { onOpenApp: () => void; hasOffer: boolean }) {
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dateStr = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      key="homescreen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex flex-col select-none overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* Light geometric wallpaper — abstract pastel shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            top: "-8%", left: "-12%", width: "70%", height: "55%",
            background: "radial-gradient(ellipse at center, rgba(230,0,0,0.10) 0%, rgba(230,0,0,0) 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "30%", right: "-18%", width: "75%", height: "55%",
            background: "radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0) 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%", left: "10%", width: "70%", height: "45%",
            background: "radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, rgba(245,158,11,0) 70%)",
          }}
        />
        {/* Subtle grain */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 100%)",
          }}
        />
      </div>

      {/* Clock — Pixel-style large light type, generous top padding to clear status bar + camera */}
      <div className="flex flex-col items-center pt-28 pb-4 z-10">
        <p className="text-[64px] font-extralight tracking-tight leading-none" style={{ color: "#212529" }}>{timeStr}</p>
        <p className="text-[11px] mt-2 capitalize tracking-wide" style={{ color: "rgba(33,37,41,0.55)" }}>{dateStr}</p>
      </div>

      {/* Minimalist app grid — luxurious gap from clock so icons breathe (Figma-grade) */}
      <div className="flex-1 px-8 z-10 mt-12">
        <div className="grid grid-cols-3 gap-x-4 gap-y-7">
          {PHONE_APPS.map((app) => {
            const isMain = "isMain" in app && app.isMain;
            return (
              <div key={app.name} className="flex flex-col items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => (isMain ? onOpenApp() : undefined)}
                  className="relative rounded-[22px] flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    background: isMain ? "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)" : "#FFFFFF",
                    boxShadow: isMain
                      ? "0 10px 24px rgba(230,0,0,0.32), 0 0 0 1px rgba(230,0,0,0.08)"
                      : "0 4px 14px rgba(15,20,30,0.06), 0 0 0 1px rgba(15,20,30,0.05)",
                    cursor: isMain ? "pointer" : "default",
                  }}
                >
                  {isMain ? (
                    <svg width="26" height="32" viewBox="0 0 12 16" fill="none">
                      <path d="M6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 8.25 2.25 11.1 6 16C9.75 11.1 12 8.25 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0ZM6 2C6.79565 2 7.55871 2.31607 8.12132 2.87868C8.68393 3.44129 9 4.20435 9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.73478 6.89464 4.48043 6.70711 4.29289C6.51957 4.10536 6.26522 4 6 4C5.73478 4 5.48043 4.10536 5.29289 4.29289C5.10536 4.48043 5 4.73478 5 5C5 5.55228 4.55228 6 4 6C3.44772 6 3 5.55228 3 5C3 4.20435 3.31607 3.44129 3.87868 2.87868C4.44129 2.31607 5.20435 2 6 2Z" fill="#FFFFFF"/>
                    </svg>
                  ) : (
                    <app.Icon
                      size={26}
                      color={app.color}
                      strokeWidth={1.75}
                    />
                  )}
                  {isMain && hasOffer && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: "#FFFFFF",
                        boxShadow: "0 0 0 2px #E60000",
                      }}
                    >
                      <span className="text-[8px] font-black" style={{ color: "#E60000" }}>1</span>
                    </motion.div>
                  )}
                </motion.button>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "#212529" }}>{app.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pixel-style search pill removed per S-App CI */}

      {/* Home indicator (Android gesture bar) */}
      <div className="h-6 flex items-center justify-center z-10">
        <div className="w-28 h-1 rounded-full" style={{ background: "rgba(33,37,41,0.18)" }} />
      </div>
    </motion.div>
  );
}

// ─── App Home Screen ─────────────────────────────────────────────────────────
interface AppHomeProps {
  profile: UserProfile;
  initials: string;
  weather: { temp: number; condition: string };
  offer: GeneratedOfferUI | null;
  offerState: string;
  generating: boolean;
  cashbackBalance: number;
  isDark: boolean;
  onNavigateOffers: () => void;
  onNavigateWallet: () => void;
  onNavigateNearby?: () => void;
  merchants?: MerchantWithDistance[];
  radiusMeters?: number;
  hour?: number;
}
function AppHomeScreen({ profile, weather, offer, offerState, generating, cashbackBalance, isDark, onNavigateOffers, onNavigateWallet, onNavigateNearby, merchants = [], radiusMeters, hour = new Date().getHours() }: AppHomeProps) {
  const txt = isDark ? "#F9FAFB" : "#111827";
  const sub = isDark ? "rgba(255,255,255,0.5)" : "#6B7280";
  const card = isDark ? "rgba(255,255,255,0.07)" : "#F9FAFB";
  // Live geofence filter — use raw distance against current radiusMeters so the
  // counters never desync from the slider, even if upstream `inRadius` is stale.
  const inRadiusList = (typeof radiusMeters === "number")
    ? merchants.filter((m) => m.distanceMeters <= radiusMeters)
    : merchants.filter((m) => m.inRadius);
  // The home feed lists nearby shops, but closed ones must not appear here
  // — they are still rendered as grayed pins on the in-app map.
  const openInRadiusList = inRadiusList.filter((m) => isMerchantOpen(m, hour));
  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Greeting */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs font-medium" style={{ color: sub }}>{getGreeting()}</p>
        <h1 className="text-xl font-bold" style={{ color: txt }}>{profile.name}</h1>
      </div>

      {/* Card */}
      <div className="px-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateWallet}
          className="relative w-full h-40 rounded-3xl overflow-hidden text-left"
          style={{ background: "linear-gradient(135deg, #E60000 0%, #A30000 100%)" }}
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 bg-white" />
          <div className="absolute -right-2 top-10 w-18 h-18 rounded-full opacity-10 bg-white" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Sparkasse Mylo</p>
                <p className="text-white font-bold text-base mt-0.5">{profile.name}</p>
              </div>
              <CreditCard size={22} color="rgba(255,255,255,0.8)" />
            </div>
            <div>
              <p className="text-white/40 font-mono text-[10px] tracking-[3px] mb-1.5">•••• •••• •••• 4721</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/50 text-[9px] uppercase tracking-wide">Cashback</p>
                  <p className="text-white font-black text-xl">€{cashbackBalance.toFixed(2)}</p>
                </div>
                <div className="flex gap-0.5 items-center">
                  <div className="w-5 h-5 rounded-full bg-red-300 opacity-70" />
                  <div className="w-5 h-5 rounded-full bg-yellow-300 opacity-70 -ml-2.5" />
                </div>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Offer teaser */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold" style={{ color: txt }}>
            {generating ? "KI analysiert…" : offerState === "ready" ? "Aktives Angebot" : "In deiner Nähe"}
          </p>
          <button onClick={onNavigateNearby ?? onNavigateOffers} className="text-[11px] font-semibold" style={{ color: "#E60000" }}>
            Alle →
          </button>
        </div>

        {generating ? (
          <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: card }}>
            <Loader2 size={16} className="animate-spin shrink-0" style={{ color: "#E60000" }} />
            <p className="text-xs" style={{ color: sub }}>KI generiert dein Angebot…</p>
          </div>
        ) : offerState === "ready" && offer ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateOffers}
            className="w-full rounded-2xl p-3.5 text-left"
            style={{ background: isDark ? "rgba(230,0,0,0.15)" : "#FFF1F2", border: "1px solid rgba(230,0,0,0.25)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                <Tag size={16} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: isDark ? "#FBBF24" : "#E60000" }}>
                  {offer.discountValue} OFF
                </p>
                <p className="text-[10px] truncate" style={{ color: sub }}>
                  {offer.merchantName} · {offer.distanceMeters}m
                </p>
              </div>
              <ChevronRight size={14} style={{ color: "#E60000" }} />
            </div>
          </motion.button>
        ) : (
          <div className="space-y-2">
            {(openInRadiusList.slice(0, 3) as MerchantWithDistance[]).map((m) => {
              const Icon = CATEGORY_ICON[m.category] ?? ShoppingBag;
              return (
                <button
                  key={m.id}
                  onClick={onNavigateNearby}
                  className="w-full rounded-2xl overflow-hidden flex items-center gap-3 text-left"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(15,20,30,0.05)",
                    boxShadow: isDark ? "none" : "0 2px 8px rgba(15,20,30,0.04)",
                  }}
                >
                  <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
                    <ShopImage src={m.heroImage} alt={m.name} sizes="64px" fallbackIcon={Icon} />
                  </div>
                  <div className="flex-1 min-w-0 py-2 pr-2">
                    <p className="text-[12px] font-bold truncate" style={{ color: txt }}>{m.name}</p>
                    <p className="text-[9.5px] truncate mt-0.5" style={{ color: sub }}>{m.tagline ?? m.productFocus}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}>−{m.maxDiscount}%</span>
                      <span className="text-[9px]" style={{ color: sub }}>{Math.round(m.distanceMeters)} m</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="mr-3 shrink-0" style={{ color: "#9CA3AF" }} />
                </button>
              );
            })}
            {inRadiusList.length === 0 && (
              <div className="rounded-xl px-3 py-4 text-center" style={{ background: card }}>
                <p className="text-[10.5px]" style={{ color: sub }}>Keine Shops im aktuellen Radius.</p>
              </div>
            )}
            {inRadiusList.length > 0 && openInRadiusList.length === 0 && (
              <div className="rounded-xl px-3 py-4 text-center" style={{ background: card }}>
                <p className="text-[10.5px]" style={{ color: sub }}>Aktuell sind alle Shops im Radius geschlossen.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {(() => {
          const inRadiusCount = inRadiusList.length;
          // Anzahl der aktuell verfügbaren Angebote im Radius:
          // jedes in-radius Merchant entspricht einem KI-generierbaren Angebot,
          // plus ggf. das aktuell aktive Angebot (offerState === "ready").
          const offerAvailable = (offerState === "ready" && offer) ? 1 : 0;
          const offerCountInRadius = inRadiusCount + offerAvailable;
          return [
            { label: "Gespart", value: `€${cashbackBalance.toFixed(0)}`, Icon: BadgePercent },
            { label: "Angebote", value: String(offerCountInRadius), Icon: Tag },
            { label: "Händler", value: String(inRadiusCount), Icon: MapPin },
          ];
        })().map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: card }}>
            <Icon size={14} className="mx-auto mb-1" style={{ color: "#E60000" }} />
            <p className="text-sm font-bold" style={{ color: txt }}>{value}</p>
            <p className="text-[9px]" style={{ color: sub }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App Offers Screen ───────────────────────────────────────────────────────
interface AppOffersProps {
  offer: GeneratedOfferUI | null;
  offerState: string;
  generating: boolean;
  streamedText: string;
  redemptionView: RedemptionView;
  weather: { temp: number; condition: string };
  txLabel: string;
  isDark: boolean;
  seasonalTag?: string | null;
  onAccept: () => void;
  onDismiss: () => void;
  onExpire: () => void;
  onSwitchToQR: () => void;
  onRedemptionClose: () => void;
  onGenerateNew?: () => void;
  // Feed inputs
  merchants?: MerchantWithDistance[];
  favoriteIds?: Set<string>;
  onToggleFavorite?: (id: string) => void;
  activeFeedOfferId?: string | null;
  onOpenFeedOffer?: (id: string | null) => void;
  onSelectMerchant?: (id: string) => void;
  shareOpen?: boolean;
  onShareToggle?: (open: boolean) => void;
  onShareOffer?: (merchantId?: string) => void;
  radiusMeters?: number;
  hour?: number;
}

// Pre-Order section — placed inside the phone offer detail (was previously on the tablet).
// Lightweight inline component: tap to confirm, shows toast confirmation.
function PreOrderSection({ merchantName }: { merchantName: string }) {
  const [confirmed, setConfirmed] = useState(false);
  const handleClick = () => {
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2400);
  };
  return (
    <div className="mt-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(15,20,30,0.06)" }}>
      <button onClick={handleClick} className="w-full flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.10)" }}>
            <ShoppingBasket size={16} strokeWidth={2} color="#A855F7" />
          </div>
          <div className="text-left">
            <p className="text-[12px] font-black" style={{ color: "#212529", letterSpacing: "-0.01em" }}>Pre-Order abgeben</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(33,37,41,0.55)" }}>Bestelle vorab bei {merchantName} – ohne Wartezeit.</p>
          </div>
        </div>
        <ChevronRight size={14} style={{ color: "rgba(33,37,41,0.45)" }} />
      </button>
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#22c55e" }}>
                  <Check size={14} className="text-white" strokeWidth={2.6} />
                </div>
                <div>
                  <p className="text-[11px] font-black" style={{ color: "#15803d" }}>Pre-Order gesendet</p>
                  <p className="text-[10px]" style={{ color: "rgba(21,128,61,0.75)" }}>Bereit zur Abholung in ~10 Min.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppOffersScreen({ offer, offerState, generating, streamedText, redemptionView, weather, txLabel, isDark, seasonalTag, onAccept, onDismiss, onExpire, onSwitchToQR, onRedemptionClose, onGenerateNew, merchants = [], favoriteIds, onToggleFavorite, activeFeedOfferId, onOpenFeedOffer, onSelectMerchant, shareOpen, onShareToggle, onShareOffer, radiusMeters, hour = new Date().getHours() }: AppOffersProps) {
  const txt = isDark ? "#F9FAFB" : "#111827";
  const sub = isDark ? "rgba(255,255,255,0.5)" : "#6B7280";
  // Strict live geofence — filter on raw distance vs. current radiusMeters.
  const inRadius = (typeof radiusMeters === "number")
    ? merchants.filter((m) => m.distanceMeters <= radiusMeters)
    : merchants.filter((m) => m.inRadius);
  // The offers feed only surfaces shops that are currently open.
  const openInRadius = inRadius.filter((m) => isMerchantOpen(m, hour));
  const activeFeedMerchant = openInRadius.find((m) => m.id === activeFeedOfferId) ?? null;

  if (activeFeedMerchant) {
    const Icon = CATEGORY_ICON[activeFeedMerchant.category] ?? ShoppingBag;
    const isFav = favoriteIds?.has(activeFeedMerchant.id);
    const FRIENDS = [
      { id: "f1", initials: "JM", name: "Jonas", color: "#3B82F6" },
      { id: "f2", initials: "LB", name: "Lara", color: "#A855F7" },
      { id: "f3", initials: "TH", name: "Tom", color: "#10B981" },
    ];
    return (
      <div className="h-full overflow-y-auto pb-8">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <button
            onClick={() => onOpenFeedOffer?.(null)}
            className="flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: "#212529" }}
          >
            <ChevronRight size={14} className="rotate-180" />
            Angebote
          </button>
          <button
            onClick={() => onToggleFavorite?.(activeFeedMerchant.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: isFav ? "rgba(230,0,0,0.10)" : "#F1F3F5" }}
            aria-label="Favorit"
          >
            <Heart size={16} strokeWidth={2} fill={isFav ? "#E60000" : "transparent"} color={isFav ? "#E60000" : "#212529"} />
          </button>
        </div>
        <div className="px-5">
          <div className="rounded-2xl px-6 py-6" style={{ background: "#FFFFFF", border: "1px solid rgba(15,20,30,0.06)", boxShadow: "0 4px 14px rgba(15,20,30,0.06)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(230,0,0,0.10)" }}>
                <Icon size={20} strokeWidth={1.9} color="#E60000" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(33,37,41,0.5)" }}>{activeFeedMerchant.category}</p>
                <p className="text-[16px] font-black truncate" style={{ color: "#212529", letterSpacing: "-0.01em" }}>{activeFeedMerchant.name}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[44px] font-black leading-none" style={{ color: "#E60000", letterSpacing: "-0.03em" }}>−{activeFeedMerchant.maxDiscount}%</span>
              <span className="text-[11px] font-bold" style={{ color: "rgba(33,37,41,0.55)" }}>Welcome-Rabatt</span>
            </div>
            <p className="text-[13px] leading-relaxed mt-3" style={{ color: "#212529" }}>
              {activeFeedMerchant.tagline ?? `Exklusiver Rabatt für deinen ${activeFeedMerchant.productFocus}.`}
            </p>
            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="rounded-xl px-3 py-2.5" style={{ background: "#F8F9FA" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(33,37,41,0.5)" }}>Distanz</p>
                <p className="text-[12px] font-black mt-0.5" style={{ color: "#212529" }}>{Math.round(activeFeedMerchant.distanceMeters)} m</p>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: "#F8F9FA" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(33,37,41,0.5)" }}>Gültig</p>
                <p className="text-[12px] font-black mt-0.5" style={{ color: "#212529" }}>15 min</p>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: "#F8F9FA" }}>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(33,37,41,0.5)" }}>Fokus</p>
                <p className="text-[11px] font-bold mt-0.5 truncate" style={{ color: "#212529" }}>{activeFeedMerchant.productFocus}</p>
              </div>
            </div>
            <button
              onClick={() => { onSelectMerchant?.(activeFeedMerchant.id); onGenerateNew?.(); onOpenFeedOffer?.(null); }}
              className="w-full mt-6 py-3.5 rounded-2xl text-white text-[13px] font-bold flex items-center justify-center gap-2"
              style={{ background: "#E60000", boxShadow: "0 4px 14px rgba(230,0,0,0.25)" }}
            >
              Angebot einlösen
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          </div>
          <div className="mt-6 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(15,20,30,0.06)" }}>
            <button onClick={() => onShareToggle?.(!shareOpen)} className="w-full flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(230,0,0,0.08)" }}>
                  <Share2 size={16} strokeWidth={2} color="#E60000" />
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-black" style={{ color: "#212529", letterSpacing: "-0.01em" }}>Mit Freund teilen</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(33,37,41,0.55)" }}>Empfehle dieses Angebot über die S-App.</p>
                </div>
              </div>
              <ChevronRight size={14} className={shareOpen ? "rotate-90 transition-transform" : "transition-transform"} style={{ color: "rgba(33,37,41,0.45)" }} />
            </button>
            <AnimatePresence>
              {shareOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-6 pb-6 pt-1 space-y-2.5">
                    {FRIENDS.map((f) => (
                      <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: "#F8F9FA" }}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black" style={{ background: f.color, boxShadow: "0 2px 6px rgba(15,20,30,0.12)" }}>
                            {f.initials}
                          </div>
                          <span className="text-[12px] font-semibold truncate" style={{ color: "#212529" }}>{f.name}</span>
                        </div>
                        <button onClick={() => onShareOffer?.(activeFeedMerchant.id)} className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white flex items-center gap-1" style={{ background: "#E60000" }}>
                          <Send size={10} strokeWidth={2.4} />
                          Senden
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pre-Order section — placed below share, native to phone (moved off tablet) */}
          <PreOrderSection merchantName={activeFeedMerchant.name} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-5 pt-5 pb-8">
      <div className="flex items-center justify-between mb-1 px-1">
        <h1 className="text-[22px] font-black" style={{ color: "#212529", letterSpacing: "-0.01em" }}>Angebote</h1>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}>
          {inRadius.length} Live
        </span>
      </div>
      <p className="text-[11px] mb-5 px-1" style={{ color: "rgba(33,37,41,0.55)" }}>Persönliche Angebote in deiner Nähe.</p>

      <AnimatePresence mode="wait">
        {generating && !offer && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-3xl p-6 text-center space-y-3" style={{ background: "#FFFFFF", border: "1px solid rgba(15,20,30,0.06)" }}>
              <Loader2 size={28} className="animate-spin mx-auto" style={{ color: "#E60000" }} />
              <p className="text-xs font-medium" style={{ color: txt }}>KI generiert dein Angebot...</p>
              {streamedText && (
                <p className="text-[10px] font-mono text-gray-400 break-all leading-relaxed">
                  {streamedText.slice(0, 100)}<span className="animate-pulse">|</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
        {redemptionView === "cashback" && offer && (
          <motion.div key="cashback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CashbackRedemption merchantName={offer.merchantName} discountValue={offer.discountValue} expiryMinutes={offer.expiryMinutes} onClose={onRedemptionClose} />
            <button onClick={onSwitchToQR} className="w-full text-center text-[11px] text-gray-400 mt-2 py-2">Lieber QR-Code →</button>
          </motion.div>
        )}
        {redemptionView === "qr" && offer && (
          <motion.div key="qr" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <QRRedemption merchantName={offer.merchantName} discountValue={offer.discountValue} expiryMinutes={offer.expiryMinutes} onClose={onRedemptionClose} />
          </motion.div>
        )}
        {!generating && offer && offerState === "ready" && !redemptionView && (
          <motion.div key="offer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2 px-1" style={{ color: "#E60000" }}>Aktiv</p>
            <OfferCard offer={offer} weather={weather} txLabel={txLabel} onAccept={onAccept} onDismiss={onDismiss} onExpire={onExpire} seasonalTag={seasonalTag} currentHour={hour} />
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em] mt-2 mb-3 px-1" style={{ color: "rgba(33,37,41,0.5)" }}>Inbox</p>
      {openInRadius.length === 0 ? (
        <div className="text-center py-10 px-6 rounded-2xl" style={{ background: "#F8F9FA", border: "1px solid rgba(15,20,30,0.04)" }}>
          <Tag size={22} strokeWidth={1.75} className="mx-auto mb-2" style={{ color: "rgba(33,37,41,0.4)" }} />
          <p className="text-xs font-semibold" style={{ color: "#212529" }}>Keine offenen Angebote</p>
          <p className="text-[10.5px] mt-1.5" style={{ color: "rgba(33,37,41,0.55)" }}>{inRadius.length === 0 ? "Vergrößere deinen Radius im Nearby-Tab." : "Aktuell sind alle Shops im Radius geschlossen."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {openInRadius.map((m) => {
            const Icon = CATEGORY_ICON[m.category] ?? ShoppingBag;
            const isFav = favoriteIds?.has(m.id);
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => onOpenFeedOffer?.(m.id)}
                className="w-full text-left rounded-2xl"
                style={{ background: "#FFFFFF", border: "1px solid rgba(15,20,30,0.06)", boxShadow: "0 2px 8px rgba(15,20,30,0.04)" }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(230,0,0,0.08)" }}>
                      <Icon size={17} strokeWidth={1.9} color="#E60000" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-black truncate" style={{ color: "#212529", letterSpacing: "-0.01em" }}>{m.name}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0" style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}>−{m.maxDiscount}%</span>
                      </div>
                      <p className="text-[10.5px] truncate mt-0.5" style={{ color: "rgba(33,37,41,0.55)" }}>{m.tagline ?? m.productFocus}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[9.5px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#F1F3F5", color: "#212529" }}>
                          <MapPin size={9} strokeWidth={2.2} />
                          {Math.round(m.distanceMeters)} m
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(m.id); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onToggleFavorite?.(m.id); } }}
                          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                          style={{ background: isFav ? "rgba(230,0,0,0.08)" : "transparent" }}
                          aria-label="Favorit"
                        >
                          <Heart size={13} strokeWidth={2} fill={isFav ? "#E60000" : "transparent"} color={isFav ? "#E60000" : "#9CA3AF"} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {offerState === "dismissed" && !redemptionView && (
        <div className="text-center py-8 mt-4">
          <p className="text-xs" style={{ color: sub }}>Letztes Angebot abgelehnt.</p>
          <button onClick={onGenerateNew} className="mt-3 px-5 py-2 rounded-2xl text-white text-[11px] font-semibold" style={{ background: "#E60000" }}>Neues Angebot suchen</button>
        </div>
      )}
      {offerState === "expired" && !redemptionView && (
        <div className="text-center py-8 mt-4">
          <p className="text-xs" style={{ color: sub }}>Letztes Angebot abgelaufen.</p>
          <button onClick={onGenerateNew} className="mt-3 px-5 py-2 rounded-2xl text-white text-[11px] font-semibold" style={{ background: "#E60000" }}>Neu suchen</button>
        </div>
      )}
    </div>
  );
}


// ─── App Wallet Screen ───────────────────────────────────────────────────────
export interface WalletTransaction {
  id: string;
  merchant: string;
  amount: string;     // pre-formatted, e.g. "−€3.80"
  cashback: string;   // pre-formatted, e.g. "+€0.57"
  time: string;       // human, e.g. "Heute, 10:23"
  category?: "cafe" | "bakery" | "smoothie" | "restaurant" | "retail";
}
const CATEGORY_ICON_WALLET: Record<string, typeof Coffee> = {
  cafe: Coffee, bakery: ShoppingBag, smoothie: Dumbbell, restaurant: ShoppingBag, retail: ShoppingBag,
};
function AppWalletScreen({ profile, cashbackBalance, isDark, transactions }: { profile: UserProfile; cashbackBalance: number; isDark: boolean; transactions?: WalletTransaction[] }) {
  const txt = isDark ? "#F9FAFB" : "#111827";
  const sub = isDark ? "rgba(255,255,255,0.5)" : "#6B7280";
  const card = isDark ? "rgba(255,255,255,0.07)" : "#F9FAFB";
  const DEFAULT_TXNS: WalletTransaction[] = [
    { id: "t1", merchant: "Café Müller", amount: "−€3.80", cashback: "+€0.57", time: "Heute, 10:23", category: "cafe" },
    { id: "t2", merchant: "GreenBoost Bar", amount: "−€7.00", cashback: "+€1.05", time: "Gestern, 09:11", category: "smoothie" },
    { id: "t3", merchant: "Stadtbäckerei", amount: "−€2.30", cashback: "+€0.35", time: "Mo, 12:45", category: "bakery" },
  ];
  const list: WalletTransaction[] = (transactions && transactions.length > 0) ? transactions : DEFAULT_TXNS;
  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 pt-3 pb-4">
        <div className="relative h-40 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #E60000 0%, #A30000 100%)" }}>
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-15 bg-white" />
          <div className="absolute -right-2 top-12 w-20 h-20 rounded-full opacity-10 bg-white" />
          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/55 text-[9px] uppercase tracking-widest">Sparkasse Mylo</p>
                <p className="text-white font-bold text-sm mt-0.5">{profile.name}</p>
              </div>
              <CreditCard size={20} color="rgba(255,255,255,0.8)" />
            </div>
            <div>
              <p className="text-white/35 font-mono text-[10px] tracking-[3px] mb-1">•••• •••• •••• 4721</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/45 text-[9px] uppercase tracking-wide">Cashback Guthaben</p>
                  <p className="text-white font-black text-2xl">€{cashbackBalance.toFixed(2)}</p>
                </div>
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded-full bg-red-300 opacity-75" />
                  <div className="w-4 h-4 rounded-full bg-yellow-300 opacity-75 -ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4">
        <p className="text-xs font-bold mb-2" style={{ color: txt }}>Letzte Transaktionen</p>
        <div className="space-y-2">
          {list.map((tx) => {
            const Icon = CATEGORY_ICON_WALLET[tx.category ?? ""] ?? ShoppingBag;
            return (
              <div key={tx.id} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: card }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6" }}>
                  <Icon size={16} style={{ color: "#6B7280" }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: txt }}>{tx.merchant}</p>
                  <p className="text-[9px]" style={{ color: sub }}>{tx.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: txt }}>{tx.amount}</p>
                  <p className="text-[10px] font-semibold text-green-500">{tx.cashback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── App Profile Screen ───────────────────────────────────────────────────────
interface AppProfileProps {
  profile: UserProfile;
  draftProfile: UserProfile;
  setDraftProfile: (fn: (p: UserProfile) => UserProfile) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
  onSave: () => void;
  isDark: boolean;
  onHome: () => void;
  sharedCount?: number;
}
function AppProfileScreen({ profile, draftProfile, setDraftProfile, editingProfile, setEditingProfile, onSave, isDark, onHome, sharedCount = 0 }: AppProfileProps) {
  const txt = isDark ? "#F9FAFB" : "#111827";
  const sub = isDark ? "rgba(255,255,255,0.45)" : "#6B7280";
  const card = isDark ? "rgba(255,255,255,0.07)" : "#F9FAFB";
  const initials = draftProfile.name.split(" ").map((n) => n[0] ?? "").join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-full overflow-y-auto pb-6 px-4">
      <div className="pt-3 pb-2 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-1 text-[11px]" style={{ color: "#E60000" }}>
          <Home size={11} /><span>Home</span>
        </button>
        <button
          onClick={() => editingProfile ? onSave() : setEditingProfile(true)}
          className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: editingProfile ? "#E60000" : isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6", color: editingProfile ? "white" : txt }}
        >
          {editingProfile ? <><Save size={11} />Speichern</> : <><Pencil size={11} />Bearbeiten</>}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #E60000, #A30000)" }}>
          <span className="text-xl font-black text-white">{initials || "CW"}</span>
        </div>
        {!editingProfile && (
          <>
            <p className="text-sm font-bold" style={{ color: txt }}>{profile.name}</p>
            <p className="text-[10px]" style={{ color: sub }}>{profile.age} Jahre · Mylo</p>
          </>
        )}
      </div>

      {/* Fields */}
      <div className="rounded-2xl overflow-hidden mb-3" style={{ background: card }}>
        <div className="px-3 py-2.5 flex items-center gap-2.5 border-b" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}>
          <User size={13} style={{ color: sub }} />
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-wider" style={{ color: sub }}>Name</p>
            {editingProfile ? (
              <input value={draftProfile.name} onChange={(e) => setDraftProfile((p) => ({ ...p, name: e.target.value }))} className="text-xs font-medium bg-transparent outline-none w-full" style={{ color: txt }} />
            ) : (
              <p className="text-xs font-medium" style={{ color: txt }}>{profile.name}</p>
            )}
          </div>
        </div>
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <Star size={13} style={{ color: sub }} />
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-wider" style={{ color: sub }}>Alter</p>
            {editingProfile ? (
              <input type="number" value={draftProfile.age} onChange={(e) => setDraftProfile((p) => ({ ...p, age: e.target.value }))} className="text-xs font-medium bg-transparent outline-none w-full" style={{ color: txt }} />
            ) : (
              <p className="text-xs font-medium" style={{ color: txt }}>{profile.age} Jahre</p>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-0.5" style={{ color: sub }}>Interessen</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PREFS.map(({ id, label, Icon }) => {
          const active = draftProfile.preferences.includes(id);
          return (
            <button
              key={id}
              onClick={() => {
                if (!editingProfile) return;
                setDraftProfile((p) => ({
                  ...p,
                  preferences: active ? p.preferences.filter((x) => x !== id) : [...p.preferences, id],
                }));
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
              style={{
                background: active ? "#FFF1F2" : card,
                borderColor: active ? "#E60000" : isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB",
                opacity: editingProfile ? 1 : active ? 1 : 0.55,
                cursor: editingProfile ? "pointer" : "default",
              }}
            >
              <Icon size={13} style={{ color: active ? "#E60000" : "#9CA3AF" }} />
              <span className="text-[11px] font-medium" style={{ color: active ? "#E60000" : txt }}>{label}</span>
              {active && <Check size={11} style={{ color: "#E60000" }} className="ml-auto" />}
            </button>
          );
        })}
      </div>

      {/* Privacy */}
      <div className="rounded-2xl px-3 py-2.5 flex items-center gap-2" style={{ background: isDark ? "rgba(34,197,94,0.1)" : "#F0FDF4" }}>
        <Shield size={12} className="text-green-500 shrink-0" />
        <p className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#6B7280" }}>
          Kein Name oder E-Mail gespeichert. DSGVO-konform.
        </p>
      </div>

      {/* Gamification — shared offers + Local Hero badge */}
      <p className="text-[10px] font-semibold uppercase tracking-wider mt-4 mb-2 px-0.5" style={{ color: sub }}>City Status</p>
      <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: card, border: sharedCount >= 5 ? "1px solid #E60000" : "1px solid transparent" }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: sharedCount >= 5 ? "#E60000" : "rgba(230,0,0,0.08)" }}>
          {sharedCount >= 5
            ? <Award size={18} color="#FFFFFF" strokeWidth={2} />
            : <Share2 size={16} color="#E60000" strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold" style={{ color: txt }}>
            {sharedCount >= 5 ? "Local Hero" : "Geteilte Angebote"}
          </p>
          <p className="text-[10px]" style={{ color: sub }}>
            {sharedCount >= 5
              ? `Du hilfst Wien sparen — ${sharedCount} Angebote geteilt`
              : `${sharedCount} Angebote geteilt · noch ${Math.max(0, 5 - sharedCount)} bis Local Hero`}
          </p>
        </div>
        <span className="text-[14px] font-black" style={{ color: "#E60000" }}>{sharedCount}</span>
      </div>
    </div>
  );
}

// ─── App Nearby Screen ───────────────────────────────────────────────
interface AppNearbyProps {
  merchants: MerchantWithDistance[];
  userLat: number;
  userLon: number;
  radiusMeters: number;
  onRadiusChange?: (m: number) => void;
  onSelectMerchant?: (id: string) => void;
  onOpenOffer?: () => void;
  hour?: number;
  activeMerchantId?: string | null;
}
function InAppMap({ merchants, userLat, userLon, radiusMeters, hour, activeMerchantId }: { merchants: MerchantWithDistance[]; userLat: number; userLon: number; radiusMeters: number; hour: number; activeMerchantId?: string | null; }) {
  // Same VISUAL framing as the big map: the geofence ring fills ~70% of the
  // mini-canvas, guaranteeing all in-radius merchants are visible. The phone
  // canvas is only ~280×280px, so we can't always use the big map's default
  // zoom 16.4 — at radius ≥ 250m the ring would extend past the canvas and
  // markers would clip out of view (which is the bug the user is seeing).
  const CANVAS = 280; // px (height & width of mini-map)
  const targetRingPx = CANVAS * 0.85; // 85% canvas → ring dominates view, mirrors big-map framing
  const targetMetersPerPx = radiusMeters / (targetRingPx / 2);
  const mPerPxAtLat = (z: number) =>
    (156543.03392 * Math.cos((userLat * Math.PI) / 180)) / Math.pow(2, z);
  const fitZoom = Math.log2(
    (156543.03392 * Math.cos((userLat * Math.PI) / 180)) / targetMetersPerPx,
  );
  // Clamp: never zoom in past the big map's default; never below 13.
  const zoom = Math.max(13, Math.min(16.4, fitZoom));

  const viewState = {
    longitude: userLon,
    latitude: userLat,
    zoom,
    bearing: 0,
    pitch: 0,
  };

  // Pixel size of the geofence ring at this zoom
  const radiusPx = radiusMeters / mPerPxAtLat(zoom);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: "100%",
        height: CANVAS,
        boxShadow: "inset 0 0 0 1px rgba(15,20,30,0.06)",
      }}
    >
      <Map
        mapStyle={LIGHT_STYLE}
        {...viewState}
        interactive={false}
        attributionControl={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* Branded category pins — exact same visual language as MapboardView's MapPin2.
            Show ALL merchants (no radius prefilter) — closed ones rendered grey,
            matching the big map 1:1. */}
        {merchants.map((m) => {
          const open = isMerchantOpen(m, hour);
          const isActive = m.id === activeMerchantId;
          const Icon = CATEGORY_ICON[m.category] ?? ShoppingBag;
          const fill = isActive ? "#E60000" : "#FFFFFF";
          const stroke = isActive ? "#FFFFFF" : "#212529";
          // Phone canvas is ~⅔ the desktop pin density; keep MapPin2 ratios but scaled.
          const size = isActive ? 32 : 28;
          return (
            <Marker key={m.id} longitude={m.lon} latitude={m.lat} anchor="bottom" pitchAlignment="viewport">
              <div
                className="relative flex flex-col items-center"
                style={{
                  pointerEvents: "none",
                  opacity: open ? 1 : 0.38,
                  filter: open ? "none" : "grayscale(85%) saturate(0.6)",
                  transform: `scale(${isActive ? 1.12 : 1})`,
                  transformOrigin: "bottom center",
                  transition: "transform 220ms cubic-bezier(.2,.7,.2,1)",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: size,
                    height: size,
                    background: fill,
                    boxShadow: isActive
                      ? "0 8px 18px rgba(230,0,0,0.35), 0 0 0 1.5px rgba(255,255,255,0.85)"
                      : "0 5px 14px rgba(15,20,30,0.18), 0 0 0 1px rgba(15,20,30,0.06)",
                  }}
                >
                  <Icon size={size * 0.46} strokeWidth={1.75} color={stroke} />
                </div>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    marginTop: -2.5,
                    background: fill,
                    transform: "rotate(45deg)",
                    boxShadow: isActive ? "2px 2px 3px rgba(230,0,0,0.30)" : "2px 2px 3px rgba(15,20,30,0.10)",
                  }}
                />
                {/* Merchant name label — same as the big map */}
                <div
                  className="mt-1 text-[8px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "#E60000" : "rgba(255,255,255,0.97)",
                    color: isActive ? "#fff" : "#212529",
                    boxShadow: isActive
                      ? "0 5px 12px rgba(230,0,0,0.32)"
                      : "0 3px 10px rgba(15,20,30,0.10), 0 0 0 1px rgba(15,20,30,0.05)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.name}
                </div>
              </div>
            </Marker>
          );
        })}

        <Marker longitude={userLon} latitude={userLat} anchor="center" pitchAlignment="viewport">
          <div className="relative" style={{ pointerEvents: "none" }}>
            <motion.span
              className="absolute rounded-full"
              style={{ left: "50%", top: "50%", translate: "-50% -50%", width: 36, height: 36, background: "rgba(230,0,0,0.20)" }}
              animate={{ scale: [0.5, 1, 0.5], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
            <span
              className="absolute rounded-full"
              style={{ left: "50%", top: "50%", translate: "-50% -50%", width: 18, height: 18, background: "#FFFFFF", boxShadow: "0 4px 12px rgba(15,20,30,0.22)" }}
            />
            <span
              className="absolute rounded-full"
              style={{ left: "50%", top: "50%", translate: "-50% -50%", width: 10, height: 10, background: "#E60000" }}
            />
          </div>
        </Marker>
      </Map>

      {/* Geofence ring overlay (centered on canvas) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: radiusPx * 2,
          height: radiusPx * 2,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(230,0,0,0.04) 60%, rgba(230,0,0,0.10) 100%)",
          border: "1.5px dashed rgba(230,0,0,0.55)",
        }}
      />

      {/* Radius chip */}
      <div
        className="absolute top-3 left-3 rounded-full px-3 py-1.5 flex items-center gap-1.5"
        style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 12px rgba(15,20,30,0.10)", border: "1px solid rgba(15,20,30,0.05)" }}
      >
        <Compass size={11} strokeWidth={2} style={{ color: "#E60000" }} />
        <span className="text-[10px] font-bold" style={{ color: "#212529" }}>{radiusMeters} m</span>
      </div>

      {/* Mylo badge */}
      <div
        className="absolute top-3 right-3 rounded-full px-2.5 py-1 flex items-center gap-1"
        style={{ background: "rgba(230,0,0,0.95)", boxShadow: "0 4px 10px rgba(230,0,0,0.30)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="text-[9px] font-bold tracking-wide text-white">LIVE</span>
      </div>
    </div>
  );
}

function AppNearbyScreen({ merchants, userLat, userLon, radiusMeters, onRadiusChange, onSelectMerchant, onOpenOffer, hour = new Date().getHours(), activeMerchantId }: AppNearbyProps) {
  // Strict geofence: re-derive on every render from raw distance vs. current radius.
  const inRadius = merchants.filter((m) => m.distanceMeters <= radiusMeters);
  // Closed shops are still rendered on the map (grayed) but are removed from
  // the list — it's confusing to surface a closed shop as a tappable card.
  const openInRadius = inRadius.filter((m) => isMerchantOpen(m, hour));
  return (
    <div className="h-full overflow-y-auto pb-8">
      <div className="px-6 pt-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(33,37,41,0.5)" }}>In deiner Nähe</p>
        <h1 className="text-[22px] font-black mt-1 leading-tight" style={{ color: "#212529", letterSpacing: "-0.01em" }}>
          {openInRadius.length} geöffnet{openInRadius.length === 1 ? "" : "e"} Shop{openInRadius.length === 1 ? "" : "s"}
        </h1>
        <p className="text-[11px] mt-1" style={{ color: "rgba(33,37,41,0.55)" }}>
          {inRadius.length} im Radius · Live aktualisiert
        </p>
      </div>

      {/* Detailed map */}
      <div className="px-5 mb-5">
        <InAppMap merchants={merchants} userLat={userLat} userLon={userLon} radiusMeters={radiusMeters} hour={hour} activeMerchantId={activeMerchantId} />
      </div>

      {/* Radius control — 1:1 match with the big map (same min/max/step,
          identical floating-slider visual: just label, slider, live value). */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(15,20,30,0.06)",
            boxShadow: "0 6px 18px rgba(15,20,30,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
            color: "#212529",
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] whitespace-nowrap" style={{ color: "rgba(33,37,41,0.55)" }}>Radius</span>
          <input
            type="range"
            min={50}
            max={1500}
            step={10}
            value={radiusMeters}
            onChange={(e) => onRadiusChange?.(parseInt(e.target.value, 10))}
            className="flex-1 accent-red-600"
          />
          <span className="text-[11px] font-bold font-mono w-14 text-right" style={{ color: "#E60000" }}>
            {radiusMeters} m
          </span>
        </div>
      </div>

      {/* Section header */}
      <div className="px-6 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(33,37,41,0.5)" }}>
          Shops im Radius
        </p>
      </div>

      {/* Image-less S-App style shop list */}
      <div className="px-5 space-y-3">
        {openInRadius.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl" style={{ background: "#F8F9FA", border: "1px solid rgba(15,20,30,0.04)" }}>
            <MapPin size={22} strokeWidth={1.75} className="mx-auto mb-2.5" style={{ color: "rgba(33,37,41,0.4)" }} />
            <p className="text-xs font-semibold" style={{ color: "#212529" }}>
              {inRadius.length === 0 ? "Keine Shops im Radius" : "Aktuell alle Shops geschlossen"}
            </p>
            <p className="text-[10.5px] mt-1.5 leading-relaxed" style={{ color: "rgba(33,37,41,0.55)" }}>
              {inRadius.length === 0
                ? "Vergrößere den Suchradius, um mehr Angebote zu sehen."
                : "Komm später wieder oder vergrößere den Suchradius."}
            </p>
          </div>
        ) : (
          openInRadius.map((m) => {
            const Icon = CATEGORY_ICON[m.category] ?? ShoppingBag;
            return (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.985 }}
                onClick={() => { onSelectMerchant?.(m.id); onOpenOffer?.(); }}
                className="w-full text-left rounded-2xl"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,20,30,0.06)",
                  boxShadow: "0 2px 8px rgba(15,20,30,0.04)",
                }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(230,0,0,0.08)" }}
                      >
                        <Icon size={16} strokeWidth={1.9} color="#E60000" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black truncate" style={{ color: "#212529", letterSpacing: "-0.01em" }}>{m.name}</p>
                        <p className="text-[10px] truncate mt-0.5" style={{ color: "rgba(33,37,41,0.55)" }}>{m.tagline ?? m.productFocus}</p>
                      </div>
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0"
                      style={{ background: "#F1F3F5", color: "#212529" }}
                    >
                      <MapPin size={9} strokeWidth={2.2} />
                      {Math.round(m.distanceMeters)} m
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2.5 border-t" style={{ borderColor: "rgba(15,20,30,0.05)" }}>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-md"
                      style={{ background: "rgba(230,0,0,0.08)", color: "#E60000" }}
                    >
                      bis −{m.maxDiscount}%
                    </span>
                    <span
                      className="text-[10.5px] font-bold px-4 py-1.5 rounded-full text-white flex items-center gap-1.5"
                      style={{ background: "#E60000", boxShadow: "0 2px 6px rgba(230,0,0,0.20)" }}
                    >
                      Angebot ansehen <ChevronRight size={11} strokeWidth={2.4} />
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────

interface PhoneMockupProps {
  offer: GeneratedOfferUI | null;
  offerState: string;
  weather: { temp: number; condition: string };
  txLabel: string;
  onAccept: () => void;
  onDismiss: () => void;
  onExpire: () => void;
  generating: boolean;
  streamedText: string;
  persona: Persona;
  seasonalTag?: string | null;
  onGenerateNew?: () => void;
  onProfileChange?: (name: string, age: string, prefs: string[]) => void;
  cashbackBalance?: number;
  /** Live merchants annotated with distance + inRadius for in-app Nearby tab. */
  merchants?: MerchantWithDistance[];
  userLat?: number;
  userLon?: number;
  radiusMeters?: number;
  onRadiusChange?: (m: number) => void;
  onSelectMerchant?: (id: string) => void;
  /** Live wallet feed; if empty/undefined, demo defaults are shown. */
  transactions?: WalletTransaction[];
  /** Number of offers the user has shared with friends (gamification). */
  sharedCount?: number;
  /** Called every time the user taps „An Freunde teilen“ on an offer. */
  onShareOffer?: (merchantId?: string) => void;
  /** Called when user accepts an offer — parent should record the transaction. */
  onTransactionRecorded?: (tx: WalletTransaction) => void;
  /** Current simulation hour (0-23). Drives open/closed state of merchants. */
  hour?: number;
  /** Currently active/selected merchant id (for highlighting in the mini-map). */
  activeMerchantId?: string | null;
}

export function PhoneMockup({
  offer, offerState, weather, txLabel,
  onAccept, onDismiss, onExpire, generating, streamedText,
  persona, seasonalTag, onGenerateNew, onProfileChange, cashbackBalance = 0,
  merchants = [], userLat = 48.20849, userLon = 16.37208,
  radiusMeters = 900, onRadiusChange, onSelectMerchant,
  transactions, sharedCount = 0, onShareOffer,
  hour = new Date().getHours(),
  activeMerchantId = null,
}: PhoneMockupProps) {
  const [mode, setMode] = useState<PhoneMode>("homescreen");
  const [screen, setScreen] = useState<AppScreen>("home");
  const [redemptionView, setRedemptionView] = useState<RedemptionView>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      try { const s = localStorage.getItem("cw-profile"); if (s) return JSON.parse(s); } catch {}
    }
    return { name: persona.name, age: "25", preferences: ["coffee"] };
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const toggleFavorite = (id: string) => setFavoriteIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const [activeFeedOfferId, setActiveFeedOfferId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  // When offer arrives: show notification banner only (no auto-navigation).
  // The user must tap the notification to open the offer.
  useEffect(() => {
    if (offerState === "ready" && offer) {
      setShowNotification(true);
    }
  }, [offerState, offer]); // eslint-disable-line

  useEffect(() => {
    if (showNotification) {
      const t = setTimeout(() => setShowNotification(false), 9000);
      return () => clearTimeout(t);
    }
  }, [showNotification]);

  // Generative push copy — psychological (Verknappung + Personalisierung)
  const w = (weather.condition || "").toLowerCase();
  const isCold = (weather.temp ?? 20) <= 12;
  const isHot = (weather.temp ?? 20) >= 26;
  const isRainy = w.includes("rain") || w.includes("drizzle");
  const isSunny = w.includes("clear") || w.includes("sun");
  const firstName = (profile.name || "").split(" ")[0] || "du";
  const notifTitle = isCold
    ? `Kalt draußen, ${firstName}?`
    : isRainy
    ? `Regen über Wien, ${firstName}?`
    : isHot
    ? `Heiß heute, ${firstName}?`
    : isSunny
    ? `Perfektes Wetter, ${firstName}.`
    : `${firstName}, kurze Pause?`;
  const merchName = offer?.merchantName ?? "deinem Lieblings-Shop";
  const product = isCold
    ? "Cappuccino"
    : isHot
    ? "Cold Brew"
    : isRainy
    ? "warmes Getränk"
    : "Lieblingsangebot";
  const expiry = offer?.expiryMinutes ?? 15;
  const notifBody = `Dein ${product} im ${merchName} wartet schon. Wir haben dir für die nächsten ${expiry} Minuten einen exklusiven Welcome-Rabatt hinterlegt.`;

  const handleAccept = () => { onAccept(); setRedemptionView("cashback"); setShowNotification(false); };
  const handleDismiss = () => { onDismiss(); setRedemptionView(null); setShowNotification(false); };

  const saveProfile = () => {
    setProfile(draftProfile);
    try { localStorage.setItem("cw-profile", JSON.stringify(draftProfile)); } catch {}
    onProfileChange?.(draftProfile.name, draftProfile.age, draftProfile.preferences);
    setEditingProfile(false);
  };

  const isHalloween = seasonalTag === "halloween";
  const isChristmas = seasonalTag === "christmas";
  const isDark = isHalloween || isChristmas;
  const appBg = isHalloween
    ? "linear-gradient(180deg, #0f0520 0%, #1a0a2e 100%)"
    : isChristmas
    ? "linear-gradient(180deg, #0d1f0d 0%, #1a3320 100%)"
    : "linear-gradient(180deg, #F0F4FF 0%, #FAFBFF 100%)";

  const statusColor = mode === "homescreen" || isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

  return (
    <div className="relative mx-auto" style={{ width: 340, height: 724 }}>
      {/* Outer shell — Pixel-style dark-navy frame */}
      <div
        className="absolute inset-0 rounded-[44px]"
        style={{
          background: "linear-gradient(145deg, #2A3354 0%, #1E2540 100%)",
          boxShadow:
            "0 30px 80px rgba(15,20,30,0.35), 0 0 0 1px rgba(255,255,255,0.04), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      />

      {/* Side buttons — Pixel placement (right side: power on top, volume below) */}
      <div className="absolute top-28 w-[3px] h-12 rounded-r-sm" style={{ right: -3, background: "#1E2540" }} />
      <div className="absolute top-44 w-[3px] h-20 rounded-r-sm" style={{ right: -3, background: "#1E2540" }} />

      {/* Screen — thicker uniform bezel for clean phone-frame seal. 
          Match outer corner-radius minus bezel width so navy frame fully wraps the screen. */}
      <div className="absolute inset-[6px] rounded-[38px] overflow-hidden bg-black">
        {/* Centered punch-hole front camera (Pixel style) */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-40" style={{ background: "#0A0A0C", boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset" }} />

        {/* Status bar — generous breathing room from physical edges */}
        <div className="absolute top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-7 pt-5">
          <span className="text-[11px] font-semibold tracking-tight" style={{ color: statusColor }}>{timeStr}</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} style={{ color: statusColor }} />
            <Wifi size={12} style={{ color: statusColor }} />
            <Battery size={14} style={{ color: statusColor }} />
          </div>
        </div>

        {/* Background */}
        <div
          className="absolute inset-0"
          style={{ background: mode === "homescreen" ? "linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #0f2746 100%)" : appBg }}
        />

        {/* Push Notification Banner — works on homescreen + in-app */}
        <AnimatePresence>
          {showNotification && offer && (
            <motion.button
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 16, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="absolute left-3 right-3 z-50 rounded-2xl px-3 py-3 flex items-start gap-3 text-left"
              style={{
                top: 38,
                background: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(15,20,30,0.06)",
                boxShadow: "0 14px 38px rgba(15,20,30,0.18), 0 4px 12px rgba(15,20,30,0.06)",
              }}
              onClick={() => {
                setMode("app");
                setScreen("offers");
                setShowNotification(false);
              }}
            >
              {/* DSV-Rotes App-Logo (SVG) */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)",
                  boxShadow: "0 4px 12px rgba(230,0,0,0.32), 0 1px 0 rgba(255,255,255,0.3) inset",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold tracking-tight uppercase" style={{ color: "#E60000" }}>Mylo</span>
                  <span className="w-0.5 h-0.5 rounded-full" style={{ background: "rgba(33,37,41,0.35)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(33,37,41,0.5)" }}>Gerade eben</span>
                </div>
                <p className="text-[12px] font-bold leading-tight" style={{ color: "#212529" }}>{notifTitle}</p>
                <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: "rgba(33,37,41,0.7)" }}>
                  {notifBody}
                </p>
              </div>
              <ChevronRight size={14} style={{ color: "rgba(33,37,41,0.35)" }} className="shrink-0 mt-1" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="absolute top-11 bottom-0 left-0 right-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === "homescreen" ? (
              <PhoneHomeScreen
                key="hs"
                onOpenApp={() => { setMode("app"); setScreen("home"); }}
                hasOffer={offerState === "ready" || generating}
              />
            ) : (
              <motion.div
                key="app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Screen content */}
                <div className="flex-1 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {screen === "home" && (
                      <motion.div key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute inset-0">
                        <AppHomeScreen profile={profile} initials={profile.name.split(" ").map(n=>n[0]??'').join('').toUpperCase().slice(0,2)} weather={weather} offer={offer} offerState={offerState} generating={generating} cashbackBalance={cashbackBalance} isDark={isDark} onNavigateOffers={() => setScreen("offers")} onNavigateWallet={() => setScreen("wallet")} onNavigateNearby={() => setScreen("nearby")} merchants={merchants} radiusMeters={radiusMeters} hour={hour} />
                      </motion.div>
                    )}
                    {screen === "nearby" && (
                      <motion.div key="nearby" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0">
                        <AppNearbyScreen
                          merchants={merchants}
                          userLat={userLat}
                          userLon={userLon}
                          radiusMeters={radiusMeters}
                          onRadiusChange={onRadiusChange}
                          onSelectMerchant={onSelectMerchant}
                          onOpenOffer={() => setScreen("offers")}
                          hour={hour}
                          activeMerchantId={activeMerchantId}
                        />
                      </motion.div>
                    )}
                    {screen === "offers" && (
                      <motion.div key="offers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0">
                        <AppOffersScreen offer={offer} offerState={offerState} generating={generating} streamedText={streamedText} redemptionView={redemptionView} weather={weather} txLabel={txLabel} isDark={isDark} seasonalTag={seasonalTag} onAccept={handleAccept} onDismiss={handleDismiss} onExpire={onExpire} onSwitchToQR={() => setRedemptionView("qr")} onRedemptionClose={() => { setRedemptionView(null); onGenerateNew?.(); }} onGenerateNew={onGenerateNew} merchants={merchants} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} activeFeedOfferId={activeFeedOfferId} onOpenFeedOffer={setActiveFeedOfferId} onSelectMerchant={onSelectMerchant} shareOpen={shareOpen} onShareToggle={setShareOpen} onShareOffer={onShareOffer} radiusMeters={radiusMeters} hour={hour} />
                      </motion.div>
                    )}
                    {screen === "wallet" && (
                      <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0">
                        <AppWalletScreen profile={profile} cashbackBalance={cashbackBalance} isDark={isDark} transactions={transactions} />
                      </motion.div>
                    )}
                    {screen === "profile" && (
                      <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0">
                        <AppProfileScreen profile={profile} draftProfile={draftProfile} setDraftProfile={setDraftProfile} editingProfile={editingProfile} setEditingProfile={setEditingProfile} onSave={saveProfile} isDark={isDark} onHome={() => setMode("homescreen")} sharedCount={sharedCount} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom nav — solid, fully opaque, sits above content */}
                <div
                  className="flex items-center justify-around px-2 pt-2 pb-1 border-t shrink-0 z-50 relative"
                  style={{
                    background: isDark ? "#121218" : "#FFFFFF",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,20,30,0.06)",
                    boxShadow: isDark ? "0 -4px 14px rgba(0,0,0,0.35)" : "0 -2px 10px rgba(15,20,30,0.04)",
                  }}
                >
                  {([
                    { id: "home", label: "Home", Icon: Home },
                    { id: "nearby", label: "Nearby", Icon: MapPin },
                    { id: "offers", label: "Angebote", Icon: Tag },
                    { id: "wallet", label: "Wallet", Icon: CreditCard },
                    { id: "profile", label: "Profil", Icon: User },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setScreen(id)}
                      className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl relative"
                      style={{ background: screen === id ? (isDark ? "rgba(230,0,0,0.15)" : "#FFF1F2") : "transparent" }}
                    >
                      <Icon size={18} style={{ color: screen === id ? "#E60000" : isDark ? "rgba(255,255,255,0.45)" : "#9CA3AF" }} />
                      <span className="text-[8.5px] font-medium" style={{ color: screen === id ? "#E60000" : isDark ? "rgba(255,255,255,0.45)" : "#9CA3AF" }}>{label}</span>
                      {id === "offers" && (offerState === "ready" || generating) && (
                        <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Native home indicator — solid bg, sits flush with device bottom edge */}
                <div
                  className="flex items-center justify-center shrink-0 z-50 relative"
                  style={{
                    height: 22,
                    background: isDark ? "#121218" : "#FFFFFF",
                  }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 112,
                      height: 4,
                      background: isDark ? "rgba(255,255,255,0.30)" : "rgba(15,20,30,0.22)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
