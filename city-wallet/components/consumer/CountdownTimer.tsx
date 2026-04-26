"use client";
import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  minutes: number;
  onExpire?: () => void;
  running?: boolean;
}

export function CountdownTimer({ minutes, onExpire, running = true }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(ref.current!);
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [running, onExpire]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = seconds / (minutes * 60);
  const color = pct > 0.5 ? "#22c55e" : pct > 0.2 ? "#f59e0b" : "#E60000";

  return (
    <span className="tabular-nums font-mono text-sm font-semibold" style={{ color }}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} ⏱
    </span>
  );
}
