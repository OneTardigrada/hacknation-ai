"use client";
import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudSnow, Sun, Users, UserPlus, X, Maximize2 } from "lucide-react";
import type { MerchantConfig } from "@/config/city.config";
import type { WeatherData } from "@/lib/context-engine";

const METERS_PER_DEGREE_LAT = 111320;
const metersPerDegreeLon = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);
const PX_PER_METER = 1.4; // visual zoom

// ─────────────────────────────────────────────────────────────────────────────
// Wood pieces (SVG)
// ─────────────────────────────────────────────────────────────────────────────

function WoodPawn({ color = "#3d2817", highlight = "#8b5a2b", size = 56 }: { color?: string; highlight?: string; size?: number }) {
  return (
    <svg viewBox="-25 -65 50 75" width={size} height={size * 1.5} style={{ filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))" }}>
      <defs>
        <radialGradient id={`pawn-head-${color}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor={highlight} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor="#1a0f08" />
        </radialGradient>
        <linearGradient id={`pawn-body-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1a0f08" />
          <stop offset="40%" stopColor={color} />
          <stop offset="60%" stopColor={highlight} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      {/* shadow ellipse */}
      <ellipse cx="0" cy="8" rx="16" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* base disk */}
      <ellipse cx="0" cy="6" rx="15" ry="4.5" fill={color} />
      <ellipse cx="0" cy="4.5" rx="15" ry="4" fill={`url(#pawn-body-${color})`} />
      {/* body cone/trapezoid */}
      <path d="M -11 4 Q -13 -10 -7 -22 L 7 -22 Q 13 -10 11 4 Z" fill={`url(#pawn-body-${color})`} />
      {/* neck ring */}
      <ellipse cx="0" cy="-22" rx="7" ry="2" fill={color} />
      <ellipse cx="0" cy="-23" rx="7" ry="2" fill={highlight} />
      {/* head */}
      <circle cx="0" cy="-35" r="11" fill={`url(#pawn-head-${color})`} />
      {/* head highlight */}
      <ellipse cx="-3" cy="-38" rx="3" ry="2.2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function WoodHouse({ active = false, size = 60 }: { active?: boolean; size?: number }) {
  const front = active ? "#FF1F1F" : "#E60000";
  const side = active ? "#A00000" : "#8B0000";
  const roof = active ? "#FF5555" : "#FF3333";
  const roofTop = active ? "#FF7777" : "#FF5555";
  return (
    <svg viewBox="0 0 70 80" width={size} height={size * (80 / 70)} style={{ filter: active ? "drop-shadow(0 6px 8px rgba(230,0,0,0.5))" : "drop-shadow(0 4px 4px rgba(0,0,0,0.3))" }}>
      {/* shadow */}
      <ellipse cx="35" cy="74" rx="26" ry="4" fill="rgba(0,0,0,0.3)" />
      {/* right side face (3D) */}
      <polygon points="50,68 50,38 60,30 60,60" fill={side} />
      {/* front face */}
      <rect x="14" y="38" width="36" height="30" fill={front} />
      {/* front highlight strip */}
      <rect x="14" y="38" width="3" height="30" fill="rgba(255,255,255,0.18)" />
      {/* right roof slope */}
      <polygon points="14,38 50,38 60,30 24,30" fill={roof} />
      {/* left/top roof slope (front-facing peak) */}
      <polygon points="14,38 32,18 60,30 24,30" fill={roofTop} />
      {/* roof ridge highlight */}
      <line x1="32" y1="18" x2="60" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* door */}
      <rect x="28" y="50" width="8" height="18" fill="#5a0000" rx="1" />
      <circle cx="34" cy="60" r="0.8" fill="#FFD700" />
      {/* window */}
      <rect x="38" y="46" width="8" height="8" fill="#FFE066" stroke="#5a0000" strokeWidth="0.8" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Weather icon helper
// ─────────────────────────────────────────────────────────────────────────────

function WeatherIconFor({ condition, size = 14 }: { condition: string; size?: number }) {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return <CloudRain size={size} />;
  if (c.includes("snow")) return <CloudSnow size={size} />;
  if (c.includes("clear") || c.includes("sun")) return <Sun size={size} />;
  return <Cloud size={size} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating Context Dialog above the pawn
// ─────────────────────────────────────────────────────────────────────────────

interface ContextDialogProps {
  weather: WeatherData;
  onWeatherChange?: (w: WeatherData) => void;
  userLat: number;
  userLon: number;
  inZone: boolean;
  triggerScore: number;
  activeMerchantName?: string;
}

const WEATHER_PRESETS: Array<{ id: string; label: string; data: WeatherData }> = [
  { id: "sun", label: "Sonnig", data: { temp: 24, condition: "clear sky", description: "Sonnig", icon: "01d" } },
  { id: "cloud", label: "Bewölkt", data: { temp: 14, condition: "overcast clouds", description: "Bedeckt", icon: "04d" } },
  { id: "rain", label: "Regen", data: { temp: 9, condition: "light rain", description: "Leichter Regen", icon: "10d" } },
  { id: "snow", label: "Schnee", data: { temp: -2, condition: "snow", description: "Schnee", icon: "13d" } },
];

function ContextDialog({ weather, onWeatherChange, userLat, userLon, inZone, triggerScore, activeMerchantName }: ContextDialogProps) {
  const activeId =
    WEATHER_PRESETS.find((p) => p.data.condition === weather.condition)?.id ?? "cloud";

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 px-3 py-2.5 w-[260px]"
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}
    >
      {/* Pointer triangle */}
      <div
        className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid rgba(255,255,255,0.95)",
          filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.06))",
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Kontext-Simulator</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
          style={{
            background: triggerScore > 0.7 ? "#FFE5E5" : triggerScore > 0.4 ? "#FEF3C7" : "#E0F2FE",
            color: triggerScore > 0.7 ? "#E60000" : triggerScore > 0.4 ? "#92400e" : "#0369a1",
          }}
        >
          Score {Math.round(triggerScore * 100)}%
        </span>
      </div>

      {/* Weather chips */}
      <div className="flex gap-1 mb-2">
        {WEATHER_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onWeatherChange?.(p.data)}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg border transition-all"
            style={{
              background: activeId === p.id ? "#FFF1F2" : "#F9FAFB",
              borderColor: activeId === p.id ? "#E60000" : "#E5E7EB",
              color: activeId === p.id ? "#E60000" : "#6B7280",
            }}
            title={p.label}
          >
            <WeatherIconFor condition={p.data.condition} size={14} />
            <span className="text-[9px] font-semibold">{p.data.temp}°</span>
          </button>
        ))}
      </div>

      {/* GPS + zone */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-mono text-gray-500">
          {userLat.toFixed(4)}, {userLon.toFixed(4)}
        </span>
        {inZone && activeMerchantName ? (
          <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold">
            ▸ {activeMerchantName.split(" ")[0]}
          </span>
        ) : (
          <span className="text-gray-400">außerhalb Zone</span>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BoardgameMap
// ─────────────────────────────────────────────────────────────────────────────

interface Friend {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  highlight: string;
}

const FRIEND_PALETTE = [
  { color: "#1e3a8a", highlight: "#3b82f6", name: "Lukas" },
  { color: "#065f46", highlight: "#10b981", name: "Sophie" },
  { color: "#92400e", highlight: "#f59e0b", name: "Ben" },
  { color: "#581c87", highlight: "#a855f7", name: "Lea" },
  { color: "#9f1239", highlight: "#f43f5e", name: "Jonas" },
];

interface BoardgameMapProps {
  userLat: number;
  userLon: number;
  onMoveUser?: (lat: number, lon: number) => void;
  merchants: MerchantConfig[];
  weather: WeatherData;
  onWeatherChange?: (w: WeatherData) => void;
  inZone: boolean;
  activeMerchantId: string | null;
  triggerScore: number;
}

export function BoardgameMap({
  userLat,
  userLon,
  onMoveUser,
  merchants,
  weather,
  onWeatherChange,
  inZone,
  activeMerchantId,
  triggerScore,
}: BoardgameMapProps) {
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showFriends, setShowFriends] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; lat: number; lon: number } | null>(null);

  // GPS → relative pixel (user always at center)
  const gpsToPixel = useCallback(
    (lat: number, lon: number) => {
      const dLat = (lat - userLat) * METERS_PER_DEGREE_LAT;
      const dLon = (lon - userLon) * metersPerDegreeLon(userLat);
      return { x: dLon * PX_PER_METER, y: -dLat * PX_PER_METER };
    },
    [userLat, userLon]
  );

  const radiusPx = radiusMeters * PX_PER_METER;

  const addFriend = () => {
    if (friends.length >= FRIEND_PALETTE.length) return;
    const palette = FRIEND_PALETTE[friends.length];
    const angle = (friends.length / FRIEND_PALETTE.length) * Math.PI * 2 + Math.PI / 4;
    const dist = 60 + friends.length * 30;
    const dLat = (Math.cos(angle) * dist) / METERS_PER_DEGREE_LAT;
    const dLon = (Math.sin(angle) * dist) / metersPerDegreeLon(userLat);
    setFriends((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: palette.name,
        lat: userLat + dLat,
        lon: userLon + dLon,
        color: palette.color,
        highlight: palette.highlight,
      },
    ]);
    setShowFriends(true);
  };

  const removeFriend = (id: string) => setFriends((prev) => prev.filter((f) => f.id !== id));

  // Map drag panning → updates user GPS
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onMoveUser) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY, lat: userLat, lon: userLon };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || !onMoveUser) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // Dragging map RIGHT means user moves LEFT (lon decreases)
    const dLon = -dx / PX_PER_METER / metersPerDegreeLon(dragStartRef.current.lat);
    const dLat = dy / PX_PER_METER / METERS_PER_DEGREE_LAT;
    onMoveUser(dragStartRef.current.lat + dLat, dragStartRef.current.lon + dLon);
  };
  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  const activeMerchant = merchants.find((m) => m.id === activeMerchantId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-gray-200 select-none"
      style={{
        background: "linear-gradient(135deg, #eef0f2 0%, #d8dde2 100%)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08), inset 0 0 60px rgba(0,0,0,0.04)",
        cursor: dragStartRef.current ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ─────────── Map terrain (the world that moves under the pawn) ─────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            // Subtle isometric grid + diagonal "streets"
            `linear-gradient(0deg, rgba(140,150,160,0.18) 1px, transparent 1px),
             linear-gradient(90deg, rgba(140,150,160,0.18) 1px, transparent 1px),
             radial-gradient(ellipse at center, transparent 50%, rgba(120,130,140,0.18) 100%)`,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%",
          // Shift grid based on user GPS so it feels like world panning
          backgroundPosition: `${(-userLon * metersPerDegreeLon(userLat) * PX_PER_METER) % 48}px ${(userLat * METERS_PER_DEGREE_LAT * PX_PER_METER) % 48}px, ${(-userLon * metersPerDegreeLon(userLat) * PX_PER_METER) % 48}px ${(userLat * METERS_PER_DEGREE_LAT * PX_PER_METER) % 48}px, center`,
        }}
      />

      {/* "Streets" — diagonal accent lines, also shift with pan */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-60"
        animate={{
          backgroundPositionX: -((userLon - 9.18) * metersPerDegreeLon(userLat) * PX_PER_METER),
          backgroundPositionY: ((userLat - 48.778) * METERS_PER_DEGREE_LAT * PX_PER_METER),
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{
          backgroundImage: `
            linear-gradient(135deg, transparent 47%, rgba(173,181,189,0.45) 47%, rgba(173,181,189,0.45) 53%, transparent 53%),
            linear-gradient(45deg, transparent 47%, rgba(173,181,189,0.35) 47%, rgba(173,181,189,0.35) 53%, transparent 53%)
          `,
          backgroundSize: "180px 180px, 240px 240px",
        }}
      />

      {/* ─────────── Merchants (red wood houses) ─────────── */}
      {merchants.map((m) => {
        const { x, y } = gpsToPixel(m.lat, m.lon);
        const isActive = m.id === activeMerchantId;
        return (
          <motion.div
            key={m.id}
            className="absolute z-20 pointer-events-none"
            initial={false}
            animate={{
              x,
              y,
              scale: isActive ? 1.12 : 1,
            }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%)`,
            }}
          >
            <div className="relative flex flex-col items-center" style={{ transform: "translate(-50%, -100%)" }}>
              <WoodHouse active={isActive} size={isActive ? 64 : 54} />
              <div
                className="absolute -bottom-5 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isActive ? "#E60000" : "rgba(255,255,255,0.95)",
                  color: isActive ? "#fff" : "#374151",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                {m.name}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ─────────── Friends (additional avatars) ─────────── */}
      {showFriends &&
        friends.map((f) => {
          const { x, y } = gpsToPixel(f.lat, f.lon);
          return (
            <motion.div
              key={f.id}
              className="absolute z-20 pointer-events-auto"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, x, y }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%)`,
              }}
            >
              <div className="relative flex flex-col items-center" style={{ transform: "translate(-50%, -100%)" }}>
                <WoodPawn color={f.color} highlight={f.highlight} size={44} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFriend(f.id);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-500 hover:text-red-500"
                  title="Entfernen"
                >
                  <X size={10} />
                </button>
                <div
                  className="absolute -bottom-4 whitespace-nowrap text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: f.highlight, color: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
                >
                  {f.name}
                </div>
              </div>
            </motion.div>
          );
        })}

      {/* ─────────── Radius indicator (centered on pawn / viewport) ─────────── */}
      <motion.div
        className="absolute pointer-events-none z-10"
        animate={{
          width: radiusPx * 2,
          height: radiusPx * 2,
          opacity: inZone ? 0.9 : 0.7,
        }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: inZone
            ? "radial-gradient(circle, rgba(230,0,0,0.06) 50%, rgba(230,0,0,0.22) 100%)"
            : "radial-gradient(circle, rgba(230,0,0,0.04) 60%, rgba(230,0,0,0.14) 100%)",
          border: `2px dashed ${inZone ? "rgba(230,0,0,0.7)" : "rgba(230,0,0,0.45)"}`,
        }}
      />

      {/* Pulsing inner ring while inZone */}
      {inZone && (
        <motion.div
          className="absolute pointer-events-none z-10"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            width: radiusPx * 2,
            height: radiusPx * 2,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: "2px solid rgba(230,0,0,0.6)",
          }}
        />
      )}

      {/* ─────────── Centered floating context dialog ─────────── */}
      <div
        className="absolute z-40 pointer-events-auto"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, calc(-100% - 70px))" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ContextDialog
          weather={weather}
          onWeatherChange={onWeatherChange}
          userLat={userLat}
          userLon={userLon}
          inZone={inZone}
          triggerScore={triggerScore}
          activeMerchantName={activeMerchant?.name}
        />
      </div>

      {/* ─────────── Centered user pawn (always static) ─────────── */}
      <motion.div
        className="absolute z-30 pointer-events-none"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: "50%", top: "50%", transform: "translate(-50%, calc(-100% + 8px))" }}
      >
        <WoodPawn color="#3d2817" highlight="#a0703d" size={64} />
      </motion.div>

      {/* ─────────── Top-left brand chip ─────────── */}
      <div
        className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-sm shadow"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Maximize2 size={12} className="text-gray-500" />
        <span className="text-[10px] font-bold text-gray-700">Mylo · Boardgame View</span>
      </div>

      {/* ─────────── Top-right "Demo+" Friends button ─────────── */}
      <div
        className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Additional Feature
        </span>
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl shadow px-1.5 py-1.5 border border-purple-200">
          <button
            onClick={() => setShowFriends((s) => !s)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={showFriends ? "Friends ausblenden" : "Friends einblenden"}
          >
            <Users size={14} className={showFriends ? "text-purple-600" : "text-gray-400"} />
          </button>
          <button
            onClick={addFriend}
            disabled={friends.length >= FRIEND_PALETTE.length}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
          >
            <UserPlus size={12} />
            Freund
          </button>
          <span className="text-[9px] font-mono text-gray-500 px-0.5">{friends.length}</span>
        </div>
      </div>

      {/* ─────────── Bottom radius slider ─────────── */}
      <div
        className="absolute bottom-3 left-3 right-3 z-30 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl shadow px-3 py-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Radius</span>
        <input
          type="range"
          min={50}
          max={400}
          step={10}
          value={radiusMeters}
          onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
          className="flex-1 accent-red-600"
        />
        <span className="text-[11px] font-bold text-red-600 font-mono w-14 text-right">{radiusMeters} m</span>
      </div>

      {/* Drag hint */}
      {!dragStartRef.current && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-[9px] text-gray-500 font-medium px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-sm"
        >
          Karte ziehen · Position simulieren
        </div>
      )}
    </div>
  );
}
