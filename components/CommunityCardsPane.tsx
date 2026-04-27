"use client";

import { Card } from "@/lib/poker-evaluator";
import CardDisplay from "./CardDisplay";
import CardPlaceholder from "./CardPlaceholder";

interface CommunityCardsPaneProps {
  communityCards: Card[];
  street: string;
}

export default function CommunityCardsPane({
  communityCards,
  street,
}: CommunityCardsPaneProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-bold mb-6">Community Cards</h2>
      <div className="flex flex-col gap-4 flex-1">
        {/* Community cards row - 5 card slots */}
        <div className="flex gap-2 items-start flex-nowrap">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx}>
              {communityCards[idx] ? (
                <div className="animate-fadeIn">
                  <CardDisplay card={communityCards[idx]} size="sm" />
                </div>
              ) : (
                <CardPlaceholder size="sm" />
              )}
            </div>
          ))}
        </div>

        {/* Street status */}
        <div className="mt-auto">
          <div className="chip gold w-fit">
            {street === "pre-flop"
              ? "Pre-Flop"
              : street === "flop"
                ? "Flop"
                : street === "turn"
                  ? "Turn"
                  : street === "river"
                    ? "River"
                    : "Game in progress"}
          </div>
        </div>
      </div>
    </div>
  );
}
