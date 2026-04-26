export interface MerchantConfig {
  id: string;
  name: string;
  category: "cafe" | "bakery" | "smoothie" | "restaurant" | "retail";
  lat: number;
  lon: number;
  maxDiscount: number;
  productFocus: string;
  tone: "warm" | "factual" | "energetic";
  goal: "quiet_hour_fill" | "brand_awareness" | "upsell";
  quietHours: { start: number; end: number }[];
  busyHours: { start: number; end: number }[];
  emoji: string;
  /** High-quality hero image URL for shop detail view */
  heroImage?: string;
  /** Short tagline shown under name in detail view */
  tagline?: string;
  /** Simulated opening hours in 24h local time. close > open ⇒ same day. */
  openingHours?: { open: number; close: number };
}

export interface EventSourceConfig {
  type: "eventbrite" | "local_mock";
  city: string;
}

export interface SeasonalTag {
  id: string;
  label: string;
  emoji: string;
  colorOverride?: string;
  gradientOverride?: string;
}

export interface AutomationConfig {
  enableAntiBot: boolean;
  maxOffersPerHour: number;
}

export interface CityConfig {
  city: {
    name: string;
    lat: number;
    lon: number;
    weatherApiCity: string;
    locale: string;
    currency: string;
    timezone: string;
  };
  merchants: MerchantConfig[];
  eventSources: EventSourceConfig[];
  paymentProvider: "payone" | "stripe" | "mock";
  automationRisk?: AutomationConfig;
  slmModel: "phi3" | "gemma" | "mock";
  seasonalTags: SeasonalTag[];
}

export const CAFE_MULLER: MerchantConfig = {
  id: "cafe-muller",
  name: "Café Müller",
  category: "cafe",
  lat: 48.20689,
  lon: 16.36481,
  maxDiscount: 20,
  productFocus: "Heiße Getränke",
  tone: "warm",
  goal: "quiet_hour_fill",
  quietHours: [{ start: 14, end: 16 }, { start: 10, end: 11 }],
  busyHours: [{ start: 8, end: 10 }, { start: 12, end: 13 }],
  emoji: "☕",
  heroImage: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80&auto=format&fit=crop",
  tagline: "Wiener Kaffeehaus-Kultur seit 1923",
  openingHours: { open: 7, close: 22 },
};

export const SMOOTHIE_BAR: MerchantConfig = {
  id: "smoothie-bar",
  name: "GreenBoost Bar",
  category: "smoothie",
  lat: 48.20015,
  lon: 16.35563,
  maxDiscount: 15,
  productFocus: "Protein Shakes",
  tone: "energetic",
  goal: "brand_awareness",
  quietHours: [{ start: 14, end: 17 }],
  busyHours: [{ start: 7, end: 9 }, { start: 11, end: 13 }],
  emoji: "💪",
  heroImage: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop",
  tagline: "Cold-pressed juices & power smoothies",
  openingHours: { open: 7, close: 21 },
};

export const BAKERY: MerchantConfig = {
  id: "stadtbaeckerei",
  name: "Stadtbäckerei",
  category: "bakery",
  lat: 48.20081,
  lon: 16.36988,
  maxDiscount: 25,
  productFocus: "Frisches Brot & Backwaren",
  tone: "warm",
  goal: "quiet_hour_fill",
  quietHours: [{ start: 14, end: 18 }],
  busyHours: [{ start: 7, end: 10 }],
  emoji: "🥐",
  heroImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop",
  tagline: "Täglich frisch · Sauerteig & Mehlspeisen",
  openingHours: { open: 6, close: 19 },
};

