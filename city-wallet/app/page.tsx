"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Radio, Activity, Sun, Cloud, CloudRain, CloudSnow, MapPin, Clock, Store, User, Users, Minus, Plus, Check } from "lucide-react";
import { ContextPanel } from "@/components/city/ContextPanel";
import { PrivacyLayer } from "@/components/city/PrivacyLayer";
import { MapboardView } from "@/components/city/MapboardView";
import { FRIEND_PALETTE, type FriendMarker } from "@/components/city/MapboardView";
import { NearbyShops } from "@/components/city/NearbyShops";
import { PhoneMockup } from "@/components/consumer/PhoneMockup";
import { MerchantDashboard } from "@/components/merchant/MerchantDashboard";
import { PersonaSelector } from "@/components/demo/PersonaSelector";
import { TimeMachine } from "@/components/demo/TimeMachine";
import { ScenarioPresets } from "@/components/demo/ScenarioPresets";
import { SeasonalToggle } from "@/components/demo/SeasonalToggle";
import { FriendsLayer } from "@/components/wallet/FriendsLayer";
import { WalletID } from "@/components/wallet/WalletID";
import { PreOrderFlow } from "@/components/consumer/PreOrderFlow";
import { useStreamingOffer } from "@/hooks/useStreamingOffer";
import { useContextState } from "@/hooks/useContextState";
import { useMerchantFeed } from "@/hooks/useMerchantFeed";
import { processSignalsLocally } from "@/lib/slm-layer";
import { getPersona, PERSONAS } from "@/lib/personas";
import { STUTTGART_CONFIG } from "@/config/city.config";
import { annotateMerchants, prioritizeForWeather } from "@/lib/geofence";
import type { DemoScenario } from "@/lib/scenarios";
import type { MerchantRules } from "@/lib/offer-prompt";
import type { PreOrder } from "@/lib/preorder";
import type { WalletTransaction } from "@/components/consumer/PhoneMockup";

const DEFAULT_RULES: MerchantRules = {
  maxDiscount: 20,
  goal: "quiet_hour_fill",
  tone: "warm",
  productFocus: "Heiße Getränke",
  active: true,
};

