"use client";

interface TimeMachineProps {
  hour: number;
  onChange: (hour: number) => void;
}

export function TimeMachine({ hour, onChange }: TimeMachineProps) {
  const timeLabel = `${String(hour).padStart(2, "0")}:00`;
  const period =
    hour < 6 ? "Nacht" :
    hour < 11 ? "Morgen" :
    hour < 14 ? "Mittag" :
    hour < 18 ? "Nachmittag" :
    hour < 21 ? "Abend" : "Nacht";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold text-gray-900">{timeLabel}</span>
        <span className="text-[9px] text-gray-500">{period}</span>
      </div>
      <input
        type="range"
        min={6}
        max={22}
        value={hour}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
      />
      <div className="flex justify-between text-[9px] text-gray-400">
        <span>06:00</span>
        <span>14:00</span>
        <span>22:00</span>
      </div>
    </div>
  );
}
