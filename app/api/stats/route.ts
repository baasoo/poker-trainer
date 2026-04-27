import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";

const db = getDb();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await db.query(
      `SELECT
        total_games_played,
        total_score,
        average_accuracy,
        best_round_score
       FROM user_stats
       WHERE user_id = $1`,
      [session.user.id]
    );

    if (result.rows.length === 0) {
      // Return default stats if user has no stats yet
      return NextResponse.json(
        {
          total_games_played: 0,
          total_score: 0,
          average_accuracy: 0,
          best_round_score: 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
