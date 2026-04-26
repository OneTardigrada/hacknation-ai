"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_FRIENDS, buildGroupOffer, type Friend } from "@/lib/friends";

interface FriendsLayerProps {
  merchantName: string;
  onGroupOfferReady: (headline: string, discount: string) => void;
}

export function FriendsLayer({ merchantName, onGroupOfferReady }: FriendsLayerProps) {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [inviteSent, setInviteSent] = useState(false);

  const toggleConsent = (id: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, consentGiven: !f.consentGiven } : f))
    );
  };

  const groupOffer = buildGroupOffer(
    friends.filter((f) => f.consentGiven && f.nearSameMerchant),
    merchantName
  );

  const handleGroupInvite = () => {
    setInviteSent(true);
    onGroupOfferReady(groupOffer.headline, groupOffer.discount);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        Friends Layer
      </p>

      <div className="space-y-2">
        {friends.map((f) => (
          <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#FF1F1F 0%,#C40000 100%)" }}>{f.pseudonym.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800">{f.pseudonym}</p>
              <p className="text-[10px] text-gray-500">{f.distanceMeters}m entfernt</p>
              {f.nearSameMerchant && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
                  Auch in der Nähe von {merchantName}
                </span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => toggleConsent(f.id)}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: f.consentGiven ? "#dcfce7" : "#fee2e2",
                  color: f.consentGiven ? "#166534" : "#991B1B",
                }}
              >
                {f.consentGiven ? "✓ Einwilligung" : "Anfragen"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700">{groupOffer.headline}</p>
        <p className="text-xs text-gray-500">{groupOffer.subline}</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black" style={{ color: "#E60000" }}>
            {groupOffer.discount}
          </span>
          <span className="text-[10px] text-gray-400">
            {groupOffer.currentParticipants}/{groupOffer.minParticipants} Personen
          </span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleGroupInvite}
        disabled={inviteSent}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-70"
        style={{ background: inviteSent ? "#16a34a" : "#E60000" }}
      >
        {inviteSent ? "✓ Gruppen-Angebot aktiv!" : groupOffer.cta}
      </motion.button>
    </div>
  );
}
