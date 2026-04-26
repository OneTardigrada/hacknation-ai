// lib/friends.ts
export interface Friend {
  id: string;
  pseudonym: string;
  emoji: string;
  distanceMeters: number;
  consentGiven: boolean;
  nearSameMerchant: boolean;
}

export interface GroupOffer {
  type: "group";
  discount: string;
  headline: string;
  subline: string;
  cta: string;
  minParticipants: number;
  currentParticipants: number;
}

export const MOCK_FRIENDS: Friend[] = [
  {
    id: "friend-1",
    pseudonym: "SchnellerFuchs",
    emoji: "🦊",
    distanceMeters: 120,
    consentGiven: true,
    nearSameMerchant: true,
  },
  {
    id: "friend-2",
    pseudonym: "RuhigeEnte",
    emoji: "🦆",
    distanceMeters: 450,
    consentGiven: false,
    nearSameMerchant: false,
  },
];

export function buildGroupOffer(friends: Friend[], merchantName: string): GroupOffer {
  const nearbyConsented = friends.filter((f) => f.consentGiven && f.nearSameMerchant);
  const participants = nearbyConsented.length + 1; // +1 for self
  return {
    type: "group",
    discount: participants >= 2 ? "20% OFF" : "15% OFF",
    headline: `Zu ${participants > 1 ? "zweit" : "dritt"} ist es besser ☕`,
    subline: `Gemeinsam bei ${merchantName} — ${participants >= 2 ? "20%" : "15%"} für alle`,
    cta: "Gemeinsam holen",
    minParticipants: 2,
    currentParticipants: participants,
  };
}
