import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSessionEmail } from "@/lib/deliver";

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

    // Get user email
    const { data: user } = await supabaseAdmin
      .from("hush_users")
      .select("email, first_name")
      .eq("id", session.user_id)
      .single();

    // Send post-session email (transcript + affirmation + word cloud)
    if (user?.email) {
      await sendSessionEmail(user.email, user.first_name || "friend", {
        transcript: session.transcript || [],
        affirmation: session.affirmation,
        primary_track: session.primary_track,
      });
    }

    // Mark session completed
    await supabaseAdmin
      .from("hush_sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    return NextResponse.json({ status: "ended", session_id });
  } catch (error: any) {
    console.error("Session end error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
