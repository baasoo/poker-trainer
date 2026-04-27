import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";

const db = getDb();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const result = await db.query(
      "SELECT id, user_id, num_players, total_score, created_at FROM game_sessions WHERE id = $1 AND user_id = $2",
      [sessionId, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { total_score } = body;

    const result = await db.query(
      `UPDATE game_sessions
       SET total_score = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, num_players, total_score`,
      [total_score, sessionId, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Update user stats
    await updateUserStats(session.user.id as string, total_score);

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function updateUserStats(userId: string, sessionScore: number) {
  try {
    // Check if stats exist
    const existingStats = await db.query(
      "SELECT * FROM user_stats WHERE user_id = $1",
      [userId]
    );

    if (existingStats.rows.length === 0) {
      // Create new stats
      await db.query(
        `INSERT INTO user_stats (user_id, total_games_played, total_score, average_accuracy, best_round_score)
         VALUES ($1, 1, $2, 0, $2)`,
        [userId, sessionScore]
      );
    } else {
      // Update existing stats
      const stats = existingStats.rows[0];
      const newTotalGames = stats.total_games_played + 1;
      const newTotalScore = (stats.total_score || 0) + sessionScore;
      // Average accuracy is the average of all game scores
      const newAverage = newTotalScore / newTotalGames;
      const newBest = Math.max(stats.best_round_score || 0, sessionScore);

      await db.query(
        `UPDATE user_stats
         SET total_games_played = $1, total_score = $2, average_accuracy = $3, best_round_score = $4
         WHERE user_id = $5`,
        [newTotalGames, newTotalScore, newAverage, newBest, userId]
      );
    }
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}
