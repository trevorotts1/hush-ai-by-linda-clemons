import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompt";
import { chat } from "@/lib/deepseek";
import { searchKnowledge, formatRagContext } from "@/lib/rag";

const MAX_EXCHANGES = 100;

export async function POST(req: NextRequest) {
  try {
    const { session_id, message } = await req.json();
    if (!session_id || !message) {
      return NextResponse.json({ error: "session_id and message required" }, { status: 400 });
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("hush_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json({ error: "Session already ended" }, { status: 400 });
    }

    const exchangeCount = session.exchange_count || 0;
    if (exchangeCount >= MAX_EXCHANGES) {
      await supabaseAdmin
        .from("hush_sessions")
        .update({ status: "completed", ended_at: new Date().toISOString() })
        .eq("id", session_id);
      return NextResponse.json({
        text: "Baby, we have been talking for a while now. I am sending you an email with everything we covered. Talk soon.",
        tagged_text: "(warm)(empathetic) Baby, we have been talking for a while now. (break) I am sending you an email with everything we covered. (soft tone) Talk soon.",
        session_ended: true,
      });
    }

    // Get user name
    const { data: user } = await supabaseAdmin
      .from("hush_users")
      .select("first_name")
      .eq("id", session.user_id)
      .single();

    const userName = user?.first_name || "friend";

    // Build conversation history from transcript
    const transcript = (session.transcript || []) as Array<{ role: string; content: string }>;
    const history = transcript
      .slice(-20)
      .map((m) => `${m.role === "assistant" ? "Ms. Linda" : userName}: ${m.content}`)
      .join("\n");

    // RAG search
    const chunks = await searchKnowledge(message, history);
    const ragContext = formatRagContext(chunks);

    // Build messages
    const systemPrompt = buildSystemPrompt({ track: session.primary_track, userName, exchangeCount });
    
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (ragContext) {
      messages.push({
        role: "system",
        content: `Use the following knowledge from Linda Clemons' book "Hush" to answer. Only use information from these sources:\n\n${ragContext}`,
      });
    }

    // Add conversation history (last 10 exchanges)
    for (const msg of transcript.slice(-20)) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Get response
    const response = await chat(messages as any);

    // Store in transcript
    const newTranscript = [
      ...transcript,
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: response.text, timestamp: new Date().toISOString() },
    ];

    await supabaseAdmin
      .from("hush_sessions")
      .update({
        transcript: newTranscript,
        exchange_count: exchangeCount + 1,
      })
      .eq("id", session_id);

    return NextResponse.json({
      text: response.text,
      tagged_text: response.tagged_text,
      session_ended: false,
      exchange_count: exchangeCount + 1,
    });
  } catch (error: any) {
    console.error("Message error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
