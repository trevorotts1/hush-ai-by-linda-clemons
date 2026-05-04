import { supabaseAdmin } from "./supabase";

interface SearchResult {
  id: string;
  section: string | null;
  content: string;
  rank: number;
}

export async function searchBook(query: string, limit = 5): Promise<SearchResult[]> {
  const { data, error } = await supabaseAdmin.rpc("search_book", {
    query_text: query,
    limit_count: limit,
  });

  if (error) {
    console.error("Book search error:", error);
    return [];
  }

  return (data || []) as SearchResult[];
}

export function formatSearchContext(results: SearchResult[]): string {
  if (results.length === 0) return "";
  return results.map((r, i) => `[${r.section || "Hush"}] ${r.content}`).join("\n\n---\n\n");
}
