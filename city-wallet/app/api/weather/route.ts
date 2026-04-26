// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

const CACHE: { data: unknown; ts: number } | null = null;
let weatherCache: { data: unknown; ts: number } | null = null;

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "Stuttgart";

  // 5-minute cache
  if (weatherCache && Date.now() - weatherCache.ts < 5 * 60 * 1000) {
    return NextResponse.json(weatherCache.data);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // Return mock data when no API key
    const mock = {
      temp: 11,
      condition: "overcast clouds",
      description: "Bedeckt",
      icon: "04d",
      humidity: 72,
      windSpeed: 3.5,
      city,
    };
    return NextResponse.json(mock);
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("Weather API error");
    const raw = await res.json();
    const data = {
      temp: Math.round(raw.main.temp),
      condition: raw.weather[0]?.description ?? "clear",
      description: raw.weather[0]?.description ?? "Klar",
      icon: raw.weather[0]?.icon ?? "01d",
      humidity: raw.main.humidity,
      windSpeed: raw.wind?.speed ?? 0,
      city: raw.name,
    };
    weatherCache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    const mock = {
      temp: 11,
      condition: "overcast clouds",
      description: "Bedeckt",
      icon: "04d",
      humidity: 72,
      windSpeed: 3.5,
      city,
    };
    return NextResponse.json(mock);
  }
}
