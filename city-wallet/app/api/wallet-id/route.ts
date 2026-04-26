// app/api/wallet-id/route.ts
import { NextResponse } from "next/server";
import { createWalletIdentity } from "@/lib/wallet-id";

export async function GET() {
  const identity = createWalletIdentity();
  return NextResponse.json(identity);
}
