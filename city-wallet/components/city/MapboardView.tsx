"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Map, { Marker, type MapRef, type ViewState } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { LIGHT_STYLE } from "@/lib/map-style";
import {
  Cloud, CloudRain, CloudSnow, Sun, X, Activity, MapPin, Navigation,
  Coffee, Croissant, Sparkles, ShoppingBag, UtensilsCrossed, Footprints,
} from "lucide-react";
import type { MerchantConfig } from "@/config/city.config";
import type { WeatherData } from "@/lib/context-engine";

// ─────────────────────────────────────────────────────────────────────────────
// Flat S-Communication CI markers — native map app aesthetic
// ─────────────────────────────────────────────────────────────────────────────

/** Native-style location puck: red dot, white halo, expanding pulse ring. */
function LocationPuck({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative"
      style={{ width: size * 4, height: size * 4, pointerEvents: "none" }}
    >
      <motion.span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          translate: "-50% -50%",
          width: size * 3.5,
          height: size * 3.5,
          background: "rgba(230,0,0,0.18)",
        }}
        animate={{ scale: [0.4, 1.0, 0.4], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          translate: "-50% -50%",
          width: size * 1.7,
          height: size * 1.7,
          background: "rgba(230,0,0,0.16)",
          boxShadow: "0 0 22px rgba(230,0,0,0.28)",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          translate: "-50% -50%",
          width: size,
          height: size,
          background: "#FFFFFF",
          boxShadow: "0 6px 18px rgba(15,20,30,0.22), 0 0 0 1px rgba(15,20,30,0.05)",
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          translate: "-50% -50%",
          width: size * 0.62,
          height: size * 0.62,
          background: "#E60000",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.6) inset",
        }}
      />
    </div>
  );
}

const CATEGORY_PIN_ICON: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  cafe: Coffee,
  bakery: Croissant,
  smoothie: Sparkles,
  restaurant: UtensilsCrossed,
  retail: ShoppingBag,
};

