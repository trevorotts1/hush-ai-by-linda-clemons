import { errorMessage } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "session_id required" }, { status: 400 });

    const { data: session, error } = await supabaseAdmin
      .from("hush_sessions")
      .select("status, exchange_count, started_at, ended_at, transcript")
      .eq("id", sessionId)
      .single();

    if (error || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Check idle time from the latest transcript timestamp, not just session start.
    const transcript = Array.isArray(session.transcript) ? session.transcript : [];
    const latestTimestamp = transcript
      .map((message) => typeof message === "object" && message !== null && "timestamp" in message ? String(message.timestamp) : "")
      .filter(Boolean)
      .at(-1);
    const lastActivity = new Date(latestTimestamp || session.started_at).getTime();
    const idleMs = Date.now() - lastActivity;
    const idleMinutes = Math.max(0, Math.floor(idleMs / 60000));

    return NextResponse.json({
      status: session.status,
      exchange_count: session.exchange_count,
      idle_minutes: idleMinutes,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
