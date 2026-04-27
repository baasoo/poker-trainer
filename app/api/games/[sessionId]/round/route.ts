import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";
import { calculateEquity, Card } from "@/lib/poker-evaluator";

const db = getDb();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { street, hole_cards, community_cards, player_guesses, actual_probabilities, round_score } = body;

    if (!street || !hole_cards || !player_guesses) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate data structures
    if (!Array.isArray(hole_cards) || !hole_cards.every(Array.isArray)) {
      console.error("Invalid hole_cards structure:", hole_cards);
      return NextResponse.json(
        { error: "Invalid hole_cards format" },
        { status: 400 }
      );
    }

    // Ensure community_cards is an array (can be empty initially)
    const communityCardsArray = Array.isArray(community_cards) ? community_cards : [];

    // Use precalculated probabilities if provided, otherwise calculate on server
    let actual_probabilities_final = actual_probabilities;
    let round_score_final = round_score;

    if (!actual_probabilities_final) {
      actual_probabilities_final = calculateEquity(
        hole_cards as Card[][],
        communityCardsArray as Card[],
        10000
      );

      // Calculate round score based on guess accuracy
      let score = 0;
      for (let i = 0; i < actual_probabilities_final.length; i++) {
        const guess = player_guesses[i] || 0;
        const actual = actual_probabilities_final[i];
        const diff = Math.abs(guess - actual);
        score += Math.max(0, 100 - diff);
      }
      round_score_final = score / actual_probabilities_final.length;
    }

    // Store round in database
    const result = await db.query(
      `INSERT INTO game_rounds
        (session_id, street, round_number, hole_cards, community_cards, player_guesses, actual_probabilities, round_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, street, player_guesses, actual_probabilities, round_score`,
      [
        sessionId,
        street,
        1,
        JSON.stringify(hole_cards),
        JSON.stringify(community_cards),
        JSON.stringify(player_guesses),
        JSON.stringify(actual_probabilities_final),
        round_score_final,
      ]
    );

    const round = result.rows[0];

    return NextResponse.json(
      {
        round_id: round.id,
        street: round.street,
        player_guesses: round.player_guesses,
        actual_probabilities: round.actual_probabilities,
        round_score: round.round_score,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Round submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
