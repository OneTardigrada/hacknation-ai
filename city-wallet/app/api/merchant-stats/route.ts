// app/api/merchant-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMerchantSnapshot, getHourlyData } from "@/lib/merchant-sim";

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId") || "cafe-muller";
  const hour = parseInt(req.nextUrl.searchParams.get("hour") || String(new Date().getHours()));

  const snapshot = getMerchantSnapshot(merchantId, hour);
  const hourlyData = getHourlyData(merchantId);

  return NextResponse.json({ snapshot, hourlyData });
}
