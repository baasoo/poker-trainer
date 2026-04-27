"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [numPlayers, setNumPlayers] = useState(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num_players: numPlayers }),
      });

      if (!res.ok) {
        alert("Failed to create game");
        return;
      }

      const game = await res.json();
      router.push(`/game/${game.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Error creating game");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="player-picker-container">
      <div className="player-picker-card">
        {/* Header */}
        <div className="player-picker-header">
          <h1 className="player-picker-title">Start Training Session</h1>
          <p className="player-picker-subtitle">More opponents = harder.</p>
        </div>

        {/* Content */}
        <div className="player-picker-content">
          {/* Section label */}
          <p className="player-picker-label">How many players?</p>

          {/* Number buttons grid */}
          <div className="player-picker-grid">
            {[2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                onClick={() => setNumPlayers(num)}
                className={`player-picker-button ${numPlayers === num ? "selected" : ""}`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Button row */}
          <div className="player-picker-buttons">
            <button
              onClick={handleStartGame}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Creating Game..." : "Start Game"}
            </button>

            <button
              onClick={() => router.back()}
              className="btn btn-ghost"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

