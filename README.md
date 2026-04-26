# Mylo — Generative City-Wallet

> A context-aware, AI-generated offer wallet that turns weather, time, location and merchant goals into one perfect, time-boxed deal.
> Submitted to the **5th Hack-Nation** hackathon (Agentic AI & Data Engineering track).

![Sparkassen red](https://img.shields.io/badge/brand-Sparkassen%20red-E60000)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

---

## What is Mylo?

Local cafés sit empty at 3 PM and overcrowded at 1 PM. Coupons don't fix that — **context** does.

**Mylo** is a generative city-wallet that fuses four real-time signals (weather, hour, geofence distance, merchant goal) into a single, structured prompt and asks an LLM to generate one perfect, time-boxed offer — streamed live to the customer's phone.

Three surfaces, one brain:

| Surface | Role |
|--|--|
| **Consumer phone** | Receives one swipeable offer card with QR redemption + countdown |
| **Merchant tablet** | Configures rules, sees pre-order queue, quiet-hour analytics, share-count |
| **City boardgame map** | Stakeholder view — geofences, merchants, live offer pulses |

---

## Key features

- **AI-generated offers** — streaming JSON from OpenAI, progressively rendered as tokens arrive
- **Deterministic fallback** — works fully without an API key (rule-based pipeline)
- **Geofencing** — Haversine-based distance + radius rings
- **Pre-order flow** — full state machine from intent → queue → ETA
- **QR + cashback redemption**
- **Wallet ID** — pseudonymous token, never PII to merchants
- **Friends layer** — opt-in social graph + share-codes with share-count on the merchant dashboard
- **Transaction history** — auditable, one-tap erasable
- **Settings & consent** — granular opt-ins for location, weather, transactions, friends (GDPR-konform)
- **On-device SLM path** — `lib/slm-layer.ts` sketches a small-language-model fallback for full privacy
- **Demo tools** — persona selector, time machine, scenario presets, seasonal toggle

---

## Tech stack

| Layer | Tools |
|--|--|
| Framework | Next.js 16 (App Router, route handlers) |
| Language | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS 4, glassmorphism, Sparkassen red `#E60000` |
| Motion | Framer Motion 12 |
| Maps | MapLibre GL + react-map-gl |
| Icons | Lucide React (100% SVG) |
| Charts | Recharts |
| AI | OpenAI streaming (with deterministic fallback) |
| External signals | OpenWeatherMap (with mock fallback) |

See [`city-wallet/public/tech-stack.html`](city-wallet/public/tech-stack.html) for the full architecture diagram.

---

## Project structure

```
city-wallet/
├── app/
│   ├── api/                    # Next.js route handlers
│   │   ├── generate-offer/     # Streaming LLM offer generation
│   │   ├── merchant-stats/     # Quiet/busy hours, share-count
│   │   ├── preorder/           # Pre-order queue
│   │   ├── redeem/             # QR + cashback finalisation
│   │   ├── wallet-id/          # Pseudonymous token issuance
│   │   └── weather/            # OpenWeatherMap proxy
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── city/                   # Boardgame map, geofences
│   ├── consumer/               # Phone mockup, offer card, QR
│   ├── demo/                   # Persona, time machine, scenarios
│   ├── merchant/               # Dashboard, rule configurator
│   └── wallet/                 # Wallet ID, friends layer
├── hooks/                      # useStreamingOffer, useContextState
├── lib/                        # Domain logic (pure TS)
│   ├── context-engine.ts
│   ├── geofence.ts
│   ├── offer-prompt.ts
│   ├── slm-layer.ts
│   ├── friends.ts
│   ├── wallet-id.ts
│   ├── merchant-sim.ts
│   ├── personas.ts
│   ├── scenarios.ts
│   └── preorder.ts
├── config/city.config.ts
└── public/
    ├── pitch-script.html       # 60-second pitch teleprompter
    ├── pitch-demo-script.html
    ├── pitch-demo-slides.html
    └── tech-stack.html         # Architecture diagram
```

---

## Getting started

### Prerequisites

- **Node.js 20 or later** (check with `node -v`)
- **npm 10 or later** (ships with Node)

### 1 — Install dependencies

> **Important:** all commands must be run from inside the `city-wallet/` folder, **not** the repo root.

```powershell
cd city-wallet
npm install
```

### 2 — (Optional) configure environment

Create `city-wallet/.env.local` if you want live LLM + weather data. The app works without it — it falls back to a deterministic offer pipeline and mock weather.

```bash
# city-wallet/.env.local
OPENAI_API_KEY=sk-...
OPENWEATHERMAP_API_KEY=...
```

### 3 — Run the dev server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4 — Build for production

```powershell
npm run build
npm run start
```

---

## Troubleshooting

### `npm run dev` fails with "Missing script: dev" or similar

You're in the wrong folder. Make sure you're inside `city-wallet/`:

```powershell
cd city-wallet
npm run dev
```

### Port 3000 already in use

```powershell
npm run dev -- -p 3001
```

### LLM offers look "too generic"

You're running without an `OPENAI_API_KEY`. The deterministic fallback is intentionally simple. Add a key to `.env.local` and restart.

### Map tiles not loading

The boardgame view uses MapLibre with a custom raster style. If your network blocks tile servers, the map renders an empty canvas — the rest of the app still works.

---

## Static reference pages

Once the dev server is running:

- **Tech stack architecture:** [http://localhost:3000/tech-stack.html](http://localhost:3000/tech-stack.html)

You can also open these HTML files directly from disk via `file://` — no server required.

---

## Privacy & GDPR

Mylo is built consent-first:

- Every signal (location, weather, transactions, friends) is individually opt-in.
- The wallet identity is **pseudonymous** — merchants only ever see a token.
- The LLM receives only four signals (weather, hour, distance, goal) — no PII, no transaction history.
- An on-device small-language-model path (`lib/slm-layer.ts`) is sketched for full-privacy generation.
- One tap clears history and the share-graph (right to erasure).

---

## License

This project was built for the 5th Hack-Nation hackathon. See repository for license details.

