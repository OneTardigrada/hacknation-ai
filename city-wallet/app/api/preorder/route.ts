// app/api/preorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPreOrder, MENU_ITEMS } from "@/lib/preorder";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { merchantId, merchantName, itemId, scheduledTime, discount } = body;

  const menuItems = MENU_ITEMS[merchantId] ?? MENU_ITEMS["cafe-muller"];
  const item = menuItems.find((i) => i.id === itemId) ?? menuItems[0];

  const order = createPreOrder(merchantId, merchantName, item, scheduledTime, discount || "15% OFF");
  return NextResponse.json(order);
}

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get("merchantId") || "cafe-muller";
  const items = MENU_ITEMS[merchantId] ?? MENU_ITEMS["cafe-muller"];
  return NextResponse.json({ items });
}
