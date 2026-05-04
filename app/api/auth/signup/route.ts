import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const db = getDb();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail, password, name } = body;
    const email = rawEmail?.toLowerCase();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await db.query(
      "INSERT INTO users (email, password_hash, name, provider) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
      [email, passwordHash, name || email.split("@")[0], "credentials"]
    );

    const user = result.rows[0];

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
