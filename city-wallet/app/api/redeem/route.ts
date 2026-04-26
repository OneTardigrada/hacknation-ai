// app/api/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";

interface RedeemRequest {
  token: string;
  merchantId: string;
  discount: string;
  method: "cashback" | "qr";
}

export async function POST(req: NextRequest) {
  const body: RedeemRequest = await req.json();
  const { token, merchantId, discount, method } = body;

  // Validate token format (CW-XXXXX or PO-XXXX)
  if (!token || !/^[A-Z]{2}-[A-Z0-9]{4,5}$/.test(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Simulate cashback processing
  const discountPct = parseInt(discount.replace(/[^0-9]/g, "")) || 15;
  const estimatedSavings = (discountPct / 100) * (3.5 + Math.random() * 5);

  return NextResponse.json({
    success: true,
    token,
    merchantId,
    method,
    savingsEur: estimatedSavings.toFixed(2),
    cashbackScheduled: method === "cashback",
    message:
      method === "cashback"
        ? `${estimatedSavings.toFixed(2)} € werden auf deine Sparkassen-Card gutgeschrieben`
        : "QR-Code erfolgreich gescannt",
    processedAt: new Date().toISOString(),
  });
}
