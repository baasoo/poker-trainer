"use client";

import { useState, useEffect } from "react";
import ProbabilityInput from "./ProbabilityInput";

interface ProbabilityPhaseProps {
  numPlayers: number;
  street: string;
  onSubmitGuesses: (guesses: number[]) => void;
}

export default function ProbabilityPhase({
  numPlayers,
  street,
  onSubmitGuesses,
}: ProbabilityPhaseProps) {
  const [guesses, setGuesses] = useState<number[]>(
    Array(numPlayers).fill(100 / numPlayers)
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wasValid, setWasValid] = useState(true);

  const total = guesses.reduce((sum, val) => sum + val, 0);
  const isValid = Math.abs(total - 100) < 0.1;

  // Update wasValid state when isValid changes
  useEffect(() => {
    if (isValid) {
      setWasValid(true);
    } else if (wasValid) {
      setWasValid(false);
    }
  }, [isValid, wasValid]);

  // Simple slider change without auto-adjust
  const handleGuessChange = (playerNumber: number, value: number) => {
    const newGuesses = [...guesses];
    newGuesses[playerNumber - 1] = Math.max(0, Math.min(100, value));
    setGuesses(newGuesses);
  };

  // Normalize all guesses to sum to 100%
  const handleNormalize = () => {
    if (total === 0) {
      // If all are 0, distribute equally
      setGuesses(Array(numPlayers).fill(100 / numPlayers));
    } else {
      // Scale all proportionally to sum to 100%
      const scale = 100 / total;
      const normalized = guesses.map((guess) => guess * scale);
      setGuesses(normalized);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!isValid) {
      setError("Probabilities must sum to 100%");
      return;
    }

    setLoading(true);
    try {
      await onSubmitGuesses(guesses);
    } catch (err) {
      setError("Failed to submit guesses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-poker">
      <h2 className="text-2xl font-bold mb-6 text-center">
        What are the win probabilities?
      </h2>

      <p className="text-gray-300 text-center mb-6">
        Estimate the probability of each player winning from this point
      </p>

      <div className="space-y-4 mb-6">
        {guesses.map((guess, idx) => (
          <ProbabilityInput
            key={idx}
            playerNumber={idx + 1}

            initialValue={guess}
            onValueChange={handleGuessChange}
            disabled={false}
          />
        ))}
      </div>

      {/* Total indicator */}
      <div className="bg-poker-green bg-opacity-40 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total Probability</span>
          <span
            className={`text-xl font-bold ${
              isValid ? "text-green-400" : "text-red-400"
            }`}
          >
            {total.toFixed(1)}%
          </span>
        </div>
        {!isValid && (
          <p className="text-red-400 text-sm mt-2">
            Must equal exactly 100%
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isValid ? (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary w-full text-lg flex items-center justify-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          <span>{loading ? "Calculating..." : "Submit & Reveal Probabilities"}</span>
        </button>
      ) : (
        <button
          onClick={handleNormalize}
          className="btn btn-primary w-full text-lg"
        >
          Adjust to 100%
        </button>
      )}
    </div>
  );
}