export default function Home() {
  const [personaId, setPersonaId] = useState("mia");
  const [hour, setHour] = useState(11);
  const [seasonalTag, setSeasonalTag] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState("cafe-muller");
  const [rules, setRules] = useState<MerchantRules>(DEFAULT_RULES);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [offerFiredAt, setOfferFiredAt] = useState<number | undefined>(undefined);
  const [leftTab, setLeftTab] = useState<"context" | "privacy">("context");
  const [rightTab, setRightTab] = useState<"merchant" | "nearby" | "friends" | "preorder" | "demo">("merchant");
  const [offerCount, setOfferCount] = useState(0);
  const [userLat, setUserLat] = useState(48.20849);
  const [userLon, setUserLon] = useState(16.37208);
  const [radiusMeters, setRadiusMeters] = useState(900);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [sharedCount, setSharedCount] = useState(0);
  // ── Friends state — lifted from MapboardView so the Friends UI can live
  //     inside the Live Kontext & Control panel (no logic change).
  const [friends, setFriends] = useState<FriendMarker[]>([]);
  const [showFriends, setShowFriends] = useState(false);
  const addFriend = useCallback(() => {
    setFriends((prev) => {
      if (prev.length >= FRIEND_PALETTE.length) return prev;
      const palette = FRIEND_PALETTE[prev.length];
      const angle = (prev.length / FRIEND_PALETTE.length) * Math.PI * 2 + Math.PI / 4;
      const dist = 70 + prev.length * 25;
      const METERS_PER_DEGREE_LAT = 111320;
      const metersPerDegreeLon = 111320 * Math.cos((userLat * Math.PI) / 180);
      const dLat = (Math.cos(angle) * dist) / METERS_PER_DEGREE_LAT;
      const dLon = (Math.sin(angle) * dist) / metersPerDegreeLon;
      return [
        ...prev,
        { id: String(Date.now()), name: palette.name, lat: userLat + dLat, lon: userLon + dLon, base: palette.base, highlight: palette.highlight },
      ];
    });
    setShowFriends(true);
  }, [userLat, userLon]);
  const removeFriend = useCallback((id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  }, []);
  const [weatherOverride, setWeatherOverride] = useState({
    temp: 11,
    condition: "overcast clouds",
    description: "Bedeckt",
    icon: "04d",
  });

  const GPS_PRESETS = [
    { name: "Stephansplatz", lat: 48.20849, lon: 16.37208 },
    { name: "Café Müller", lat: 48.20689, lon: 16.36481 },
    { name: "GreenBoost", lat: 48.20015, lon: 16.35563 },
    { name: "Bäckerei", lat: 48.20081, lon: 16.36988 },
    { name: "Hbf", lat: 48.18560, lon: 16.37810 },
  ];

  const persona = getPersona(personaId);

  const { ctx, updatePersona, updateSeasonalTag } = useContextState(hour, weatherOverride, persona.movementSpeed, userLat, userLon);
  const { offer, state, streamedText, isStreaming, generateOffer, accept, dismiss, expire, reset } = useStreamingOffer();
  const { snapshot, hourlyData, acceptCount, dismissCount, revenueRecovered, recordAccept, recordDismiss } =
    useMerchantFeed(merchantId, hour);

  const merchant = STUTTGART_CONFIG.merchants.find((m) => m.id === merchantId) ?? STUTTGART_CONFIG.merchants[0];
  const rawTxLabel = ctx.transactionDensity.find((t) => t.merchantId === merchantId)?.label ?? "Normal";
  const txLabel = rawTxLabel.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim() || "Normal";

  // ─── GeoFence: single source of truth ───
  // Distance-sorted, then re-ranked by weather affinity (Gastgarten boost on sunny days).
  const annotatedMerchants = useMemo(
    () =>
      prioritizeForWeather(
        annotateMerchants(STUTTGART_CONFIG.merchants, userLat, userLon, radiusMeters),
        weatherOverride
      ),
    [userLat, userLon, radiusMeters, weatherOverride]
  );
  const inRadiusMerchants = useMemo(
    () => annotatedMerchants.filter((m) => m.inRadius),
    [annotatedMerchants]
  );

  // Auto-switch active merchant when current one drifts outside the geofence
  useEffect(() => {
    const current = annotatedMerchants.find((m) => m.id === merchantId);
    if (!current?.inRadius && inRadiusMerchants.length > 0) {
      setMerchantId(inRadiusMerchants[0].id);
    }
  }, [annotatedMerchants, inRadiusMerchants, merchantId]);

  const handleGenerate = useCallback(async () => {
    const intent = processSignalsLocally({
      gpsLat: userLat,
      gpsLon: userLon,
      movementSpeed: persona.movementSpeed,
      appHistory: persona.appHistory,
      weatherCache: { temp: ctx.weather.temp, condition: ctx.weather.condition },
      hour,
    });
    setOfferFiredAt(hour);
    setOfferCount((c) => c + 1);
    await generateOffer(intent, merchantId, rules);
  }, [persona, ctx, hour, merchantId, rules, generateOffer]);

  const handleAccept = useCallback(() => {
    accept();
    recordAccept(3.5);
    // Record a wallet transaction so the Wallet tab updates live
    const m = STUTTGART_CONFIG.merchants.find((mm) => mm.id === merchantId);
    if (m) {
      const now = new Date();
      const time = `Heute, ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
      const amount = 3.5 + Math.random() * 4.5;
      const cashback = +(amount * (m.maxDiscount / 100)).toFixed(2);
      setTransactions((prev) => [
        {
          id: `tx-${now.getTime()}`,
          merchant: m.name,
          amount: `−€${amount.toFixed(2)}`,
          cashback: `+€${cashback.toFixed(2)}`,
          time,
          category: m.category as WalletTransaction["category"],
        },
        ...prev,
      ].slice(0, 20));
    }
  }, [accept, recordAccept, merchantId]);

  const [shareToast, setShareToast] = useState<{ id: number; visible: boolean } | null>(null);
  const handleShareOffer = useCallback(() => {
    setSharedCount((c) => c + 1);
    setShareToast({ id: Date.now(), visible: true });
  }, []);
  useEffect(() => {
    if (!shareToast?.visible) return;
    const t = setTimeout(() => setShareToast((s) => (s ? { ...s, visible: false } : s)), 2400);
    return () => clearTimeout(t);
  }, [shareToast?.id, shareToast?.visible]);

  const handleRouteEncounter = useCallback((merchantIdHit: string) => {
    // When the avatar passes near a merchant, switch to it so an offer can fire.
    setMerchantId(merchantIdHit);
  }, []);

  const handleDismiss = useCallback(() => {
    dismiss();
    recordDismiss();
  }, [dismiss, recordDismiss]);

  const handleScenario = useCallback(
    (scenario: DemoScenario) => {
      setActiveScenarioId(scenario.id);
      setPersonaId(scenario.personaId);
      setHour(scenario.hour);
      setMerchantId(scenario.merchantId);
      setSeasonalTag(scenario.seasonalTag ?? null);
      if (scenario.userLat) setUserLat(scenario.userLat);
      if (scenario.userLon) setUserLon(scenario.userLon);
      updatePersona(scenario.personaId);
      updateSeasonalTag(scenario.seasonalTag ?? null);
      reset();
      // Auto-generate after brief delay
      setTimeout(async () => {
        const p = getPersona(scenario.personaId);
        const intent = processSignalsLocally({
          gpsLat: scenario.userLat ?? userLat,
          gpsLon: scenario.userLon ?? userLon,
          movementSpeed: p.movementSpeed,
          appHistory: scenario.intentOverride ?? p.appHistory,
          weatherCache: { temp: scenario.weatherOverride.temp, condition: scenario.weatherOverride.condition },
          hour: scenario.hour,
        });
        setOfferFiredAt(scenario.hour);
        setOfferCount((c) => c + 1);
        const m = STUTTGART_CONFIG.merchants.find((mm) => mm.id === scenario.merchantId) ?? STUTTGART_CONFIG.merchants[0];
        const r: MerchantRules = {
          maxDiscount: m.maxDiscount,
          goal: m.goal,
          tone: m.tone,
          productFocus: m.productFocus,
          active: true,
        };
        await generateOffer(intent, scenario.merchantId, r);
      }, 300);
    },
    [updatePersona, updateSeasonalTag, reset, generateOffer]
  );

  const handleGroupOffer = useCallback(
    (headline: string, discount: string) => {
      // Trigger a group offer generation
      handleGenerate();
    },
    [handleGenerate]
  );

  const handlePreOrder = useCallback((order: PreOrder) => {
    setPreOrders((prev) => [order, ...prev]);
  }, []);

  // ─── Light Glass card style helper ───
  const subPanel: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid rgba(15,20,30,0.05)",
    boxShadow: "0 1px 2px rgba(15,20,30,0.04)",
  };

  // ── Live Kontext helpers (visual format ported from MapboardView's StatBubble) ──
  const scoreColor =
    ctx.triggerScore > 0.7 ? "#E60000" : ctx.triggerScore > 0.4 ? "#D97706" : "#2563EB";
  const WEATHER_PRESETS = [
    { id: "sun", label: "Sonnig", data: { temp: 24, condition: "clear sky", description: "Sonnig", icon: "01d" } },
    { id: "cloud", label: "Bewölkt", data: { temp: 14, condition: "overcast clouds", description: "Bedeckt", icon: "04d" } },
    { id: "rain", label: "Regen", data: { temp: 9, condition: "light rain", description: "Leichter Regen", icon: "10d" } },
    { id: "snow", label: "Schnee", data: { temp: -2, condition: "snow", description: "Schnee", icon: "13d" } },
  ];
  const activeWeatherId =
    WEATHER_PRESETS.find((p) => p.data.condition === weatherOverride.condition)?.id ?? "cloud";
  const renderWeatherIcon = (condition: string, size = 14) => {
    const c = condition.toLowerCase();
    if (c.includes("rain")) return <CloudRain size={size} strokeWidth={1.75} />;
    if (c.includes("snow")) return <CloudSnow size={size} strokeWidth={1.75} />;
    if (c.includes("clear") || c.includes("sun")) return <Sun size={size} strokeWidth={1.75} />;
    return <Cloud size={size} strokeWidth={1.75} />;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#F8F9FA" }}>
      {/* ─────────── FIXED TOP HEADER — Live Kontext Controls ─────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
        <div 
          className="mx-4 mt-4 rounded-2xl px-8 py-5 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(15,20,30,0.08)",
            boxShadow: "0 8px 32px rgba(15,20,30,0.12), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          {/* Weather & Context */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {renderWeatherIcon(weatherOverride.condition, 16)}
              <span className="text-[11px] font-bold text-gray-700">
                {weatherOverride.temp}°C
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {txLabel}
            </span>
          </div>

          {/* Central Controls */}
          <div className="flex items-center gap-4">
            {/* Time Machine */}
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-600" />
              <input
                type="range"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-[11px] font-bold text-gray-700 min-w-[24px]">{hour}h</span>
            </div>

            {/* Radius Slider */}
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-gray-600" />
              <input
                type="range"
                min={150}
                max={2000}
                step={50}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-[10px] font-bold text-gray-600 min-w-[32px]">{radiusMeters}m</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Friends Toggle */}
            <button
              onClick={() => setShowFriends(!showFriends)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
              style={{
                background: showFriends ? "rgba(230,0,0,0.08)" : "transparent",
                color: showFriends ? "#E60000" : "#6B7280",
              }}
            >
              <Users size={13} strokeWidth={2} />
              <span className="text-[10px] font-bold">{friends.length}</span>
            </button>
            
            {/* Trigger Score */}
            <div 
              className="px-2 py-0.5 rounded-lg"
              style={{
                background: ctx.triggerScore >= 0.7 ? "rgba(230,0,0,0.1)" : "rgba(156,163,175,0.1)",
                color: ctx.triggerScore >= 0.7 ? "#E60000" : "#6B7280",
              }}
            >
              <span className="text-[10px] font-bold">
                {Math.round(ctx.triggerScore * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── Fullscreen map background ─────────── */}
      <div className="fixed inset-0 z-0" style={{ paddingTop: 80 }}>
        <MapboardView
          userLat={userLat}
          userLon={userLon}
          onMoveUser={(lat, lon) => { setUserLat(lat); setUserLon(lon); }}
          merchants={STUTTGART_CONFIG.merchants}
          weather={weatherOverride}
          onWeatherChange={setWeatherOverride}
          inZone={ctx.location.inZone}
          activeMerchantId={merchantId}
          triggerScore={ctx.triggerScore}
          hour={hour}
          radiusMeters={radiusMeters}
          onRadiusChange={setRadiusMeters}
          onRouteEncounter={handleRouteEncounter}
          friends={friends}
          showFriends={showFriends}
          onRemoveFriend={removeFriend}
        />
      </div>

      {/* ─────────── RIGHT DEVICE CLUSTER — Phone + Tablet ─────────── */}
      <div
        className="fixed z-40 pointer-events-auto"
        style={{
          right: 16,
          top: "50%",
          transform: "translateY(-50%) scale(0.78)",
          transformOrigin: "right center",
        }}
      >
        <div className="flex items-center gap-6">
          {/* Phone (left of the cluster) */}
          <div
            className="rounded-[3rem] p-2"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(15,20,30,0.06)",
              boxShadow:
                "-4px 0 30px rgba(230,0,0,0.04), 0 24px 60px rgba(15,20,30,0.18), 0 1px 0 rgba(255,255,255,0.9) inset",
            }}
          >
            <PhoneMockup
              offer={offer}
              offerState={state}
              weather={ctx.weather}
              txLabel={txLabel}
              onAccept={handleAccept}
              onDismiss={handleDismiss}
              onExpire={expire}
              generating={isStreaming}
              streamedText={streamedText}
              persona={persona}
              seasonalTag={seasonalTag}
              onGenerateNew={handleGenerate}
              cashbackBalance={revenueRecovered}
              merchants={annotatedMerchants}
              userLat={userLat}
              userLon={userLon}
              radiusMeters={radiusMeters}
              onRadiusChange={setRadiusMeters}
              onSelectMerchant={setMerchantId}
              onProfileChange={(name, age, prefs) => console.log("Profile updated:", name, age, prefs)}
              transactions={transactions}
              sharedCount={sharedCount}
              onShareOffer={handleShareOffer}
              hour={hour}
              activeMerchantId={ctx.location.zoneMerchantId ?? merchantId}
            />
          </div>

          {/* Tablet — Presenter Dashboard (right of phone). Portrait, height ≤ phone. */}
          <div
            className="rounded-[2.5rem] relative"
            style={{
              width: 480,
              height: 720, // phone outer = 340×724 → tablet height ≤ phone
              border: "12px solid #1E2540",
              background: "#1E2540",
              boxShadow:
                "0 24px 60px rgba(15,20,30,0.22), 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
          >
            {/* Front-camera dot */}
            <div
              className="absolute rounded-full"
              style={{
                top: -7,
                left: "50%",
                transform: "translateX(-50%)",
                width: 6,
                height: 6,
                background: "#0A0B0D",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
              }}
            />
            <div
              className="rounded-[1.5rem] overflow-y-auto bg-white h-full flex flex-col"
              style={{ scrollbarWidth: "thin" }}
            >
              {/* Tab bar (Händler · Demo) */}
              <div className="flex border-b shrink-0" style={{ borderColor: "rgba(15,20,30,0.06)" }}>
                {[
                  { id: "merchant", label: "Händler" },
                  { id: "demo", label: "Demo" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRightTab(tab.id as "merchant" | "nearby" | "friends" | "preorder" | "demo")}
                    className="flex-1 py-3 text-xs font-bold transition-colors"
                    style={{
                      background: rightTab === tab.id ? "rgba(230,0,0,0.06)" : "transparent",
                      color: rightTab === tab.id ? "#E60000" : "#6B7280",
                      borderBottom: rightTab === tab.id ? "2px solid #E60000" : "2px solid transparent",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto p-5 space-y-4 flex-1" style={{ scrollbarWidth: "thin" }}>
                {/* Tab content */}
                {rightTab === "merchant" && (
                  <MerchantDashboard
                    merchant={merchant}
                    hourlyData={hourlyData}
                    currentHour={hour}
                    acceptCount={acceptCount}
                    dismissCount={dismissCount}
                    revenueRecovered={revenueRecovered}
                    offerCount={offerCount}
                    rules={rules}
                    onRulesChange={setRules}
                    preOrders={preOrders}
                    offerFiredAt={offerFiredAt}
                    onGenerateOffer={handleGenerate}
                    generating={isStreaming}
                  />
                )}
                {rightTab === "nearby" && (
                  <NearbyShops
                    merchants={inRadiusMerchants}
                    activeMerchantId={merchantId}
                    onSelectMerchant={setMerchantId}
                    onGenerateOffer={handleGenerate}
                    generating={isStreaming}
                  />
                )}
                {rightTab === "friends" && (
                  <FriendsLayer merchantName={merchant.name} onGroupOfferReady={handleGroupOffer} />
                )}
                {/* PreOrder tab removed — now lives inside the phone offer detail */}

                {/* Demo tab — legacy controls (Radius, Scenarios, GPS, Seasonal, Context/DSGVO, WalletID) */}
                {rightTab === "demo" && (
                  <>
                {/* Divider */}
                <div className="h-px" style={{ background: "rgba(15,20,30,0.06)" }} />

                {/* Live Radius indicator (bidirectional binding) */}
                <div
                  className="rounded-2xl p-4 flex items-center justify-between"
                  style={{
                    background: "linear-gradient(135deg,#FFFFFF 0%,#FFF4F4 100%)",
                    border: "1px solid rgba(230,0,0,0.18)",
                    boxShadow: "0 2px 6px rgba(230,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(230,0,0,0.10)", color: "#E60000" }}
                    >
                      <Radio size={15} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500">Geofence Radius</p>
                      <p className="text-base font-black" style={{ color: "#111827", letterSpacing: "-0.01em" }}>
                        {radiusMeters} <span className="text-xs font-bold text-gray-500">m</span>
                      </p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1500}
                    step={10}
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
                    className="w-24 accent-red-600"
                  />
                </div>

                {/* Scenarios */}
                <div className="rounded-2xl p-4" style={subPanel}>
                  <ScenarioPresets onSelect={handleScenario} activeId={activeScenarioId} />
                </div>

                {/* GPS Picker */}
                <div className="rounded-2xl p-4" style={subPanel}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#374151" }}>GPS Position · Wien</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {GPS_PRESETS.map((p) => {
                      const active = userLat === p.lat && userLon === p.lon;
                      return (
                        <button
                          key={p.name}
                          onClick={() => { setUserLat(p.lat); setUserLon(p.lon); }}
                          className="text-[10px] px-2 py-1 rounded-lg border transition-colors font-semibold"
                          style={{
                            background: active ? "rgba(230,0,0,0.08)" : "#F8F9FA",
                            borderColor: active ? "rgba(230,0,0,0.45)" : "rgba(15,20,30,0.06)",
                            color: active ? "#E60000" : "#374151",
                          }}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <p className="text-[9px] mb-0.5" style={{ color: "#9CA3AF" }}>Lat</p>
                      <input
                        type="number"
                        step="0.0001"
                        value={userLat}
                        onChange={(e) => setUserLat(parseFloat(e.target.value) || userLat)}
                        className="w-full text-[10px] px-2 py-1 rounded-lg border focus:outline-none"
                        style={{ background: "#FFFFFF", borderColor: "rgba(15,20,30,0.08)", color: "#111827" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] mb-0.5" style={{ color: "#9CA3AF" }}>Lon</p>
                      <input
                        type="number"
                        step="0.0001"
                        value={userLon}
                        onChange={(e) => setUserLon(parseFloat(e.target.value) || userLon)}
                        className="w-full text-[10px] px-2 py-1 rounded-lg border focus:outline-none"
                        style={{ background: "#FFFFFF", borderColor: "rgba(15,20,30,0.08)", color: "#111827" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Seasonal */}
                <div className="rounded-2xl p-4" style={subPanel}>
                  <SeasonalToggle
                    active={seasonalTag}
                    onChange={(t) => {
                      setSeasonalTag(t);
                      updateSeasonalTag(t);
                    }}
                  />
                </div>

                {/* Context Layer (DSGVO card removed per spec) */}
                <div className="rounded-2xl overflow-hidden" style={subPanel}>
                  <div className="p-3">
                    <ContextPanel
                      ctx={ctx}
                      merchants={STUTTGART_CONFIG.merchants}
                      onGenerate={handleGenerate}
                      generating={isStreaming}
                    />
                  </div>
                </div>

                <WalletID />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────── TOP HEADER — full-width "Live Kontext" control bar ───────────
          Replaces the bottom-left floating panel. Glass surface, fixed across
          the full viewport width, hosts every control horizontally so the map
          stays unobstructed below. */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-auto"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(15,20,30,0.06)",
          boxShadow: "0 6px 20px rgba(15,20,30,0.06), 0 1px 0 rgba(255,255,255,0.9) inset",
          color: "#111827",
        }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Brand + Live Kontext label */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center">
                <span className="text-base font-black" style={{ color: "#212529", letterSpacing: "-0.02em" }}>Mylo</span>
                <div className="ml-1" style={{ transform: "translateY(-1px)" }}>
                  <svg width="14" height="18" viewBox="0 0 12 16" fill="none">
                    <path d="M6 0C4.4087 0 2.88258 0.632141 1.75736 1.75736C0.632141 2.88258 0 4.4087 0 6C0 8.25 2.25 11.1 6 16C9.75 11.1 12 8.25 12 6C12 4.4087 11.3679 2.88258 10.2426 1.75736C9.11742 0.632141 7.5913 0 6 0ZM6 2C6.79565 2 7.55871 2.31607 8.12132 2.87868C8.68393 3.44129 9 4.20435 9 5C9 5.55228 8.55228 6 8 6C7.44772 6 7 5.55228 7 5C7 4.73478 6.89464 4.48043 6.70711 4.29289C6.51957 4.10536 6.26522 4 6 4C5.73478 4 5.48043 4.10536 5.29289 4.29289C5.10536 4.48043 5 4.73478 5 5C5 5.55228 4.55228 6 4 6C3.44772 6 3 5.55228 3 5C3 4.20435 3.31607 3.44129 3.87868 2.87868C4.44129 2.31607 5.20435 2 6 2Z" fill="#E60000"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={11} strokeWidth={2.2} style={{ color: "#E60000" }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">
                Live Kontext
              </span>
            </div>
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {/* Weather presets — compact icon row */}
          <div className="flex items-center gap-1 shrink-0">
            {WEATHER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setWeatherOverride(p.data)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all"
                style={{
                  background: activeWeatherId === p.id ? "rgba(230,0,0,0.08)" : "rgba(15,20,30,0.025)",
                  border: activeWeatherId === p.id ? "1px solid rgba(230,0,0,0.45)" : "1px solid rgba(15,20,30,0.05)",
                  color: activeWeatherId === p.id ? "#E60000" : "#374151",
                }}
                title={p.label}
              >
                {renderWeatherIcon(p.data.condition, 13)}
                <span className="text-[9px] font-bold tabular-nums">{p.data.temp}°</span>
              </button>
            ))}
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {/* Time Machine — inline */}
          <div className="flex items-center gap-2 shrink-0">
            <Clock size={11} strokeWidth={2.2} className="text-gray-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">
              Time
            </span>
            <input
              type="range"
              min={6}
              max={22}
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              className="h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              style={{ width: 96 }}
            />
            <span className="text-[10px] font-bold font-mono w-10 text-right tabular-nums" style={{ color: "#E60000" }}>
              {String(hour).padStart(2, "0")}:00
            </span>
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {/* Radius slider — inline */}
          <div className="flex items-center gap-2 shrink-0">
            <Radio size={11} strokeWidth={2.2} className="text-gray-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">
              Radius
            </span>
            <input
              type="range"
              min={50}
              max={1500}
              step={10}
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
              className="h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              style={{ width: 96 }}
            />
            <span className="text-[10px] font-bold font-mono w-12 text-right tabular-nums" style={{ color: "#E60000" }}>
              {radiusMeters}m
            </span>
          </div>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {/* Shop dropdown */}
          <label className="flex items-center gap-1.5 shrink-0">
            <Store size={11} strokeWidth={2.2} className="text-gray-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">Shop</span>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="text-[10px] px-2 py-1.5 rounded-lg border focus:outline-none max-w-[180px]"
              style={{ background: "#FFFFFF", borderColor: "rgba(15,20,30,0.08)", color: "#374151" }}
            >
              {annotatedMerchants.map((m) => (
                <option key={m.id} value={m.id} disabled={!m.inRadius}>
                  {m.name} · {Math.round(m.distanceMeters)}m{m.inRadius ? "" : " (außerh.)"}
                </option>
              ))}
            </select>
          </label>

          {/* Trigger / persona dropdown */}
          <label className="flex items-center gap-1.5 shrink-0">
            <User size={11} strokeWidth={2.2} className="text-gray-500" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500 whitespace-nowrap">Trigger</span>
            <select
              value={personaId}
              onChange={(e) => { setPersonaId(e.target.value); updatePersona(e.target.value); }}
              className="text-[10px] px-2 py-1.5 rounded-lg border focus:outline-none"
              style={{ background: "#FFFFFF", borderColor: "rgba(15,20,30,0.08)", color: "#374151" }}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <div className="w-px h-7 bg-gray-200 shrink-0" />

          {/* Friends — compact */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowFriends((s) => !s)}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors"
              style={{ color: showFriends ? "#E60000" : "#6B7280" }}
              title={showFriends ? "Friends ausblenden" : "Friends einblenden"}
            >
              <Users size={11} strokeWidth={2.2} />
              Friends
            </button>
            <button
              onClick={() => { if (friends.length > 0) removeFriend(friends[friends.length - 1].id); }}
              disabled={friends.length === 0}
              className="w-6 h-6 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Letzten Freund entfernen"
            >
              <Minus size={11} strokeWidth={2.2} />
            </button>
            <span className="text-[10px] font-mono font-bold text-gray-700 w-8 text-center tabular-nums">
              {friends.length}/{FRIEND_PALETTE.length}
            </span>
            <button
              onClick={addFriend}
              disabled={friends.length >= FRIEND_PALETTE.length}
              className="w-6 h-6 rounded-lg border flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{
                background: friends.length >= FRIEND_PALETTE.length ? "#9CA3AF" : "#E60000",
                borderColor: friends.length >= FRIEND_PALETTE.length ? "#9CA3AF" : "#C40000",
                boxShadow: friends.length >= FRIEND_PALETTE.length ? "none" : "0 2px 6px rgba(230,0,0,0.25)",
              }}
              title="Freund hinzufügen"
            >
              <Plus size={11} strokeWidth={2.4} />
            </button>
          </div>

          {/* Push score + LIVE + In-Zone to the far right */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span
              className="font-mono text-[10px] text-gray-500 hidden md:inline-flex items-center gap-1"
              title="GPS"
            >
              <MapPin size={10} strokeWidth={1.75} />
              {userLat.toFixed(4)}, {userLon.toFixed(4)}
            </span>
            {ctx.location.inZone && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5"
                style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                In Zone · {merchant.name}
              </span>
            )}
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold"
              style={{
                background: `${scoreColor}14`,
                color: scoreColor,
                border: `1px solid ${scoreColor}33`,
              }}
            >
              Score {Math.round(ctx.triggerScore * 100)}%
            </span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5"
              style={{ background: "rgba(230,0,0,0.08)", color: "#E60000", border: "1px solid rgba(230,0,0,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Share confirmation toast — sits above device cluster, under no other UI */}
      {shareToast && (
        <div
          className="fixed left-1/2 z-[90] pointer-events-none"
          style={{
            bottom: 32,
            transform: `translate(-50%, ${shareToast.visible ? 0 : 16}px)`,
            opacity: shareToast.visible ? 1 : 0,
            transition: "opacity 280ms ease, transform 280ms cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-[12px] font-bold"
            style={{
              background: "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)",
              boxShadow: "0 14px 32px rgba(230,0,0,0.32), 0 1px 0 rgba(255,255,255,0.25) inset",
              letterSpacing: "-0.01em",
            }}
          >
            <Check size={14} strokeWidth={2.6} />
            Angebot geteilt!
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.22)" }}
            >
              Local Hero +1
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
