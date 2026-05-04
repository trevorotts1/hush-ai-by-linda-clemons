import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });

    const apiKey = process.env.FISH_AUDIO_API_KEY;
    const referenceId = process.env.FISH_AUDIO_VOICE_ID_LINDA;
    
    if (!apiKey || !referenceId) {
      return NextResponse.json({ error: "TTS not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "model": "s2-pro",
      },
      body: JSON.stringify({
        text,
        reference_id: referenceId,
        format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Fish Audio error: ${response.status} ${err}`);
    }

    // Return audio as base64 data URL
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64}`;

    return NextResponse.json({ audio_url: audioUrl });
  } catch (error: any) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
