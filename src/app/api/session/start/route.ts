import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompt";
import { chat } from "@/lib/deepseek";

const PROACTIVE_GREETINGS: Record<string, string> = {
  "Read Anyone Instantly":
    "read body language, spot deception, and understand what people are really saying without them speaking a word",
  "Command Any Room":
    "own your presence, project confidence, and walk into any room like you belong there",
  "Master Your Own Signals":
    "take control of your own body language so you stop sabotaging yourself and start showing up powerfully",
  "Transform Your Relationships":
    "use the secrets of nonverbal communication to transform your dating life, your business relationships, and your family dynamics",
};

export async function POST(req: NextRequest) {
  try {
    const { user_id, track } = await req.json();
    if (!user_id || !track) {
      return NextResponse.json({ error: "user_id and track required" }, { status: 400 });
    }

    // Create session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("hush_sessions")
      .insert({ user_id, primary_track: track, status: "active" })
      .select("id")
      .single();

    if (sessionError) throw sessionError;

    // Get user name
    const { data: user } = await supabaseAdmin
      .from("hush_users")
      .select("first_name")
      .eq("id", user_id)
      .single();

    const userName = user?.first_name || "friend";

    // Generate proactive greeting using DeepSeek
    const trackDescription = PROACTIVE_GREETINGS[track] || "work on whatever is most important to you";
    const systemPrompt = buildSystemPrompt({ track, userName, exchangeCount: 0 });

    const greetingPrompt = `Generate a warm, proactive greeting from Ms. Linda to ${userName}. They chose the coaching track: "${track}" which means they want to ${trackDescription}. 

Ms. Linda should:
1. Greet them by name with warmth
2. Introduce herself as their guide to mastering the Hush
3. Acknowledge their chosen track and why it matters
4. Ask a natural follow-up question to start the conversation — perhaps about their industry, what specifically brought them here, or a recent situation where they felt their body language failed them
5. Sound like a real person having a conversation, not a chatbot

Remember Ms. Linda's voice: warm, sassy, uses "baby" and "Ms. Linda", references Momma Bird, tough love wrapped in nurturing.`;

    const response = await chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: greetingPrompt },
      ],
      { temperature: 0.9 }
    );

    // Store greeting in transcript
    await supabaseAdmin
      .from("hush_sessions")
      .update({
        transcript: [{ role: "assistant", content: response.text, timestamp: new Date().toISOString() }],
      })
      .eq("id", session.id);

    return NextResponse.json({
      session_id: session.id,
      greeting: response.text,
      greeting_tagged: response.tagged_text,
    });
  } catch (error: any) {
    console.error("Session start error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
