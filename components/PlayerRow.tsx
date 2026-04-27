"use client";

import { Card } from "@/lib/poker-evaluator";
import CardDisplay from "./CardDisplay";

interface PlayerRowProps {
  playerIdx: number;
  holeCards: Card[];
  isGuessing: boolean;
  guess?: number;
  actual?: number;
  roundScore?: number;
  onGuessChange?: (value: number) => void;
  disabled?: boolean;
  isWinning?: boolean;
}

export default function PlayerRow({
  playerIdx,
  holeCards,
  isGuessing,
  guess = 0,
  actual = 0,
  roundScore = 0,
  onGuessChange,
  disabled = false,
  isWinning = false,
}: PlayerRowProps) {
  const playerAccuracy = Math.max(0, 100 - Math.abs(guess - actual));

  return (
    <div className={`rounded-lg p-4 flex items-center gap-6 ${isWinning ? 'bg-poker-gold/20' : ''}`}>
      {/* Player Label */}
      <div className="min-w-12 font-bold whitespace-nowrap">
        {`P${playerIdx + 1}`}
      </div>

      {/* Hole Cards */}
      <div className="flex gap-2">
        {holeCards.length === 2 ? (
          <>
            <CardDisplay card={holeCards[0]} size="sm" />
            <CardDisplay card={holeCards[1]} size="sm" />
          </>
        ) : (
          <>
            <div className="w-12 h-18 bg-gray-700 rounded border-2 border-gray-600 flex items-center justify-center">
              <span className="text-gray-400 text-xs">?</span>
            </div>
            <div className="w-12 h-18 bg-gray-700 rounded border-2 border-gray-600 flex items-center justify-center">
              <span className="text-gray-400 text-xs">?</span>
            </div>
          </>
        )}
      </div>

      {isGuessing ? (
        <>
          {/* Slider */}
          <div className="flex-1 min-w-48">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={guess}
              onChange={(e) => onGuessChange?.(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Guess Value */}
          <div className="min-w-20 text-center">
            <p className="text-xs text-gray-400">Guess</p>
            <p className="text-lg font-bold text-blue-400">{guess.toFixed(1)}%</p>
          </div>
        </>
      ) : (
        <>
          {/* Guess Display */}
          <div className="min-w-20 text-center">
            <p className="text-xs text-gray-400">Guess</p>
            <p className="text-lg font-bold text-blue-400">{guess.toFixed(1)}%</p>
          </div>

          {/* Actual Display */}
          <div className="min-w-20 text-center">
            <p className="text-xs text-gray-400">Actual</p>
            <p className="text-lg font-bold text-green-400">{actual.toFixed(1)}%</p>
          </div>

          {/* Delta Display */}
          <div className="min-w-20 text-center">
            <p className="text-xs text-gray-400">Delta</p>
            <p className={`text-lg font-bold ${
              Math.abs(actual - guess) > 20 ? 'text-red-500' :
              Math.abs(actual - guess) > 10 ? 'text-yellow-400' :
              'text-poker-gold'
            }`}>
              {(actual - guess > 0 ? '+' : '')}{(actual - guess).toFixed(1)}%
            </p>
          </div>

          {/* Guess and Actual Bars */}
          <div className="flex flex-col gap-1 hidden lg:flex">
            {/* Blue bar for Guess */}
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${guess}%` }}
              ></div>
            </div>
            {/* Green bar for Actual */}
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${actual}%` }}
              ></div>
            </div>
          </div>

          {/* Accuracy Display */}
          <div className="min-w-20 text-center">
            <p className="text-xs text-gray-400">Accuracy</p>
            <p className="text-lg font-bold text-purple-400">{Math.max(0, 100 - Math.abs(guess - actual)).toFixed(1)}%</p>
          </div>
        </>
      )}
    </div>
  );
}
