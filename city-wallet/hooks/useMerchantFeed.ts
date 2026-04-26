"use client";
import { useState, useEffect } from "react";
import { getMerchantSnapshot, getHourlyData, type MerchantSnapshot } from "@/lib/merchant-sim";

export function useMerchantFeed(merchantId: string, hour: number) {
  const [snapshot, setSnapshot] = useState<MerchantSnapshot>(() =>
    getMerchantSnapshot(merchantId, hour)
  );
  const [hourlyData, setHourlyData] = useState(() => getHourlyData(merchantId));
  const [acceptCount, setAcceptCount] = useState(0);
  const [dismissCount, setDismissCount] = useState(0);
  const [revenueRecovered, setRevenueRecovered] = useState(0);

  useEffect(() => {
    setSnapshot(getMerchantSnapshot(merchantId, hour));
    setHourlyData(getHourlyData(merchantId));
  }, [merchantId, hour]);

  const recordAccept = (savingsEur: number) => {
    setAcceptCount((c) => c + 1);
    setRevenueRecovered((r) => r + parseFloat(String(savingsEur)));
  };
  const recordDismiss = () => setDismissCount((c) => c + 1);

  return { snapshot, hourlyData, acceptCount, dismissCount, revenueRecovered, recordAccept, recordDismiss };
}
