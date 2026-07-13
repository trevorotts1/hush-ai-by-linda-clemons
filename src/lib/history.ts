// Client-side session history (localStorage). Powers the Library (saved
// affirmations) and Progress (streak / topics) screens without requiring a
// verified-auth round trip. Verified server-side history is tracked as P2-3.
"use client";

export interface HistoryEntry {
  track: string;
  affirmation?: string;
  date: string; // ISO
  themes: string[];
}

const KEY = "hush_history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveCompletedSession(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const all = getHistory();
    all.unshift(entry);
    window.localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
  } catch {
    // best effort
  }
}

export function getSavedAffirmations(): { text: string; track: string; date: string }[] {
  return getHistory()
    .filter((h) => h.affirmation && h.affirmation.trim().length > 0)
    .map((h) => ({ text: h.affirmation as string, track: h.track, date: h.date }));
}

export function getProgressSummary(): {
  sessions: number;
  tracks: string[];
  themes: string[];
} {
  const all = getHistory();
  const tracks = Array.from(new Set(all.map((h) => h.track).filter(Boolean)));
  const themes = Array.from(new Set(all.flatMap((h) => h.themes || []))).slice(0, 24);
  return { sessions: all.length, tracks, themes };
}
