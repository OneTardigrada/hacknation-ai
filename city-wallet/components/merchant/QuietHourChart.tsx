"use client";
import { BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

interface QuietHourChartProps {
  data: { hour: number; tx: number; label: string }[];
  currentHour: number;
  offerFiredAt?: number;
}

const CARD_STYLE: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #EEF0F3",
  boxShadow: "0 1px 2px rgba(15,20,30,0.04), 0 8px 24px rgba(15,20,30,0.04)",
};

// Stable references — defined outside the component to prevent recharts setState loops
const TICK_STYLE = { fontSize: 10, fill: "#9CA3AF" };
const CHART_MARGIN = { top: 6, right: 8, bottom: 0, left: -22 };
const TOOLTIP_STYLE = {
  fontSize: 11,
  borderRadius: 10,
  border: "1px solid #EEF0F3",
  boxShadow: "0 8px 24px rgba(15,20,30,0.08)",
};
const GRID_STYLE = "#F3F4F6";
const NOW_LABEL = { value: "Jetzt", position: "top" as const, fontSize: 9, fill: "#374151" };
const OFFER_LABEL = { value: "Angebot", position: "top" as const, fontSize: 9, fill: "#E60000" };
const tickFormatter = (h: number) => `${h}h`;
const tooltipFormatter = (v: unknown) => [`${v} tx/h`, "Transaktionen"] as [string, string];

export function QuietHourChart({ data, currentHour, offerFiredAt }: QuietHourChartProps) {
  return (
    <div className="rounded-2xl p-4" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#FFF1F1", color: "#E60000" }}
          >
            <BarChart3 size={14} strokeWidth={2.2} />
          </div>
          <p className="text-[12px] font-semibold text-gray-800">
            Transaktionen / Stunde
          </p>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: "#F3F4F6", color: "#6B7280" }}
        >
          Payone-Sim
        </span>
      </div>
      <div style={{ width: 408, height: 148 }}>
        <AreaChart width={408} height={148} data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E60000" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#E60000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STYLE} />
          <XAxis dataKey="hour" tick={TICK_STYLE} tickFormatter={tickFormatter} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={tooltipFormatter} />
          <Area type="monotone" dataKey="tx" stroke="#E60000" strokeWidth={2.2} fill="url(#txGrad)" />
          <ReferenceLine x={currentHour} stroke="#1A1A1A" strokeDasharray="3 3" label={NOW_LABEL} />
          {offerFiredAt !== undefined && (
            <ReferenceLine x={offerFiredAt} stroke="#E60000" strokeWidth={2} label={OFFER_LABEL} />
          )}
        </AreaChart>
      </div>
      <div className="flex items-center gap-4 mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#E60000" }} />
          <span className="text-[10px] text-gray-500">Transaktionen</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-px border-t border-dashed border-gray-700" />
          <span className="text-[10px] text-gray-500">Jetzt · {currentHour}:00</span>
        </div>
      </div>
    </div>
  );
}
