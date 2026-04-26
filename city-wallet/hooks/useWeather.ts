"use client";
import { useState, useEffect } from "react";

export interface WeatherState {
  temp: number;
  condition: string;
  description: string;
  icon: string;
  loading: boolean;
  error: string | null;
}

export function useWeather(city: string = "Stuttgart", overrideTemp?: number, overrideCondition?: string) {
  const [weather, setWeather] = useState<WeatherState>({
    temp: overrideTemp ?? 11,
    condition: overrideCondition ?? "overcast clouds",
    description: "Bedeckt",
    icon: "04d",
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (overrideTemp !== undefined) {
      setWeather((w) => ({ ...w, temp: overrideTemp, condition: overrideCondition ?? w.condition }));
      return;
    }
    setWeather((w) => ({ ...w, loading: true }));
    fetch(`/api/weather?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => setWeather({ ...data, loading: false, error: null }))
      .catch((e) => setWeather((w) => ({ ...w, loading: false, error: e.message })));
  }, [city, overrideTemp, overrideCondition]);

  return weather;
}
