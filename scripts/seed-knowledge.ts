// Seed script — chunks knowledge base, embeds, inserts into Supabase
// Run: npx tsx scripts/seed-knowledge.ts

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 50;

function chunkText(text: string, source: string, section?: string) {
  const chunks: { content: string; source: string; section?: string }[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);
    
    // Try to break at sentence boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline, CHUNK_SIZE - 50);
      if (breakPoint > CHUNK_SIZE / 2) {
        chunk = text.slice(start, start + breakPoint + 1);
      }
    }
    
    if (chunk.trim().length > 50) {
      chunks.push({ content: chunk.trim(), source, section });
    }
    start += chunk.length - CHUNK_OVERLAP;
  }
  
  return chunks;
}

async function embed(chunks: { content: string; source: string; section?: string }[]) {
  const results = [];
  const batchSize = 20;
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch.map((c) => c.content),
      dimensions: 1536,
    });
    
    for (let j = 0; j < batch.length; j++) {
      results.push({
        content: batch[j].content,
        source: batch[j].source,
        section: batch[j].section || null,
        embedding: response.data[j].embedding,
      });
    }
    
    console.log(`  Embedded ${i + batch.length}/${chunks.length} chunks...`);
    // Rate limit
    if (i + batchSize < chunks.length) await new Promise((r) => setTimeout(r, 200));
  }
  
  return results;
}

async function insertChunks(chunks: any[]) {
  const batchSize = 10;
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/hush_knowledge_chunks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
    });
    
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Insert failed: ${response.status} ${err}`);
    }
    
    console.log(`  Inserted ${i + batch.length}/${chunks.length} chunks...`);
  }
}

async function main() {
  console.log("🌱 Seeding Hush knowledge base...\n");
  
  // Read sources
  const bookText = fs.readFileSync(
    path.join(process.cwd(), "knowledge-base/book-text.txt"),
    "utf-8"
  );
  const blueprint = fs.readFileSync(
    path.join(process.cwd(), "knowledge-base/blueprint.md"),
    "utf-8"
  );
  
  console.log(`Book text: ${(bookText.length / 1000).toFixed(1)}K chars`);
  console.log(`Blueprint: ${(blueprint.length / 1000).toFixed(1)}K chars\n`);
  
  // Clear existing chunks
  console.log("Clearing existing chunks...");
  await fetch(`${SUPABASE_URL}/rest/v1/hush_knowledge_chunks?select=id&limit=10000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  }).then(async (r) => {
    const ids = (await r.json() as any[]).map((c: any) => c.id);
    while (ids.length > 0) {
      const batch = ids.splice(0, 100);
      await fetch(`${SUPABASE_URL}/rest/v1/hush_knowledge_chunks?id=in.(${batch.join(",")})`, {
        method: "DELETE",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
    }
    console.log(`  Deleted existing chunks\n`);
  }).catch(() => console.log("  No existing chunks to clear\n"));
  
  // Chunk
  console.log("Chunking...");
  const allChunks = [
    ...chunkText(bookText, "book"),
    ...chunkText(blueprint, "blueprint"),
  ];
  console.log(`  ${allChunks.length} total chunks\n`);
  
  // Embed
  console.log("Embedding...");
  const embedded = await embed(allChunks);
  console.log(`  Done\n`);
  
  // Insert
  console.log("Inserting into Supabase...");
  await insertChunks(embedded);
  
  console.log(`\n✅ Done! ${embedded.length} chunks seeded.`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
