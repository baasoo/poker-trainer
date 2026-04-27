"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="container-poker text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">ðŸŽ° Poker Trainer</h1>
        <p className="text-xl text-gray-200 mb-8">
          Master Texas Hold'em by training on real poker hand probabilities
        </p>

        <div className="bg-black bg-opacity-40 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ol className="text-left space-y-4 text-gray-200">
            <li className="flex gap-4">
              <span className="text-yellow-400 text-xl font-bold">1</span>
              <span>Choose the number of players in the game</span>
            </li>
            <li className="flex gap-4">
              <span className="text-yellow-400 text-xl font-bold">2</span>
              <span>See hole cards and make probability guesses for each player</span>
            </li>
            <li className="flex gap-4">
              <span className="text-yellow-400 text-xl font-bold">3</span>
              <span>Reveal actual probabilities calculated from real poker math</span>
            </li>
            <li className="flex gap-4">
              <span className="text-yellow-400 text-xl font-bold">4</span>
              <span>Progress through flop, turn, and river with feedback</span>
            </li>
            <li className="flex gap-4">
              <span className="text-yellow-400 text-xl font-bold">5</span>
              <span>Build intuition as you compete on a global leaderboard</span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <Link
            href="/game/new"
            className="btn btn-primary block text-lg"
          >
            Start Training Session
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-secondary block text-lg"
          >
            View My Stats & Scores
          </Link>
        </div>
      </div>
    </div>
  );
}

