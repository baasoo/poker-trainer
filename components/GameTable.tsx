"use client";

import { Card } from "@/lib/poker-evaluator";
import CardDisplay from "./CardDisplay";

interface GameTableProps {
  numPlayers: number;
  holeCards: Card[][];
  communityCards: Card[];
  street: string;
}

export default function GameTable({
  numPlayers,
  holeCards,
  communityCards,
  street,
}: GameTableProps) {
  return (
    <div className="container-poker">
      <div className="flex gap-8">
        {/* Hole Cards Column - Left Side (less than half width) */}
        <div className="w-80">
          <h2 className="text-lg font-bold mb-6">Players' Hands</h2>
          <div className="flex flex-col gap-4">
            {holeCards.map((cards, playerIdx) => {
                return (
                <div key={playerIdx} className="flex items-center gap-3">
                  <div className="min-w-12 font-bold">
                    {`P${playerIdx + 1}`}
                  </div>
                  <div className="flex gap-2">
                    {cards.length === 2 ? (
                      <>
                        <div className="animate-fadeIn">
                          <CardDisplay card={cards[0]} size="md" />
                        </div>
                        <div className="animate-fadeIn">
                          <CardDisplay card={cards[1]} size="md" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                          <span className="text-gray-400 text-xl">?</span>
                        </div>
                        <div className="w-16 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                          <span className="text-gray-400 text-xl">?</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Cards Column - Right Side */}
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-6">Community Cards</h2>
          <div className="flex gap-4 min-h-40 items-start">
            {communityCards.length > 0 ? (
              communityCards.map((card, idx) => (
                <div key={idx} className="animate-fadeIn">
                  <CardDisplay card={card} size="lg" />
                </div>
              ))
            ) : (
              <div className="text-gray-400 flex items-center">
                Waiting for community cards...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game status */}
      <div className="bg-poker-green bg-opacity-40 rounded-lg p-4 text-center mt-8">
        <p className="text-gray-300">
          {street === "pre-flop"
            ? "Pre-flop: Enter probability guesses for each player"
            : street === "flop"
              ? "Flop revealed: Update the probability estimates"
              : street === "turn"
                ? "Turn revealed: One more card to come"
                : street === "river"
                  ? "River revealed: Final probabilities"
                  : "Game in progress"}
        </p>
      </div>
    </div>
  );
}
