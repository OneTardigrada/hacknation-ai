"use client";
import { Cloud, CloudRain, CloudSnow, Sun, MapPin, Clock } from "lucide-react";

interface ContextBadgesProps {
  temp: number;
  condition: string;
  distanceMeters: number;
  txLabel: string;
  time: string;
}

function WeatherIcon({ condition }: { condition: string }) {
  if (condition.includes("rain") || condition.includes("drizzle")) return <CloudRain size={11} />;
  if (condition.includes("snow")) return <CloudSnow size={11} />;
  if (condition.includes("cloud") || condition.includes("overcast")) return <Cloud size={11} />;
  return <Sun size={11} />;
}

export function ContextBadges({ temp, condition, distanceMeters, txLabel, time }: ContextBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-xs font-medium text-gray-700">
        <WeatherIcon condition={condition} /> {temp}°C
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-xs font-medium text-gray-700">
        <MapPin size={11} /> {distanceMeters}m
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-xs font-medium text-gray-700">
        <Clock size={11} /> {time}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 text-xs font-medium text-gray-700">
        {txLabel}
      </span>
    </div>
  );
}
