// lib/preorder.ts
export interface PreOrder {
  id: string;
  merchantId: string;
  merchantName: string;
  item: string;
  scheduledTime: string;
  status: "pending" | "confirmed" | "ready" | "picked_up";
  discount: string;
  token: string;
}

export interface PreOrderItem {
  id: string;
  label: string;
  price: number;
  emoji: string;
}

export const MENU_ITEMS: Record<string, PreOrderItem[]> = {
  "cafe-muller": [
    { id: "cappuccino", label: "Cappuccino", price: 3.5, emoji: "☕" },
    { id: "latte", label: "Latte Macchiato", price: 4.2, emoji: "🥛" },
    { id: "espresso", label: "Espresso", price: 2.5, emoji: "☕" },
  ],
  "stadtbaeckerei": [
    { id: "croissant", label: "Croissant", price: 2.0, emoji: "🥐" },
    { id: "pretzel", label: "Brezel", price: 1.5, emoji: "🥨" },
    { id: "bread", label: "Brot", price: 3.5, emoji: "🍞" },
  ],
  "smoothie-bar": [
    { id: "protein", label: "Protein Shake", price: 6.5, emoji: "💪" },
    { id: "green", label: "Green Boost", price: 7.0, emoji: "🥬" },
    { id: "berry", label: "Berry Mix", price: 6.0, emoji: "🍓" },
  ],
};

export function createPreOrder(
  merchantId: string,
  merchantName: string,
  item: PreOrderItem,
  scheduledTime: string,
  discount: string
): PreOrder {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "PO-";
  for (let i = 0; i < 4; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return {
    id: `order-${Date.now()}`,
    merchantId,
    merchantName,
    item: item.label,
    scheduledTime,
    status: "confirmed",
    discount,
    token,
  };
}
