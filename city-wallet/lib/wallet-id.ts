// lib/wallet-id.ts
// Pseudonymous wallet identity — no real PII

export function generateWalletId(): string {
  const prefix = "CW";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = prefix + "-";
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function generateOfferToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "CW-";
  for (let i = 0; i < 5; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export interface WalletIdentity {
  walletId: string;
  createdAt: string;
  pseudonym: string;
}

export function createWalletIdentity(): WalletIdentity {
  const adjectives = ["Ruhige", "Schnelle", "Freundliche", "Neugierige", "Entspannte"];
  const nouns = ["Ente", "Möwe", "Eule", "Katze", "Fuchs"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return {
    walletId: generateWalletId(),
    createdAt: new Date().toISOString(),
    pseudonym: `${adj}${noun}`,
  };
}
