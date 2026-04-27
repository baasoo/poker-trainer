import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/db";

const db = getDb();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { num_players } = body;

    if (!num_players || num_players < 2 || num_players > 9) {
      return NextResponse.json(
        { error: "Number of players must be between 2 and 9" },
        { status: 400 }
      );
    }

    const result = await db.query(
      "INSERT INTO game_sessions (user_id, num_players) VALUES ($1, $2) RETURNING id, user_id, num_players, created_at",
      [session.user.id, num_players]
    );

    const session_data = result.rows[0];

    return NextResponse.json(session_data, { status: 201 });
  } catch (error) {
    console.error("Game creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
