const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  text: string;
  tagged_text: string;
}

export async function chat(
  messages: DeepSeekMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<DeepSeekResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not set");

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error("DeepSeek returned empty response");

  try {
    const parsed = JSON.parse(content);
    if (parsed.text && parsed.tagged_text) {
      return { text: parsed.text, tagged_text: parsed.tagged_text };
    }
    // Fallback: use raw content for both
    console.warn("DeepSeek did not return valid JSON format, using raw text");
    return { text: content, tagged_text: content };
  } catch {
    // JSON parse failed - fallback to raw text
    console.warn("DeepSeek JSON parse failed, using raw text");
    return { text: content, tagged_text: content };
  }
}
