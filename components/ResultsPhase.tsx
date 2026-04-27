"use client";

interface ResultsPhaseProps {
  playerGuesses: number[];
  actualProbabilities: number[];
  roundScore: number;
  onContinue: () => void;
  isLastStreet: boolean;
  actualWinnerIdx?: number | null;
}

export default function ResultsPhase({
  playerGuesses,
  actualProbabilities,
  roundScore,
  onContinue,
  isLastStreet,
  actualWinnerIdx,
}: ResultsPhaseProps) {
  const numPlayers = playerGuesses.length;

  // Calculate accuracy for each player's guess
  const accuracy = playerGuesses.map((guess, idx) => {
    const actual = actualProbabilities[idx];
    const diff = Math.abs(guess - actual);
    return {
      playerIdx: idx,
      guess,
      actual,
      diff,
      accuracy: Math.max(0, 100 - diff),
    };
  });

  // Find winner - use actualWinnerIdx if provided (river), otherwise use highest probability
  const winnerIdx = actualWinnerIdx !== null && actualWinnerIdx !== undefined
    ? actualWinnerIdx
    : actualProbabilities.reduce(
        (maxIdx, prob, idx) => (prob > actualProbabilities[maxIdx] ? idx : maxIdx),
        0
      );

  // River final screen - simplified
  if (isLastStreet) {
    return (
      <div className="container-poker">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {`P${winnerIdx + 1} Wins`}
          </h2>
          <p className="text-lg text-poker-gold font-bold mb-2">
            {actualProbabilities[winnerIdx].toFixed(1)}% Equity at Turn
          </p>
          <p className="text-sm text-gray-400">
            Pre-river winning probability
          </p>
        </div>

        {/* Simplified player probabilities with accuracy bars */}
        <div className="space-y-3 mb-6">
          {accuracy.map(({ playerIdx, actual, accuracy: playerAccuracy }) => (
            <div
              key={playerIdx}
              className={`bg-poker-green bg-opacity-${playerIdx === winnerIdx ? "50" : "30"} rounded-lg p-3`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">
                  {`P${playerIdx + 1}`}
                </span>
                <span className="text-poker-gold font-bold">{actual.toFixed(1)}%</span>
              </div>

              {/* Accuracy bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                  style={{ width: `${playerAccuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="btn btn-primary w-full text-lg"
        >
          See Final Results
        </button>
      </div>
    );
  }

  // Regular results view for other streets
  return (
    <div className="container-poker">
      <h2 className="text-2xl font-bold mb-6 text-center">Results</h2>

      {/* Score display */}
      <div className="bg-poker-green bg-opacity-40 rounded-lg p-6 mb-6 text-center">
        <p className="text-gray-300 mb-2">Round Score</p>
        <p className="text-4xl font-bold text-poker-gold">{roundScore.toFixed(1)}</p>
        <p className="text-sm text-gray-400 mt-2">
          Average accuracy across all players
        </p>
      </div>

      {/* Player comparisons */}
      <div className="space-y-4 mb-6">
        {accuracy.map(({ playerIdx, guess, actual, diff, accuracy: playerAccuracy }) => (
          <div key={playerIdx} className="bg-poker-green bg-opacity-30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold">
                {`P${playerIdx + 1}`}
              </span>
              <span className={`text-sm font-bold ${
                diff < 5 ? "text-green-400" : diff < 15 ? "text-yellow-400" : "text-red-400"
              }`}>
                {diff < 0.1 ? "Perfect!" : `Off by ${diff.toFixed(1)}%`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Guess</p>
                <p className="text-xl font-bold text-blue-400">{guess.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Actual</p>
                <p className="text-xl font-bold text-green-400">{actual.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-xl font-bold text-poker-gold">{playerAccuracy.toFixed(0)}%</p>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                style={{ width: `${playerAccuracy}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="bg-poker-green bg-opacity-40 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300">
          <strong>Tip:</strong> {
            roundScore > 80
              ? "Excellent reads! Great intuition on display."
              : roundScore > 60
                ? "Good estimates. Keep practicing to improve consistency."
                : "Keep working on the probability estimates. Every hand helps!"
          }
        </p>
      </div>

      <button
        onClick={onContinue}
        className="btn btn-primary w-full text-lg"
      >
        Continue to Next Street
      </button>
    </div>
  );
}
