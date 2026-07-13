import { errorMessage } from "@/lib/errors";
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

    const wasActive = session.status === "active";

    // Get user email
    const { data: user } = await supabaseAdmin
      .from("hush_users")
      .select("email, first_name")
      .eq("id", session.user_id)
      .single();

    // Send post-session email (transcript + affirmation + word cloud).
    // P0-12: surface the real delivery outcome. This runs on the intentional
    // "End & email recap" action and on an in-app "Email me this" resend.
    let emailSent = false;
    let emailError: string | null = null;
    let emailSkipped = false;
    if (user?.email) {
      const result = await sendSessionEmail(user.email, user.first_name || "friend", {
        transcript: session.transcript || [],
        affirmation: session.affirmation,
        primary_track: session.primary_track,
      });
      if (result.sent) emailSent = true;
      else if (result.skipped) emailSkipped = true;
      else emailError = result.error || "Email delivery failed";
    }

    // Only flip status the first time. A resend does not re-end anything.
    if (wasActive) {
      await supabaseAdmin
        .from("hush_sessions")
        .update({ status: "completed", ended_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return NextResponse.json({
      status: wasActive ? "ended" : "already_ended",
      session_id,
      affirmation: session.affirmation ?? null,
      email_sent: emailSent,
      email_skipped: emailSkipped,
      email_error: emailError,
    });
  } catch (error: unknown) {
    console.error("Session end error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
