// lib/merchant-sim.ts
// Simulated Payone-Feed: realistic quiet/busy patterns per merchant category

export interface MerchantSnapshot {
  merchantId: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  txPerHour: number;
  revenueLastHour: number;
}

function getTxLevel(txRate: number): "LOW" | "MEDIUM" | "HIGH" {
  if (txRate < 3) return "LOW";
  if (txRate < 8) return "MEDIUM";
  return "HIGH";
}

// Cafe busy 8-10, 12-13 | quiet 10-12, 14-17
function cafeTxRate(hour: number): number {
  if (hour >= 8 && hour < 10) return 12;
  if (hour >= 10 && hour < 11) return 3;
  if (hour >= 11 && hour < 11.5) return 2;
  if (hour >= 12 && hour < 13) return 10;
  if (hour >= 14 && hour < 16) return 2;
  if (hour >= 16 && hour < 18) return 5;
  return 4;
}

// Bakery busy 7-10, dead 14-18
function bakeryTxRate(hour: number): number {
  if (hour >= 7 && hour < 10) return 14;
  if (hour >= 10 && hour < 12) return 6;
  if (hour >= 12 && hour < 13) return 8;
  if (hour >= 14 && hour < 18) return 1;
  return 3;
}

// Smoothie: busy morning + noon, quiet mid afternoon
function smoothieTxRate(hour: number): number {
  if (hour >= 7 && hour < 9) return 10;
  if (hour >= 11 && hour < 13) return 9;
  if (hour >= 14 && hour < 17) return 2;
  return 4;
}

export function getMerchantSnapshot(merchantId: string, hour: number): MerchantSnapshot {
  let txRate: number;
  if (merchantId === "cafe-muller") txRate = cafeTxRate(hour);
  else if (merchantId === "stadtbaeckerei") txRate = bakeryTxRate(hour);
  else if (merchantId === "smoothie-bar") txRate = smoothieTxRate(hour);
  else txRate = Math.max(1, Math.round(5 + Math.sin(hour / 3) * 4));

  const level = getTxLevel(txRate);
  const labels: Record<string, string> = {
    LOW: "Wenig los",
    MEDIUM: "Normal",
    HIGH: "Sehr belebt",
  };

  return {
    merchantId,
    level,
    label: labels[level],
    txPerHour: txRate,
    revenueLastHour: txRate * (8 + Math.random() * 12),
  };
}

export function getAllMerchantSnapshots(merchantIds: string[], hour: number): MerchantSnapshot[] {
  return merchantIds.map((id) => getMerchantSnapshot(id, hour));
}

// Generate hourly data for charts
export function getHourlyData(merchantId: string): { hour: number; tx: number; label: string }[] {
  return Array.from({ length: 24 }, (_, h) => {
    let txRate: number;
    if (merchantId === "cafe-muller") txRate = cafeTxRate(h);
    else if (merchantId === "stadtbaeckerei") txRate = bakeryTxRate(h);
    else txRate = smoothieTxRate(h);
    return { hour: h, tx: txRate, label: `${h}:00` };
  });
}
