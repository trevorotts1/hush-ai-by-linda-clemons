import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "session_id required" }, { status: 400 });

    const { data: session, error } = await supabaseAdmin
      .from("hush_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (error || !session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    if (session.status !== "active") return NextResponse.json({ status: "already_ended" });

    // Generate affirmation if not already done
    let affirmation = session.affirmation;
    if (!affirmation && session.transcript?.length > 4) {
      // Placeholder — full implementation in Phase 4
      affirmation = "Let your presence speak before your words ever do. Your body is your power.";
    }

    await supabaseAdmin
      .from("hush_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        affirmation: affirmation || null,
      })
      .eq("id", session_id);

    // TODO: Trigger email + infographic generation (Phase 4)

    return NextResponse.json({ status: "ended", session_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
