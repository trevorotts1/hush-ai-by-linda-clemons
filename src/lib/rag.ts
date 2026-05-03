import OpenAI from "openai";
import { supabaseAdmin } from "./supabase";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

interface RagChunk {
  content: string;
  source: string;
  section: string | null;
  similarity: number;
}

export async function searchKnowledge(
  query: string,
  conversationHistory: string = "",
  topK: number = 8
): Promise<RagChunk[]> {
  // Build search query with conversation context
  const searchQuery = conversationHistory
    ? `${conversationHistory}\n\nUser: ${query}`
    : query;

  // Generate embedding
  const embeddingResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: searchQuery,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // Search pgvector
  const { data, error } = await supabaseAdmin.rpc("match_hush_chunks", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: topK,
  });

  if (error) {
    console.error("RAG search error:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    content: row.content,
    source: row.source,
    section: row.section,
    similarity: row.similarity,
  }));
}

export function formatRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map(
      (chunk, i) =>
        `[Source: ${chunk.source}${chunk.section ? `, ${chunk.section}` : ""}]\n${chunk.content}`
    )
    .join("\n\n---\n\n");
}
