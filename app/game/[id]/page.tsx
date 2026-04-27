"use client";

import { useEffect, useState, startTransition } from "react";
import { flushSync } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/lib/poker-evaluator";
import CommunityCardsPane from "@/components/CommunityCardsPane";
import PlayerRow from "@/components/PlayerRow";
import ResultsPhase from "@/components/ResultsPhase";
import CardDisplay from "@/components/CardDisplay";

interface GameState {
  street: "pre-flop" | "flop" | "turn" | "river" | "complete";
  deckId: string;
  holeCards: Card[][];
  communityCards: Card[];
  playerGuesses: number[] | null;
  actualProbabilities: number[] | null;
  roundScore: number | null;
  totalScore: number;
  roundNumber: number;
  showResults: boolean;
  actualWinnerIdx: number | null;
  preflopScore: number | null;
  flopScore: number | null;
  turnScore: number | null;
}

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;

  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    street: "pre-flop",
    deckId: "",
    holeCards: [],
    communityCards: [],
    playerGuesses: null,
    actualProbabilities: null,
    roundScore: null,
    totalScore: 0,
    roundNumber: 1,
    showResults: false,
    actualWinnerIdx: null,
    preflopScore: null,
    flopScore: null,
    turnScore: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [precalculatedProbs, setPrecalculatedProbs] = useState<number[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize game
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const initializeGame = async () => {
      try {
        // Fetch game details from database
        const gameRes = await fetch(`/api/games/${gameId}`);
        if (!gameRes.ok) {
          setError("Game not found");
          return;
        }

        const game = await gameRes.json();
        setNumPlayers(game.num_players);

        // Create deck from Deck of Cards API
        const deckRes = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        const deckData = await deckRes.json();

        // Deal cards
        const cardsNeeded = game.num_players * 2;
        const drawRes = await fetch(
          `https://deckofcardsapi.com/api/deck/${deckData.deck_id}/draw/?count=${cardsNeeded}`
        );
        const drawData = await drawRes.json();

        // Organize cards by player
        const suitMap: { [key: string]: string } = {
          HEARTS: "H",
          DIAMONDS: "D",
          CLUBS: "C",
          SPADES: "S",
        };

        const rankMap: { [key: string]: string } = {
          KING: "K",
          QUEEN: "Q",
          JACK: "J",
          ACE: "A",
          T: "10",
          "10": "10",
        };

        const getRankValue = (rank: string) => rankMap[rank] || rank;

        const holeCards: Card[][] = [];
        for (let i = 0; i < game.num_players; i++) {
          holeCards.push([
            {
              code: drawData.cards[i * 2].code,
              value: getRankValue(drawData.cards[i * 2].value),
              suit: suitMap[drawData.cards[i * 2].suit] || drawData.cards[i * 2].suit.charAt(0).toUpperCase(),
            },
            {
              code: drawData.cards[i * 2 + 1].code,
              value: getRankValue(drawData.cards[i * 2 + 1].value),
              suit: suitMap[drawData.cards[i * 2 + 1].suit] || drawData.cards[i * 2 + 1].suit.charAt(0).toUpperCase(),
            },
          ]);
        }

        setGameState((prev) => ({
          ...prev,
          deckId: deckData.deck_id,
          holeCards,
          street: "pre-flop",
          playerGuesses: Array(game.num_players).fill(100 / game.num_players),
        }));
        setLoading(false);
      } catch (err) {
        console.error("Error initializing game:", err);
        setError("Failed to initialize game");
        setLoading(false);
      }
    };

    initializeGame();
  }, [status, session?.user?.id, gameId, router]);

  // Precalculate probabilities in the background
  useEffect(() => {
    if (gameState.holeCards.length === 0 || gameState.showResults) return;

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      if (cancelled) return;

      // flushSync forces React to paint the overlay before the heavy computation
      // blocks the main thread — React 18 automatic batching would otherwise
      // collapse setIsCalculating(true → false) into a single no-op render.
      flushSync(() => setIsCalculating(true));

      // Yield a macrotask so the browser actually paints the overlay
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      if (cancelled) return;

      try {
        const { calculateEquity } = await import("@/lib/poker-evaluator");
        if (cancelled) return;
        const probs = calculateEquity(
          gameState.holeCards,
          gameState.communityCards,
          10000
        );
        if (!cancelled) {
          startTransition(() => {
            setPrecalculatedProbs(probs);
            setIsCalculating(false);
          });
        }
      } catch (err) {
        console.error("Error precalculating probabilities:", err);
        if (!cancelled) {
          startTransition(() => setIsCalculating(false));
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [gameState.holeCards, gameState.communityCards, gameState.showResults]);

  // Deal community cards for next street
  const dealNextStreet = async () => {
    if (!gameState.deckId) return;

    try {
      const cardsNeeded = gameState.street === "pre-flop" ? 3 : 1;
      const drawRes = await fetch(
        `https://deckofcardsapi.com/api/deck/${gameState.deckId}/draw/?count=${cardsNeeded}`
      );
      const drawData = await drawRes.json();

      const suitMap: { [key: string]: string } = {
        HEARTS: "H",
        DIAMONDS: "D",
        CLUBS: "C",
        SPADES: "S",
      };

      const rankMap: { [key: string]: string } = {
        KING: "K",
        QUEEN: "Q",
        JACK: "J",
        ACE: "A",
        T: "10",
        "10": "10",
      };

      const getRankValue = (rank: string) => rankMap[rank] || rank;

      const newCards: Card[] = drawData.cards.map((card: any) => ({
        code: card.code,
        value: getRankValue(card.value),
        suit: suitMap[card.suit] || card.suit.charAt(0).toUpperCase(),
      }));

      const nextStreet: GameState["street"] =
        gameState.street === "pre-flop"
          ? "flop"
          : gameState.street === "flop"
            ? "turn"
            : gameState.street === "turn"
              ? "river"
              : "complete";

      const updatedCommunityCards = [...gameState.communityCards, ...newCards];

      // On river, automatically show results without asking for guesses
      if (nextStreet === "river") {
        // Use precalculated probabilities or wait for them
        setGameState((prev) => ({
          ...prev,
          communityCards: updatedCommunityCards,
          street: nextStreet,
          showResults: false,
        }));

        // Wait for precalculated probabilities if still calculating
        let probs = precalculatedProbs;
        if (!probs && isCalculating) {
          for (let i = 0; i < 120; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (precalculatedProbs) {
              probs = precalculatedProbs;
              break;
            }
          }
        }

        if (probs) {
          // Determine actual winner at river (all cards revealed)
          // Note: River has no guessing, so no roundScore is added
          const { evaluateRiverWinner } = await import("@/lib/poker-evaluator");
          const actualWinner = evaluateRiverWinner(
            gameState.holeCards,
            updatedCommunityCards
          );
          // Find the player with the highest win probability (handles ties correctly)
          const actualWinnerIdx = actualWinner.indexOf(Math.max(...actualWinner));

          setGameState((prev) => ({
            ...prev,
            showResults: true,
            playerGuesses: probs!.map(p => Math.round(p)),
            actualProbabilities: probs!,
            roundScore: null,
            totalScore: prev.totalScore,
            roundNumber: prev.roundNumber + 1,
            actualWinnerIdx,
          }));
        }
      } else {
        flushSync(() => {
          setGameState((prev) => {
            const newState = {
              ...prev,
              communityCards: updatedCommunityCards,
              street: nextStreet,
              showResults: false,
              playerGuesses: prev.actualProbabilities?.map(p => Math.round(p)) || Array(prev.holeCards.length).fill(100 / prev.holeCards.length),
              actualProbabilities: null,
              roundScore: null,
              roundNumber: prev.roundNumber + 1,
              actualWinnerIdx: null,
            };
            return newState;
          });
        });
      }
    } catch (err) {
      console.error("Error dealing cards:", err);
      setError("Failed to deal cards");
    }
  };

  // Submit guesses and get actual probabilities
  const handleSubmitGuesses = async (guesses: number[]) => {
    try {
      // Use precalculated probabilities if available, otherwise wait for calculation
      let actualProbs = precalculatedProbs;
      if (!actualProbs) {
        if (isCalculating) {
          // Wait for calculation to complete (max 120 seconds)
          let attempts = 0;
          while (!actualProbs && attempts < 120) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;
          }
          actualProbs = precalculatedProbs;
        }
        if (!actualProbs) {
          throw new Error("Failed to calculate probabilities");
        }
      }

      // Calculate round score based on precalculated probabilities
      let roundScore = 0;
      for (let i = 0; i < actualProbs.length; i++) {
        const diff = Math.abs(guesses[i] - actualProbs[i]);
        roundScore += Math.max(0, 100 - diff);
      }
      roundScore = roundScore / actualProbs.length;

      // Store round in database
      const response = await fetch(`/api/games/${gameId}/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street: gameState.street,
          hole_cards: gameState.holeCards,
          community_cards: gameState.communityCards,
          player_guesses: guesses,
          actual_probabilities: actualProbs,
          round_score: roundScore,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit guesses");
      }

      const result = await response.json();

      setGameState((prev) => ({
        ...prev,
        playerGuesses: guesses,
        actualProbabilities: actualProbs!,
        roundScore: roundScore,
        totalScore: prev.totalScore + roundScore,
        preflopScore: prev.street === "pre-flop" ? roundScore : prev.preflopScore,
        flopScore: prev.street === "flop" ? roundScore : prev.flopScore,
        turnScore: prev.street === "turn" ? roundScore : prev.turnScore,
        showResults: true,
      }));
    } catch (err) {
      console.error("Error submitting guesses:", err);
      setError("Failed to submit guesses");
    }
  };

  const handleContinue = () => {
    if (gameState.street === "river") {
      // Game complete
      setGameState((prev) => ({
        ...prev,
        street: "complete",
      }));
    } else {
      dealNextStreet();
    }
  };

  const handleNormalize = () => {
    const total = (gameState.playerGuesses || []).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      setGameState((prev) => ({
        ...prev,
        playerGuesses: Array(prev.holeCards.length).fill(100 / prev.holeCards.length),
      }));
    } else {
      const scale = 100 / total;
      const normalized = (gameState.playerGuesses || []).map((guess) => guess * scale);
      setGameState((prev) => ({
        ...prev,
        playerGuesses: normalized,
      }));
    }
  };

  const handleEndGame = async () => {
    try {
      // Calculate game score as average of the 3 street scores
      const gameScore = gameState.totalScore / 3;

      // Update session with final score
      await fetch(`/api/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_score: gameScore }),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Error ending game:", err);
      alert("Failed to save game");
    }
  };

  if (status === "loading" || !session) return null;
  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading game...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  if (!numPlayers) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

  const getAccuracyClass = (state: GameState) => {
    if (!state.playerGuesses) return "low";
    const streetsCompleted = state.street === "complete" || state.street === "river" ? 3 : state.street === "turn" ? (state.playerGuesses ? 3 : 2) : state.street === "flop" ? (state.playerGuesses ? 2 : 1) : 1;
    const accuracy = streetsCompleted > 0 ? (state.totalScore / streetsCompleted) : 0;
    if (accuracy >= 90) return "90";
    if (accuracy >= 75) return "75";
    if (accuracy >= 55) return "55";
    return "low";
  };

  const getTotalProbability = () => {
    return (gameState.playerGuesses || []).reduce((sum, val) => sum + val, 0);
  };

  const isProbabilityValid = () => {
    return Math.abs(getTotalProbability() - 100) < 1.5;
  };

  const getGradeText = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 55) return "Keep Practicing";
    return "Needs Work";
  };

  return (
    <div className="game-container">
      {/* Top nav bar */}
      {gameState.street !== "complete" && (
        <div className="game-nav">
          <div className="game-nav-left">
            <h1 className="game-nav-title">Poker Trainer</h1>
          </div>
        </div>
      )}

      {gameState.street === "complete" ? (
        <div className="game-complete-container">
          <div className="game-complete-card">
            <div className="game-complete-content">
              <p className="game-complete-eyebrow">Game Complete</p>
              <p className={`game-complete-score accuracy-${getAccuracyClass(gameState)}`}>
                {(gameState.totalScore / 3).toFixed(1)}%
              </p>
              <p className={`game-complete-grade accuracy-${getAccuracyClass(gameState)}`}>
                {getGradeText(gameState.totalScore / 3)}
              </p>
              <div className="game-complete-bar-container">
                <div
                  className="game-complete-bar"
                  style={{ "--score-percentage": `${gameState.totalScore / 3}%` } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="game-complete-footer">
              <button onClick={handleEndGame} className="btn btn-primary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="game-layout flex flex-col lg:flex-row gap-6">
          {/* Left sidebar */}
          <div className="game-sidebar">
            {!gameState.showResults && gameState.street !== "river" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">What are the win probabilities?</h2>
                <p className="text-gray-300 mb-6">Estimate the probability of each player winning from this point</p>
              </div>
            )}
            <CommunityCardsPane
              communityCards={gameState.communityCards}
              street={gameState.street}
            />
          </div>

          {/* Main content area */}
          <div className="game-main">
            {gameState.showResults && (
              <>
                {(gameState.preflopScore !== null || gameState.flopScore !== null || gameState.turnScore !== null) && (
                  <div className="flex gap-12 mb-8 text-lg text-gray-400">
                    {(() => {
                      const streetsCompleted = [gameState.preflopScore, gameState.flopScore, gameState.turnScore].filter(s => s !== null).length;
                      const avg = streetsCompleted > 0 ? gameState.totalScore / streetsCompleted : 0;
                      return <span>Overall Accuracy: {avg.toFixed(1)}%</span>;
                    })()}
                    {gameState.preflopScore !== null && <span>Pre-flop: {gameState.preflopScore.toFixed(1)}%</span>}
                    {gameState.flopScore !== null && <span>Flop: {gameState.flopScore.toFixed(1)}%</span>}
                    {gameState.turnScore !== null && <span>Turn: {gameState.turnScore.toFixed(1)}%</span>}
                  </div>
                )}
              </>
            )}
            {/* Players Rows */}
            <div className="game-players-list relative">
                {gameState.holeCards.map((cards, playerIdx) => {
                  const winningPlayerIdx = gameState.actualProbabilities && gameState.showResults && gameState.street === "river"
                    ? gameState.actualProbabilities.indexOf(Math.max(...gameState.actualProbabilities))
                    : -1;

                  return (
                    <PlayerRow
                      key={playerIdx}
                      playerIdx={playerIdx}
                      holeCards={cards}
                      isGuessing={!gameState.showResults && gameState.street !== "river"}
                      guess={gameState.playerGuesses?.[playerIdx] || 0}
                      actual={gameState.actualProbabilities?.[playerIdx] || 0}
                      roundScore={gameState.roundScore || 0}
                      onGuessChange={(value) => {
                        const newGuesses = gameState.playerGuesses ? [...gameState.playerGuesses] : Array(gameState.holeCards.length).fill(100 / gameState.holeCards.length);
                        newGuesses[playerIdx] = value;
                        flushSync(() => {
                          setGameState((prev) => ({
                            ...prev,
                            playerGuesses: newGuesses,
                          }));
                        });
                      }}
                      disabled={gameState.showResults || isCalculating}
                      isWinning={playerIdx === winningPlayerIdx}
                    />
                  );
                })}

                {!gameState.showResults && isCalculating && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <style>{`
                      @keyframes dot-blink {
                        0%, 50% { opacity: 0.3; }
                        100% { opacity: 1; }
                      }
                      .loading-dot {
                        animation: dot-blink 1.4s infinite;
                      }
                      .loading-dot:nth-child(1) { animation-delay: 0s; }
                      .loading-dot:nth-child(2) { animation-delay: 0.2s; }
                      .loading-dot:nth-child(3) { animation-delay: 0.4s; }
                    `}</style>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white mb-4">Pre-calculating probabilities</p>
                      <p className="text-lg text-gray-300">
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                        <span className="loading-dot">.</span>
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="game-footer">
              <div className="game-footer-right">

              {/* Controls/Results Section */}
              {gameState.showResults && (
                <div className="text-center">
                  {gameState.street === "river" ? (
                    <div className="flex items-center justify-center gap-3">
                      <CardDisplay card={gameState.holeCards[gameState.actualWinnerIdx!][0]} size="sm" />
                      <CardDisplay card={gameState.holeCards[gameState.actualWinnerIdx!][1]} size="sm" />
                      <span className="text-xl font-bold text-poker-gold">
                        Wins after {gameState.actualProbabilities?.[gameState.actualWinnerIdx ?? 0]?.toFixed(1)}% win probability at turn
                      </span>
                      <button onClick={handleContinue} className="btn btn-primary text-lg">
                        See Overall Score
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleContinue} className="btn btn-primary text-lg">
                      Continue to Next Street
                    </button>
                  )}
                </div>
              )}
              {!gameState.showResults && !isCalculating && (
                <div>
                  <div className=" rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Total Probability</span>
                      <span className={`text-xl font-bold ${isProbabilityValid() ? "text-green-400" : "text-red-400"}`}>
                        {getTotalProbability().toFixed(1)}%
                      </span>
                    </div>
                    {!isProbabilityValid() && (
                      <p className="text-red-400 text-sm mt-2">
                        Must equal exactly 100%
                      </p>
                    )}
                  </div>

                  {isProbabilityValid() ? (
                    <button
                      onClick={() => handleSubmitGuesses(gameState.playerGuesses || [])}
                      className="btn btn-primary text-lg"
                    >
                      Submit & Reveal Probabilities
                    </button>
                  ) : (
                    <button
                      onClick={handleNormalize}
                      className="btn btn-primary text-lg"
                    >
                      Adjust to 100%
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
  );
}