export const VIENNA_EXTRA_MERCHANTS: MerchantConfig[] = [
  { id: "cafe-central", name: "Café Central", category: "cafe", lat: 48.21042, lon: 16.36636, maxDiscount: 18, productFocus: "Wiener Melange", tone: "warm", goal: "brand_awareness", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 9, end: 11 }], emoji: "☕", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Cafe_Central_Wien_2017_3.jpg/640px-Cafe_Central_Wien_2017_3.jpg", tagline: "Traditionskaffeehaus seit 1876", openingHours: { open: 7, close: 22 } },
  { id: "cafe-sacher", name: "Café Sacher", category: "cafe", lat: 48.20389, lon: 16.36916, maxDiscount: 12, productFocus: "Sachertorte", tone: "warm", goal: "upsell", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 10, end: 12 }], emoji: "🍰", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hotel_Sacher_-_panoramio.jpg/640px-Hotel_Sacher_-_panoramio.jpg", tagline: "Original Sacher-Torte", openingHours: { open: 8, close: 23 } },
  { id: "cafe-hawelka", name: "Café Hawelka", category: "cafe", lat: 48.20871, lon: 16.36985, maxDiscount: 15, productFocus: "Buchteln & Kaffee", tone: "warm", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 17 }], busyHours: [{ start: 19, end: 22 }], emoji: "☕", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Cafe_Hawelka_2014a.jpg/640px-Cafe_Hawelka_2014a.jpg", tagline: "Bohemian Kaffeehaus", openingHours: { open: 8, close: 24 } },
  { id: "demel", name: "Demel", category: "bakery", lat: 48.20929, lon: 16.36677, maxDiscount: 10, productFocus: "K. u. K. Hofzuckerbäcker", tone: "factual", goal: "brand_awareness", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 11, end: 14 }], emoji: "🧁", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Wien_-_Konditorei_Demel_%282%29.JPG/640px-Wien_-_Konditorei_Demel_%282%29.JPG", tagline: "Hofzuckerbäcker seit 1786", openingHours: { open: 9, close: 19 } },
  { id: "aida", name: "Aida Wien", category: "cafe", lat: 48.20801, lon: 16.37196, maxDiscount: 20, productFocus: "Mehlspeisen", tone: "warm", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 8, end: 10 }], emoji: "🍰", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Wien_01_Stock-im-Eisen-Platz_a.jpg/640px-Wien_01_Stock-im-Eisen-Platz_a.jpg", tagline: "Pink Pastel Kaffeehaus", openingHours: { open: 7, close: 22 } },
  { id: "naschmarkt-deli", name: "Naschmarkt Deli", category: "restaurant", lat: 48.19867, lon: 16.36347, maxDiscount: 15, productFocus: "Mediterranean Brunch", tone: "energetic", goal: "upsell", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 12, end: 14 }], emoji: "🥗", heroImage: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop", tagline: "Naschmarkt Brunch Spot", openingHours: { open: 8, close: 23 } },
  { id: "figlmueller", name: "Figlmüller", category: "restaurant", lat: 48.20889, lon: 16.37469, maxDiscount: 10, productFocus: "Wiener Schnitzel", tone: "warm", goal: "brand_awareness", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 19, end: 21 }], emoji: "🍴", heroImage: "https://images.unsplash.com/photo-1599921841143-2ec7e60d76ec?w=800&q=80&auto=format&fit=crop", tagline: "Heimat des Schnitzels", openingHours: { open: 11, close: 22 } },
  { id: "plachutta", name: "Plachutta", category: "restaurant", lat: 48.20821, lon: 16.37745, maxDiscount: 12, productFocus: "Tafelspitz", tone: "warm", goal: "upsell", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 19, end: 21 }], emoji: "🥩", heroImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop", tagline: "Tafelspitz-Tradition", openingHours: { open: 11, close: 24 } },
  { id: "trzesniewski", name: "Trześniewski", category: "restaurant", lat: 48.20945, lon: 16.36888, maxDiscount: 15, productFocus: "Brötchen", tone: "factual", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 11, end: 14 }], emoji: "🥪", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Trze%C5%9Bniewski_in_Wien.jpg/640px-Trze%C5%9Bniewski_in_Wien.jpg", tagline: "Unaussprechlich gute Brötchen", openingHours: { open: 8, close: 19 } },
  { id: "leberkas-pepi", name: "Leberkas Pepi", category: "restaurant", lat: 48.20768, lon: 16.36812, maxDiscount: 10, productFocus: "Leberkäse", tone: "energetic", goal: "brand_awareness", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 12, end: 14 }], emoji: "🌭", heroImage: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80&auto=format&fit=crop", tagline: "Wiens beste Leberkäse-Semmel", openingHours: { open: 9, close: 20 } },
  { id: "joseph-brot", name: "Joseph Brot", category: "bakery", lat: 48.20156, lon: 16.36681, maxDiscount: 22, productFocus: "Sauerteig & Croissants", tone: "warm", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 18 }], busyHours: [{ start: 7, end: 10 }], emoji: "🥖", heroImage: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=800&q=80&auto=format&fit=crop", tagline: "Slow-fermented Sauerteig", openingHours: { open: 7, close: 19 } },
  { id: "felzl-bakery", name: "Felzl", category: "bakery", lat: 48.21227, lon: 16.36031, maxDiscount: 25, productFocus: "Frische Backwaren", tone: "warm", goal: "quiet_hour_fill", quietHours: [{ start: 15, end: 18 }], busyHours: [{ start: 7, end: 9 }], emoji: "🥐", heroImage: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop", tagline: "Bio-Bäckerei mit Charme", openingHours: { open: 6, close: 18 } },
  { id: "zuckerlwerkstatt", name: "Zuckerlwerkstatt", category: "retail", lat: 48.20991, lon: 16.37132, maxDiscount: 18, productFocus: "Handgemachte Zuckerl", tone: "warm", goal: "brand_awareness", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 11, end: 13 }], emoji: "🍬", heroImage: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=800&q=80&auto=format&fit=crop", tagline: "Manufaktur für Bonbons", openingHours: { open: 10, close: 18 } },
  { id: "manner", name: "Manner Stammhaus", category: "retail", lat: 48.21028, lon: 16.37274, maxDiscount: 15, productFocus: "Neapolitaner Schnitten", tone: "factual", goal: "brand_awareness", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 10, end: 12 }], emoji: "🍫", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Manner_Stephansplatz_2014.jpg/640px-Manner_Stephansplatz_2014.jpg", tagline: "Rosa Wiener Original", openingHours: { open: 9, close: 21 } },
  { id: "meinl-am-graben", name: "Meinl am Graben", category: "retail", lat: 48.20966, lon: 16.36918, maxDiscount: 10, productFocus: "Feinkost", tone: "factual", goal: "upsell", quietHours: [{ start: 14, end: 16 }], busyHours: [{ start: 11, end: 14 }], emoji: "🛒", heroImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Wien_01_Graben_19_a.jpg/640px-Wien_01_Graben_19_a.jpg", tagline: "Premium-Feinkost seit 1862", openingHours: { open: 8, close: 19 } },
  { id: "steamring-coffee", name: "Steamring Coffee", category: "cafe", lat: 48.19773, lon: 16.36812, maxDiscount: 22, productFocus: "Specialty Coffee", tone: "energetic", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 17 }], busyHours: [{ start: 8, end: 10 }], emoji: "☕", heroImage: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80&auto=format&fit=crop", tagline: "Third-wave roastery", openingHours: { open: 7, close: 18 } },
  { id: "balthasar-coffee", name: "Balthasar Kaffee Bar", category: "cafe", lat: 48.21678, lon: 16.36495, maxDiscount: 18, productFocus: "Espresso & Pour-Over", tone: "energetic", goal: "brand_awareness", quietHours: [{ start: 14, end: 17 }], busyHours: [{ start: 8, end: 10 }], emoji: "☕", heroImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop", tagline: "Specialty Espresso", openingHours: { open: 7, close: 19 } },
  { id: "fenster-cafe", name: "Fenster Café", category: "cafe", lat: 48.20567, lon: 16.35987, maxDiscount: 20, productFocus: "Take-away Coffee", tone: "energetic", goal: "quiet_hour_fill", quietHours: [{ start: 14, end: 17 }], busyHours: [{ start: 8, end: 10 }], emoji: "☕", heroImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80&auto=format&fit=crop", tagline: "Coffee aus dem Fenster", openingHours: { open: 7, close: 17 } },
  { id: "yamm-bar", name: "Yamm! Vegan", category: "smoothie", lat: 48.21368, lon: 16.36214, maxDiscount: 18, productFocus: "Bowls & Smoothies", tone: "energetic", goal: "brand_awareness", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 12, end: 14 }], emoji: "🥤", heroImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop", tagline: "Plant-based all day", openingHours: { open: 8, close: 22 } },
  { id: "swing-kitchen", name: "Swing Kitchen", category: "restaurant", lat: 48.21204, lon: 16.36719, maxDiscount: 16, productFocus: "Vegan Burger", tone: "energetic", goal: "upsell", quietHours: [{ start: 15, end: 17 }], busyHours: [{ start: 12, end: 14 }], emoji: "🍔", heroImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop", tagline: "100% Plant-based Burger", openingHours: { open: 11, close: 23 } },
];

export const STUTTGART_CONFIG: CityConfig = {
  city: {
    name: "Wien",
    lat: 48.20849,
    lon: 16.37208,
    weatherApiCity: "Vienna",
    locale: "de-AT",
    currency: "EUR",
    timezone: "Europe/Vienna",
  },
  merchants: [CAFE_MULLER, SMOOTHIE_BAR, BAKERY, ...VIENNA_EXTRA_MERCHANTS],
  eventSources: [{ type: "local_mock", city: "Stuttgart" }],
  paymentProvider: "mock",
  slmModel: "mock",
  seasonalTags: [
    { id: "halloween", label: "Halloween", emoji: "🎃", gradientOverride: "linear-gradient(135deg, #1a0a2e 0%, #2d1a5e 100%)", colorOverride: "#a855f7" },
    { id: "christmas", label: "Weihnachten", emoji: "🎄", gradientOverride: "linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)", colorOverride: "#ef4444" },
    { id: "summer", label: "Sommer", emoji: "☀️", gradientOverride: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", colorOverride: "#f59e0b" },
  ],
};

export const MUNICH_CONFIG: CityConfig = {
  city: {
    name: "München",
    lat: 48.1351,
    lon: 11.582,
    weatherApiCity: "Munich",
    locale: "de-DE",
    currency: "EUR",
    timezone: "Europe/Berlin",
  },
  merchants: [
    { ...CAFE_MULLER, id: "cafe-haidhausen", name: "Café Haidhausen", lat: 48.132, lon: 11.593 },
    { ...BAKERY, id: "hofbaeckerei", name: "Hofbäckerei", lat: 48.137, lon: 11.576 },
  ],
  eventSources: [{ type: "local_mock", city: "Munich" }],
  paymentProvider: "payone",
  slmModel: "mock",
  seasonalTags: [
    { id: "oktoberfest", label: "Oktoberfest", emoji: "🍺", gradientOverride: "linear-gradient(135deg, #78350f 0%, #92400e 100%)", colorOverride: "#d97706" },
    { id: "christmas", label: "Weihnachten", emoji: "🎄" },
  ],
};

const configMap: Record<string, CityConfig> = {
  stuttgart: STUTTGART_CONFIG,
  munich: MUNICH_CONFIG,
};

export function getActiveCityConfig(): CityConfig {
  const key = (process.env.NEXT_PUBLIC_CITY_CONFIG || "stuttgart").toLowerCase();
  return configMap[key] ?? STUTTGART_CONFIG;
}
