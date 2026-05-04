import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  try {
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");
    const batchSize = 50;

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const text = fs.readFileSync(
      path.join(process.cwd(), "knowledge-base/book-text.txt"),
      "utf-8"
    );

    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + 500, text.length);
      let chunk = text.slice(start, end);
      if (end < text.length) {
        for (const sep of [". ", ".\n", "\n\n", "\n", " "]) {
          const idx = chunk.lastIndexOf(sep);
          if (idx > 150) { chunk = text.slice(start, start + idx + 2); break; }
        }
      }
      chunk = chunk.trim();
      if (chunk.length > 40) chunks.push(chunk);
      start += chunk.length;
    }

    const batch = chunks.slice(offset, offset + batchSize);
    if (batch.length === 0) return NextResponse.json({ total: chunks.length, done: true });

    const res = await fetch(`${SUPABASE_URL}/rest/v1/hush_book_chunks`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch.map((c) => ({ content: c }))),
    });

    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({
      total: chunks.length,
      offset,
      inserted: batch.length,
      done: offset + batchSize >= chunks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
