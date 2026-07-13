const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY!;
const AGENTMAIL_URL = "https://api.agentmail.to/v1/email/send";

interface SessionData {
  transcript: Array<{ role: string; content: string; timestamp?: string }>;
  affirmation?: string;
  primary_track: string;
}

export interface DeliverResult {
  sent?: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * P0-12: HTML-escape any string before interpolating it into email markup.
 * A transcript containing <b> or <script> must render as literal text.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendSessionEmail(
  email: string,
  firstName: string,
  session: SessionData
): Promise<DeliverResult> {
  if (!AGENTMAIL_API_KEY) {
    console.warn("AGENTMAIL_API_KEY not set - skipping email");
    return { skipped: true };
  }

  // P0-12: sender MUST be a verified address the client controls. We never
  // fabricate a domain (e.g. hush.app the project does not own). The verified
  // from-address is supplied via AGENTMAIL_FROM. If it is absent we surface a
  // real error rather than sending from an unverified/made-up domain.
  const from = process.env.AGENTMAIL_FROM;
  if (!from) {
    const message =
      "AGENTMAIL_FROM (verified sender address) is not configured. Refusing to send from an unverified domain.";
    console.error(message);
    return { error: message };
  }

  const safeName = escapeHtml(firstName);
  const safeTrack = escapeHtml(session.primary_track);

  const transcriptHtml = session.transcript
    .map((m) => {
      const speaker = m.role === "assistant" ? "Ms. Linda" : safeName;
      return `<div style="margin-bottom:14px;"><strong style="color:#f3be56;">${speaker}:</strong> ${escapeHtml(m.content)}</div>`;
    })
    .join("");

  const affirmationRaw = session.affirmation || buildDefaultAffirmation(firstName);
  const affirmation = escapeHtml(affirmationRaw);
  const wordCloud = extractKeywords(session.transcript);

  const htmlBody = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #14101b; color: #f5efe6;">
      <p style="letter-spacing:0.08em; text-transform:uppercase; font-size:12px; color:#f3be56; margin:0 0 8px; font-family: Arial, sans-serif;">Your Hush Session</p>
      <h1 style="color: #f5efe6; font-size: 30px; margin: 0 0 4px; font-weight: 600;">Presence with Personality</h1>
      <p style="color: #c6bcd4; font-size: 15px; margin: 0 0 28px;">With Ms. Linda &middot; ${safeTrack}</p>

      <div style="background: linear-gradient(135deg,#3d2f0e,#14101b); border:1px solid rgba(243,190,86,0.35); border-radius: 20px; padding: 28px; margin-bottom: 20px;">
        <p style="letter-spacing:0.08em; text-transform:uppercase; font-size:11px; color:#f3be56; margin:0 0 12px; font-family: Arial, sans-serif;">Your Affirmation</p>
        <p style="font-size: 21px; font-style: italic; color: #f5efe6; line-height: 1.6; margin:0;">${affirmation}</p>
      </div>

      <div style="background: #1d1727; border:1px solid #3a3248; border-radius: 20px; padding: 28px; margin-bottom: 20px;">
        <p style="letter-spacing:0.08em; text-transform:uppercase; font-size:11px; color:#a259ff; margin:0 0 14px; font-family: Arial, sans-serif;">Your Session Themes</p>
        ${wordCloud
          .map(
            (w) =>
              `<span style="display: inline-block; background: rgba(162,89,255,0.16); color: #c79bff; padding: 6px 14px; border-radius: 999px; margin: 4px; font-family: Arial, sans-serif; font-size: ${14 + w.weight * 8}px;">${escapeHtml(w.word)}</span>`
          )
          .join(" ")}
      </div>

      <div style="background: #1d1727; border:1px solid #3a3248; border-radius: 20px; padding: 28px; margin-bottom: 20px;">
        <p style="letter-spacing:0.08em; text-transform:uppercase; font-size:11px; color:#a259ff; margin:0 0 14px; font-family: Arial, sans-serif;">Session Transcript</p>
        <div style="font-family: Arial, sans-serif; color: #f5efe6; line-height: 1.6; font-size: 14px;">${transcriptHtml}</div>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL || "https://hush-app-six.vercel.app")}" style="background: linear-gradient(120deg,#a259ff,#6f00d2); color: #ffffff; padding: 14px 30px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 15px; font-family: Arial, sans-serif;">Start Another Session</a>
      </div>

      <p style="text-align: center; color: #8a7f99; font-size: 12px; margin-top: 36px; font-family: Arial, sans-serif;">The Hush App &middot; Presence with Personality</p>
    </div>
  `;

  const body = {
    to: email,
    from,
    subject: `Your Hush Session - ${session.primary_track}`,
    html: htmlBody,
  };

  try {
    const res = await fetch(AGENTMAIL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AGENTMAIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("AgentMail error:", err);
      return { error: `AgentMail ${res.status}: ${err.slice(0, 300)}` };
    }

    return { sent: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Email delivery failed";
    console.error("AgentMail request failed:", message);
    return { error: message };
  }
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
    "deception", "congruence", "reading", "listening",
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

  const unique = results.filter(
    (r, i) => results.findIndex((x) => x.word === r.word) === i
  );
  unique.sort((a, b) => b.count - a.count);
  const top = unique.slice(0, 15);

  const maxCount = top[0]?.count || 1;
  return top.map((r) => ({ word: r.word, weight: r.count / maxCount }));
}