/** Native map pin: white circle with line-art icon, fine drop shadow. */
function MapPin2({
  category,
  active = false,
  size = 44,
}: {
  category: string;
  active?: boolean;
  size?: number;
}) {
  const Icon = CATEGORY_PIN_ICON[category] ?? ShoppingBag;
  const fill = active ? "#E60000" : "#FFFFFF";
  const stroke = active ? "#FFFFFF" : "#212529";
  return (
    <div className="relative flex flex-col items-center" style={{ pointerEvents: "none" }}>
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: fill,
          boxShadow: active
            ? "0 10px 24px rgba(230,0,0,0.35), 0 0 0 2px rgba(255,255,255,0.85)"
            : "0 6px 18px rgba(15,20,30,0.18), 0 0 0 1px rgba(15,20,30,0.06)",
          transition: "all 220ms cubic-bezier(.2,.7,.2,1)",
        }}
      >
        <Icon size={size * 0.46} strokeWidth={1.75} color={stroke} />
      </div>
      <span
        style={{
          width: 8,
          height: 8,
          marginTop: -3,
          background: fill,
          transform: "rotate(45deg)",
          boxShadow: active
            ? "2px 2px 4px rgba(230,0,0,0.30)"
            : "2px 2px 4px rgba(15,20,30,0.10)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function WeatherIconFor({ condition, size = 14 }: { condition: string; size?: number }) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return <CloudRain size={size} strokeWidth={1.75} />;
  if (c.includes("snow")) return <CloudSnow size={size} strokeWidth={1.75} />;
  if (c.includes("clear") || c.includes("sun")) return <Sun size={size} strokeWidth={1.75} />;
  return <Cloud size={size} strokeWidth={1.75} />;
}

const WEATHER_PRESETS: Array<{ id: string; label: string; data: WeatherData }> = [
  { id: "sun", label: "Sonnig", data: { temp: 24, condition: "clear sky", description: "Sonnig", icon: "01d" } },
  { id: "cloud", label: "Bewölkt", data: { temp: 14, condition: "overcast clouds", description: "Bedeckt", icon: "04d" } },
  { id: "rain", label: "Regen", data: { temp: 9, condition: "light rain", description: "Leichter Regen", icon: "10d" } },
  { id: "snow", label: "Schnee", data: { temp: -2, condition: "snow", description: "Schnee", icon: "13d" } },
];

// ─────────────────────────────────────────────────────────────────────────────
// Stat tooltip — light glass with connector line
// ─────────────────────────────────────────────────────────────────────────────

function StatBubble({
  weather,
  onWeatherChange,
  userLat,
  userLon,
  inZone,
  triggerScore,
  activeMerchantName,
  radiusMeters,
  routing,
}: {
  weather: WeatherData;
  onWeatherChange?: (w: WeatherData) => void;
  userLat: number;
  userLon: number;
  inZone: boolean;
  triggerScore: number;
  activeMerchantName?: string;
  radiusMeters: number;
  routing: boolean;
}) {
  const activeId = WEATHER_PRESETS.find((p) => p.data.condition === weather.condition)?.id ?? "cloud";
  const scoreColor = triggerScore > 0.7 ? "#E60000" : triggerScore > 0.4 ? "#D97706" : "#2563EB";

  return (
    <div className="relative flex flex-col items-center" style={{ pointerEvents: "auto" }}>
      <motion.div
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-3xl px-6 py-5 w-[320px]"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(15,20,30,0.06)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 50px rgba(15,20,30,0.12), 0 4px 16px rgba(15,20,30,0.06)",
          color: "#111827",
        }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Activity size={11} strokeWidth={2.2} style={{ color: "#E60000" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-500">Live Kontext</span>
            {routing && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 ml-1">
                <Navigation size={9} strokeWidth={2} />
                routing
              </span>
            )}
          </div>
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: `${scoreColor}14`, color: scoreColor, border: `1px solid ${scoreColor}33` }}
          >
            Score {Math.round(triggerScore * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {WEATHER_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onWeatherChange?.(p.data)}
              className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all"
              style={{
                background: activeId === p.id ? "rgba(230,0,0,0.08)" : "rgba(15,20,30,0.025)",
                border: activeId === p.id ? "1px solid rgba(230,0,0,0.45)" : "1px solid rgba(15,20,30,0.05)",
                color: activeId === p.id ? "#E60000" : "#374151",
              }}
              title={p.label}
            >
              <WeatherIconFor condition={p.data.condition} size={15} />
              <span className="text-[9px] font-bold">{p.data.temp}°</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-[10px]">
          <span className="font-mono text-gray-500 flex items-center gap-1 truncate">
            <MapPin size={10} strokeWidth={1.75} />
            {userLat.toFixed(4)}, {userLon.toFixed(4)}
          </span>
          <span className="text-gray-500 whitespace-nowrap">
            Radius <span className="font-bold" style={{ color: "#E60000" }}>{radiusMeters} m</span>
          </span>
        </div>

        {inZone && activeMerchantName && (
          <div
            className="mt-3 pt-3 text-[10px] font-bold flex items-center gap-1.5 border-t"
            style={{ borderColor: "rgba(15,20,30,0.06)", color: "#B91C1C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            In Zone · {activeMerchantName}
          </div>
        )}
      </motion.div>

      <svg width="2" height="44" className="-mt-px" style={{ overflow: "visible" }}>
        <line x1="1" y1="0" x2="1" y2="44" stroke="rgba(15,20,30,0.35)" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="1" cy="44" r="2.5" fill="#E60000" />
        <circle cx="1" cy="44" r="5" fill="rgba(230,0,0,0.18)">
          <animate attributeName="r" values="5;9;5" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export const FRIEND_PALETTE = [
  { base: "#1e3a8a", highlight: "#3b82f6", name: "Lukas" },
  { base: "#065f46", highlight: "#10b981", name: "Sophie" },
  { base: "#92400e", highlight: "#f59e0b", name: "Ben" },
  { base: "#581c87", highlight: "#a855f7", name: "Lea" },
  { base: "#9f1239", highlight: "#f43f5e", name: "Jonas" },
];

export interface FriendMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  base: string;
  highlight: string;
}

const METERS_PER_DEGREE_LAT = 111320;
const metersPerDegreeLon = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

// Pawn screen position: focus shifted to the left because the right half
// of the viewport is occupied by the phone + tablet device cluster.
const PAWN_FX = 0.28;
const PAWN_FY = 0.5;

interface MapboardViewProps {
  userLat: number;
  userLon: number;
  onMoveUser?: (lat: number, lon: number) => void;
  merchants: MerchantConfig[];
  weather: WeatherData;
  onWeatherChange?: (w: WeatherData) => void;
  inZone: boolean;
  activeMerchantId: string | null;
  triggerScore: number;
  hour?: number;
  /** Lifted radius state — bidirectional binding with the parent sidebar UI. */
  radiusMeters: number;
  onRadiusChange: (m: number) => void;
  /** Fired when the user-puck animation passes within ~80m of a merchant. */
  onRouteEncounter?: (merchantId: string) => void;
  /** Lifted Friends state — controlled by parent so the Friends UI can live
      inside the Live Kontext panel instead of floating over the map. */
  friends?: FriendMarker[];
  showFriends?: boolean;
  onRemoveFriend?: (id: string) => void;
}

export function MapboardView({
  userLat,
  userLon,
  onMoveUser,
  merchants,
  weather,
  onWeatherChange,
  inZone,
  activeMerchantId,
  triggerScore,
  hour = 12,
  radiusMeters,
  onRadiusChange,
  onRouteEncounter,
  friends = [],
  showFriends = false,
  onRemoveFriend,
}: MapboardViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pawnXY, setPawnXY] = useState({ x: 0, y: 0 });
  const [radiusPx, setRadiusPx] = useState(160);
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null);
  const [routing, setRouting] = useState(false);
  const lastRouteOriginRef = useRef<{ lat: number; lon: number } | null>({ lat: userLat, lon: userLon });
  const animationRef = useRef<number | null>(null);
  // Stable refs so callbacks/effects can read current position without stale closures
  const userLatRef = useRef(userLat);
  const userLonRef = useRef(userLon);
  useEffect(() => { userLatRef.current = userLat; userLonRef.current = userLon; }, [userLat, userLon]);

  // Track merchants already encountered on the current route so we only fire once per pass
  const encounteredRef = useRef<Set<string>>(new Set());
  const merchantsRef = useRef<MerchantConfig[]>(merchants);
  useEffect(() => { merchantsRef.current = merchants; }, [merchants]);
  const onRouteEncounterRef = useRef(onRouteEncounter);
  useEffect(() => { onRouteEncounterRef.current = onRouteEncounter; }, [onRouteEncounter]);

  // ─── Avatar geo-anchor: the puck is rendered at the projected screen position
  //     of (displayLat, displayLon). When idle, it equals (userLat, userLon).
  //     During a Click-to-Go walk, displayLat/Lon walks frame-by-frame along the
  //     OSRM route. Because rendering uses map.project([displayLon, displayLat]),
  //     the puck is firmly anchored to its real geographic position even while
  //     the user pans or zooms the map. ───
  const [displayLat, setDisplayLat] = useState(userLat);
  const [displayLon, setDisplayLon] = useState(userLon);

  // Right-click / long-press context menu („Gehen“ flow)
  const [ctxMenu, setCtxMenu] = useState<{ screenX: number; screenY: number; lat: number; lon: number } | null>(null);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: userLon,
    latitude: userLat,
    zoom: 16.4,
    pitch: 0,
    bearing: 0,
  });

  // applyPadding: only sets MapLibre padding + pawnXY based on screen size.
  // Does NOT jumpTo — snap-to-road animation handles all position changes.
  // On first load we jumpTo separately (see onLoad below).
  const applyPadding = useCallback(() => {
    const map = mapRef.current?.getMap();
    const el = containerRef.current;
    if (!map || !el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const targetX = w * PAWN_FX;
    const targetY = h * PAWN_FY;
    setPawnXY({ x: targetX, y: targetY });
    const rightPad = Math.max(0, w - 2 * targetX);
    const bottomPad = Math.max(0, h - 2 * targetY);
    map.setPadding({ top: 0, bottom: bottomPad, left: 0, right: rightPad });
  }, []); // no position deps — only screen geometry matters

  useEffect(() => {
    const onResize = () => applyPadding();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyPadding]);

  // ─── Snap-to-road: when target GPS changes, fetch OSRM walking route from
  //     last position to new target and BUTTERY-SMOOTH animate the map along
  //     the road network using a single requestAnimationFrame loop with
  //     arc-length parameterization (no setTimeout stair-stepping).
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const last = lastRouteOriginRef.current;
    if (!last) {
      lastRouteOriginRef.current = { lat: userLat, lon: userLon };
      return;
    }
    if (Math.abs(last.lat - userLat) < 1e-6 && Math.abs(last.lon - userLon) < 1e-6) return;

    let cancelled = false;
    const from = last;
    const to = { lat: userLat, lon: userLon };

    const haversine = (a: [number, number], b: [number, number]) => {
      const R = 6371000;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(b[1] - a[1]);
      const dLon = toRad(b[0] - a[0]);
      const lat1 = toRad(a[1]);
      const lat2 = toRad(b[1]);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    const animateAlong = (coords: [number, number][]) => {
      if (cancelled || coords.length < 2) {
        map.easeTo({ center: [to.lon, to.lat], duration: 900, easing: (t) => 1 - Math.pow(1 - t, 3) });
        lastRouteOriginRef.current = to;
        return;
      }
      // Pre-compute cumulative distances for arc-length parameterization
      const cumDist: number[] = [0];
      for (let i = 1; i < coords.length; i++) {
        cumDist.push(cumDist[i - 1] + haversine(coords[i - 1], coords[i]));
      }
      const total = cumDist[cumDist.length - 1];
      // Target speed: ~150m/s map glide (1.5–4s for typical 200–600m walks)
      const durationMs = Math.max(1400, Math.min(4200, total * 8));
      const startTs = performance.now();
      setRoutePath(coords);
      setRouting(true);

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const frame = () => {
        if (cancelled) return;
        const now = performance.now();
        const rawT = Math.min(1, (now - startTs) / durationMs);
        const t = easeInOutCubic(rawT);
        const targetDist = t * total;

        // Binary search for the segment containing targetDist
        let lo = 0, hi = cumDist.length - 1;
        while (lo < hi - 1) {
          const mid = (lo + hi) >> 1;
          if (cumDist[mid] <= targetDist) lo = mid;
          else hi = mid;
        }
        const segLen = cumDist[hi] - cumDist[lo];
        const segT = segLen > 0 ? (targetDist - cumDist[lo]) / segLen : 0;
        const lon = coords[lo][0] + (coords[hi][0] - coords[lo][0]) * segT;
        const lat = coords[lo][1] + (coords[hi][1] - coords[lo][1]) * segT;

        // Use jumpTo for the smoothest path — easeTo would queue overlapping eases
        map.jumpTo({ center: [lon, lat] });
        // Force re-projection of overlays/markers each frame by syncing viewState
        setViewState((vs) => ({ ...vs, longitude: lon, latitude: lat }));
        // Walk the puck's geo anchor along the route in lockstep with the camera.
        setDisplayLat(lat);
        setDisplayLon(lon);

        // Route-encounter detection: emit when the animated puck passes within 80m
        // of a merchant we haven't already announced this route.
        const PASS_RADIUS_M = 80;
        const ms = merchantsRef.current;
        for (let i = 0; i < ms.length; i++) {
          const mch = ms[i];
          if (encounteredRef.current.has(mch.id)) continue;
          if (haversine([lon, lat], [mch.lon, mch.lat]) <= PASS_RADIUS_M) {
            encounteredRef.current.add(mch.id);
            onRouteEncounterRef.current?.(mch.id);
          }
        }

        if (rawT >= 1) {
          setRouting(false);
          setRoutePath(null);
          lastRouteOriginRef.current = to;
          // Snap puck exactly onto the destination geo to avoid sub-pixel drift
          setDisplayLat(to.lat);
          setDisplayLon(to.lon);
          animationRef.current = null;
          return;
        }
        animationRef.current = requestAnimationFrame(frame) as unknown as number;
      };
      animationRef.current = requestAnimationFrame(frame) as unknown as number;
    };

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${from.lon},${from.lat};${to.lon},${to.lat}?geometries=geojson&overview=full`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
        if (!res.ok) throw new Error("router");
        const data = await res.json();
        const coords: [number, number][] | undefined = data?.routes?.[0]?.geometry?.coordinates;
        if (coords && coords.length > 1) {
          animateAlong(coords);
        } else {
          // Fallback: smooth flyTo straight line
          map.easeTo({ center: [to.lon, to.lat], duration: 900, easing: (t) => 1 - Math.pow(1 - t, 3) });
          lastRouteOriginRef.current = to;
        }
      } catch {
        map.easeTo({ center: [to.lon, to.lat], duration: 900, easing: (t) => 1 - Math.pow(1 - t, 3) });
        lastRouteOriginRef.current = to;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    // Reset per-route encounter cache before starting a new walk
    encounteredRef.current = new Set();
    fetchRoute();
    return () => {
      cancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [userLat, userLon]);

  const recomputeRadius = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const center = map.project([userLonRef.current, userLatRef.current]);
      const dLatDeg = radiusMeters / METERS_PER_DEGREE_LAT;
      const edge = map.project([userLonRef.current, userLatRef.current + dLatDeg]);
      const px = Math.hypot(edge.x - center.x, edge.y - center.y);
      setRadiusPx(px);
      return;
    }
    // Fallback: deterministic Web-Mercator metersPerPixel using current viewState
    const z = viewState.zoom ?? 16.4;
    const lat = userLatRef.current;
    const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, z);
    if (metersPerPixel > 0) setRadiusPx(radiusMeters / metersPerPixel);
  }, [radiusMeters, viewState.zoom]);

  // React to ANY change of radiusMeters (slider) or zoom — guarantees the
  // visual geofence circle resizes in real time, even if the map ref is busy.
  useEffect(() => {
    recomputeRadius();
  }, [recomputeRadius, radiusMeters, viewState.zoom, userLat, userLon]);

  // Use a ref for routing so handleMoveEnd never has a stale closure that
  // permanently blocks user-initiated panning.
  const routingRef = useRef(false);
  useEffect(() => { routingRef.current = routing; }, [routing]);

  const handleMove = useCallback(() => recomputeRadius(), [recomputeRadius]);
  const handleMoveEnd = useCallback(() => {
    // Decoupled: panning/zooming the map does NOT move the user puck.
    // Movement only happens via explicit Click-to-Go (right-click / long-press).
    recomputeRadius();
  }, [recomputeRadius]);

  // Click-to-Go: right-click (desktop) / long-press (mobile) on the map sets a
  // new GPS target. The snap-to-road effect picks it up and animates the puck.
  const longPressTimerRef = useRef<number | null>(null);
  const handleContextMenu = useCallback(
    (e: { preventDefault?: () => void; point?: { x: number; y: number }; lngLat?: { lng: number; lat: number } }) => {
      e.preventDefault?.();
      if (!onMoveUser) return;
      const ll = e.lngLat;
      if (!ll) return;
      const map = mapRef.current?.getMap();
      let sx = e.point?.x;
      let sy = e.point?.y;
      if ((sx === undefined || sy === undefined) && map) {
        const p = map.project([ll.lng, ll.lat]);
        sx = p.x; sy = p.y;
      }
      setCtxMenu({ screenX: sx ?? 0, screenY: sy ?? 0, lat: ll.lat, lon: ll.lng });
    },
    [onMoveUser],
  );
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!onMoveUser) return;
    const map = mapRef.current?.getMap();
    if (!map) return;
    const t = e.touches[0];
    if (!t) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      const ll = map.unproject([x, y]);
      // Open the context menu instead of walking immediately.
      setCtxMenu({ screenX: x, screenY: y, lat: ll.lat, lon: ll.lng });
    }, 600) as unknown as number;
  }, [onMoveUser]);
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const removeFriend = (id: string) => onRemoveFriend?.(id);

  const activeMerchant = merchants.find((m) => m.id === activeMerchantId);

  const lightTint = useMemo(() => {
    const c = weather.condition.toLowerCase();
    const isNight = hour < 6 || hour > 20;
    if (isNight) return "linear-gradient(180deg, rgba(70,90,140,0.10) 0%, rgba(40,55,90,0.14) 100%)";
    if (c.includes("rain")) return "linear-gradient(180deg, rgba(130,150,180,0.18) 0%, rgba(100,125,160,0.22) 100%)";
    if (c.includes("snow")) return "linear-gradient(180deg, rgba(220,230,245,0.22) 0%, rgba(195,215,240,0.26) 100%)";
    if (c.includes("clear") || c.includes("sun"))
      return "linear-gradient(180deg, rgba(255,210,140,0.18) 0%, rgba(255,180,100,0.10) 100%)";
    return "linear-gradient(180deg, rgba(180,190,210,0.16) 0%, rgba(150,160,180,0.20) 100%)";
  }, [weather.condition, hour]);

  // Project route path to screen pixels for overlay rendering
  const routeScreen = useMemo(() => {
    const map = mapRef.current?.getMap();
    if (!map || !routePath) return null;
    return routePath.map(([lon, lat]) => map.project([lon, lat]));
  }, [routePath, viewState]); // re-project on view change

  // Project merchant geo coords to screen pixels — re-projects on every map move
  const merchantScreen = useMemo(() => {
    const map = mapRef.current?.getMap();
    if (!map) return [];
    return merchants.map((m) => {
      const p = map.project([m.lon, m.lat]);
      return { merchant: m, x: p.x, y: p.y };
    });
  }, [merchants, viewState]);

  // Project the puck's geo anchor (displayLat/Lon) to current screen pixels.
  // This re-runs on every viewState change so the avatar stays glued to the
  // street while the user pans / zooms — no more drift across the map.
  const puckScreen = useMemo(() => {
    const map = mapRef.current?.getMap();
    if (!map) return { x: pawnXY.x, y: pawnXY.y };
    const p = map.project([displayLon, displayLat]);
    return { x: p.x, y: p.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLat, displayLon, viewState, pawnXY]);

  // Project the pending right-click target to current screen pixels for the
  // floating „Gehen“ menu so it stays anchored on the map while panning.
  const ctxMenuScreen = useMemo(() => {
    if (!ctxMenu) return null;
    const map = mapRef.current?.getMap();
    if (!map) return { x: ctxMenu.screenX, y: ctxMenu.screenY };
    const p = map.project([ctxMenu.lon, ctxMenu.lat]);
    return { x: p.x, y: p.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxMenu, viewState]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#F8F9FA" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <Map
        ref={mapRef}
        mapStyle={LIGHT_STYLE}
        {...viewState}
        onMove={(e) => { setViewState(e.viewState); handleMove(); }}
        onMoveEnd={handleMoveEnd}
        onContextMenu={handleContextMenu}
        onClick={() => { if (ctxMenu) setCtxMenu(null); }}
        onLoad={() => {
          applyPadding();
          // Jump to user's initial position accounting for the new padding
          const m = mapRef.current?.getMap();
          if (m) m.jumpTo({ center: [userLonRef.current, userLatRef.current] });
        }}
        maxPitch={20}
        minZoom={13}
        maxZoom={19}
        attributionControl={{ compact: true }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {merchants.map((m) => {
          // Hidden: rendered as projected divs above the map for proper z-ordering.
          // Keep Marker only for keeping the map's interaction model intact (anchored DOM).
          void m;
          return null;
        })}

        {showFriends &&
          friends.map((f) => (
            <Marker key={f.id} longitude={f.lon} latitude={f.lat} anchor="bottom" pitchAlignment="viewport">
              <div className="relative flex flex-col items-center">
                <div
                  className="rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{
                    width: 32,
                    height: 32,
                    background: f.highlight,
                    boxShadow: "0 6px 16px rgba(15,20,30,0.22), 0 0 0 2px rgba(255,255,255,0.95)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
                <button
                  onClick={() => removeFriend(f.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center text-gray-700 hover:text-red-600"
                  title="Entfernen"
                >
                  <X size={10} strokeWidth={2.5} />
                </button>
                <div
                  className="mt-1 text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: f.highlight, boxShadow: "0 4px 10px rgba(15,20,30,0.25)" }}
                >
                  {f.name}
                </div>
              </div>
            </Marker>
          ))}
      </Map>

      <div className="absolute inset-0 pointer-events-none mix-blend-multiply" style={{ background: lightTint }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(15,20,30,0.10) 100%)" }}
      />

      {/* Route polyline overlay (snap-to-road visualization) */}
      {routeScreen && routeScreen.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} width="100%" height="100%">
          <polyline
            fill="none"
            stroke="rgba(230,0,0,0.55)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 6"
            points={routeScreen.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        </svg>
      )}

      {/* Native flat shop pins — projected screen-space, above radius overlay */}
      {merchantScreen.map(({ merchant, x, y }) => {
        const isActive = merchant.id === activeMerchantId;
        const oh = merchant.openingHours;
        const isOpen = !oh || (hour >= oh.open && hour < oh.close);
        return (
          <div
            key={merchant.id}
            className="absolute pointer-events-none flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: `translate(-50%, -100%) scale(${isActive ? 1.12 : 1})`,
              transformOrigin: "bottom center",
              transition: "transform 250ms cubic-bezier(.2,.7,.2,1), opacity 250ms ease, filter 250ms ease",
              zIndex: 25,
              willChange: "transform",
              opacity: isOpen ? 1 : 0.38,
              filter: isOpen ? "none" : "grayscale(85%) saturate(0.6)",
            }}
          >
            <MapPin2 category={merchant.category} active={isActive} size={isActive ? 48 : 42} />
            <div
              className="mt-1.5 text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full"
              style={{
                background: isActive ? "#E60000" : "rgba(255,255,255,0.97)",
                color: isActive ? "#fff" : "#212529",
                boxShadow: isActive
                  ? "0 8px 18px rgba(230,0,0,0.32), 0 1px 0 rgba(255,255,255,0.4) inset"
                  : "0 4px 14px rgba(15,20,30,0.10), 0 0 0 1px rgba(15,20,30,0.05)",
              }}
            >
              {merchant.name}{!isOpen && <span className="ml-1 text-[8px] font-semibold" style={{ color: isActive ? "rgba(255,255,255,0.85)" : "#9CA3AF" }}>• geschlossen</span>}
            </div>
          </div>
        );
      })}

      {/* Soft circular geofence ring (flat, native-style) */}
      <div
        className="absolute pointer-events-none"
        style={{ left: puckScreen.x, top: puckScreen.y, transform: "translate(-50%, -50%)", width: radiusPx * 2, height: radiusPx * 2, zIndex: 6 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: inZone
              ? "radial-gradient(circle, rgba(230,0,0,0.05) 55%, rgba(230,0,0,0.14) 100%)"
              : "radial-gradient(circle, rgba(230,0,0,0.025) 60%, rgba(230,0,0,0.08) 100%)",
            border: `1.5px dashed ${inZone ? "rgba(230,0,0,0.7)" : "rgba(230,0,0,0.45)"}`,
          }}
        />
      </div>

      {/* User location puck — native maps style (red dot + pulse halo) */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{ left: puckScreen.x, top: puckScreen.y, transform: "translate(-50%, -50%)" }}
      >
        <LocationPuck size={24} />
      </div>

      {/* Stat bubble + connector — moved out: the Live Kontext box is now
          rendered as a fixed bottom-left "Control Center" panel in app/page.tsx
          to free up the map area. The StatBubble component is still used for
          its visual format reference, but no longer rendered on the map. */}

      {/* User pawn (legacy slot — kept empty; the LocationPuck is rendered above) */}
      <div className="hidden" />

      {/* Floating „Gehen“ context menu — opens on right-click / long-press,
          stays anchored to the chosen geo point while panning/zooming. */}
      {ctxMenu && ctxMenuScreen && (
        <div
          className="absolute z-50"
          style={{
            left: ctxMenuScreen.x,
            top: ctxMenuScreen.y,
            transform: "translate(-50%, calc(-100% - 14px))",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div
            className="flex items-center gap-1 px-1.5 py-1.5 rounded-2xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(15,20,30,0.06)",
              boxShadow: "0 14px 32px rgba(15,20,30,0.18), 0 2px 6px rgba(15,20,30,0.06)",
            }}
          >
            <button
              onClick={() => {
                if (!ctxMenu) return;
                onMoveUser?.(ctxMenu.lat, ctxMenu.lon);
                setCtxMenu(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-transform active:scale-95"
              style={{
                background: "#E60000",
                boxShadow: "0 4px 12px rgba(230,0,0,0.32), 0 1px 0 rgba(255,255,255,0.25) inset",
                letterSpacing: "-0.01em",
              }}
            >
              <Footprints size={12} strokeWidth={2.4} />
              Gehen
            </button>
            <button
              onClick={() => setCtxMenu(null)}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              style={{ color: "#6B7280" }}
              title="Schließen"
            >
              <X size={11} strokeWidth={2.4} />
            </button>
          </div>
          {/* small downward tick */}
          <div
            className="mx-auto"
            style={{
              width: 10,
              height: 10,
              marginTop: -5,
              transform: "rotate(45deg)",
              background: "#FFFFFF",
              borderRight: "1px solid rgba(15,20,30,0.06)",
              borderBottom: "1px solid rgba(15,20,30,0.06)",
              boxShadow: "3px 3px 6px rgba(15,20,30,0.06)",
            }}
          />
        </div>
      )}

      {/* Friends bubble + floating radius slider were moved out — they now live
          inside the Live Kontext & Control panel (rendered in app/page.tsx)
          to eliminate overlaps with the device cluster on the right. */}
    </div>
  );
}
