import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user }, { status: 200 });
}
