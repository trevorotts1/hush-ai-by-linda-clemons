const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY!;
const AGENTMAIL_URL = "https://api.agentmail.to/v1/email/send";

interface SessionData {
  transcript: Array<{ role: string; content: string; timestamp?: string }>;
  affirmation?: string;
  primary_track: string;
}

export async function sendSessionEmail(
  email: string,
  firstName: string,
  session: SessionData
) {
  if (!AGENTMAIL_API_KEY) {
    console.warn("AGENTMAIL_API_KEY not set — skipping email");
    return { skipped: true };
  }

  const transcript = session.transcript
    .map((m) => `${m.role === "assistant" ? "Ms. Linda" : firstName}: ${m.content}`)
    .join("\n\n");

  const affirmation = session.affirmation || buildDefaultAffirmation(firstName);
  const wordCloud = extractKeywords(session.transcript);

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fcf9f8;">
      <h1 style="color: #6f00d2; font-size: 32px; margin-bottom: 8px;">Your Hush Session</h1>
      <p style="color: #4c4355; font-size: 16px; margin-bottom: 32px;">With Ms. Linda — ${session.primary_track}</p>
      
      <div style="background: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(139,44,245,0.04);">
        <h2 style="color: #6f00d2; font-size: 20px; margin-bottom: 16px;">Your Personal Affirmation</h2>
        <p style="font-size: 20px; font-style: italic; color: #1c1b1b; line-height: 1.6; border-left: 4px solid #f3be56; padding-left: 16px;">${affirmation}</p>
      </div>

      <div style="background: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(139,44,245,0.04);">
        <h2 style="color: #6f00d2; font-size: 20px; margin-bottom: 16px;">Your Session Themes</h2>
        ${wordCloud.map((w) => `<span style="display: inline-block; background: #f2e3ff; color: #6f00d2; padding: 6px 14px; border-radius: 999px; margin: 4px; font-size: ${14 + w.weight * 10}px;">${w.word}</span>`).join(" ")}
      </div>

      <div style="background: #ffffff; border-radius: 24px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(139,44,245,0.04);">
        <h2 style="color: #6f00d2; font-size: 20px; margin-bottom: 16px;">Session Transcript</h2>
        <pre style="white-space: pre-wrap; font-family: 'Be Vietnam Pro', sans-serif; color: #1c1b1b; line-height: 1.6; font-size: 14px;">${transcript}</pre>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hush-app.vercel.app'}" style="background: linear-gradient(135deg, #6f00d2, #2000c7); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">Start Another Session</a>
      </div>

      <p style="text-align: center; color: #7d7387; font-size: 12px; margin-top: 40px;">The Hush App — Presence with Personality</p>
    </div>
  `;

  const body = {
    to: email,
    from: "Ms. Linda at Hush <coach@hush.app>",
    subject: `Your Hush Session — ${session.primary_track}`,
    html: htmlBody,
  };

  const res = await fetch(AGENTMAIL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AGENTMAIL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("AgentMail error:", err);
    return { error: err };
  }

  return { sent: true };
}

function buildDefaultAffirmation(name: string): string {
  return `I am ${name}. My presence speaks before my words ever do. I walk into every room knowing my body is my power, and I choose to project confidence, warmth, and truth in every interaction.`;
}

function extractKeywords(transcript: Array<{ role: string; content: string }>): Array<{ word: string; weight: number }> {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us",
    "them", "my", "your", "his", "its", "our", "their", "this", "that",
    "just", "really", "very", "like", "so", "what", "when", "where", "how",
    "do", "does", "did", "have", "has", "had", "can", "will", "would",
    "not", "no", "yes", "if", "then", "than", "too", "also", "now",
  ]);

  const keywords = [
    "body language", "eye contact", "presence", "confidence", "energy",
    "posture", "stillness", "quiet hold", "CIA energy", "mirroring",
    "command", "influence", "attract", "trust", "connection", "power",
    "signal", "truth", "room", "space", "hands", "face", "smile",
    "voice", "breath", "breathing", "shoulders", "feet", "movement",
    "deception", "congruence", "reading", "listening", "presence",
    "flirtation", "dating", "interview", "speaking", "negotiation",
    "relationship", "business", "family", "fear", "anxiety", "nerves",
    "self-soothing", "neck", "eyes", "palms", "stance", "walk",
  ];

  const text = transcript.map((m) => m.content.toLowerCase()).join(" ");
  const results: { word: string; count: number }[] = [];

  for (const kw of keywords) {
    const count = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    if (count > 0) results.push({ word: kw, count });
  }

  // Also add individual meaningful words
  const words = text.split(/\s+/).filter((w) => w.length > 4 && !stopWords.has(w));
  const wordCounts: Record<string, number> = {};
  for (const w of words) {
    wordCounts[w] = (wordCounts[w] || 0) + 1;
  }
  for (const [word, count] of Object.entries(wordCounts)) {
    if (count >= 2 && !stopWords.has(word)) {
      results.push({ word, count });
    }
  }

  // Dedupe, sort by count, take top 15
  const unique = results.filter(
    (r, i) => results.findIndex((x) => x.word === r.word) === i
  );
  unique.sort((a, b) => b.count - a.count);
  const top = unique.slice(0, 15);

  const maxCount = top[0]?.count || 1;
  return top.map((r) => ({ word: r.word, weight: r.count / maxCount }));
}
