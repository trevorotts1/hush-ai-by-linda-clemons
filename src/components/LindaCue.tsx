"use client";

// Techniques Ms. Linda teaches. When one shows up in her actual reply we surface
// it as a gold "Cue" chip so the cue always reflects the real conversation
// (spec S3), never a hardcoded rotation.
const TECHNIQUES: { label: string; match: RegExp }[] = [
  { label: "The Quiet Hold", match: /quiet hold/i },
  { label: "CIA Energy", match: /\bcia\b|command.*influence|influence.*attract/i },
  { label: "Stillness Reading", match: /stillness/i },
  { label: "Mirroring", match: /mirror/i },
  { label: "Self-Soothing", match: /self.?sooth|neck dimple|hand wring/i },
  { label: "Micro-Expressions", match: /micro.?expression/i },
  { label: "Congruence", match: /congruen|incongruen/i },
  { label: "Power Zones", match: /power zone|heart zone|core power/i },
  { label: "Positioning", match: /position|spatial|where you stand/i },
  { label: "The Baseline", match: /baseline/i },
  { label: "Read the Cluster", match: /cluster|three signals|3 signals/i },
  { label: "Soft-Edged Smile", match: /soft.?edged smile|soft smile/i },
  { label: "Presence", match: /\bpresence\b/i },
  { label: "Eye Contact", match: /eye contact/i },
  { label: "Open Posture", match: /open posture|shoulders back|heart open/i },
];

const FALLBACK = "One signal is a clue. Three signals are a pattern. Read the cluster.";

export default function LindaCue({ latestReply = "" }: { latestReply?: string }) {
  const chips = TECHNIQUES.filter((t) => t.match.test(latestReply))
    .slice(0, 3)
    .map((t) => t.label);

  // If no technique keyword was found, pull the punchiest short sentence as a cue.
  let highlight = FALLBACK;
  if (chips.length === 0 && latestReply) {
    const sentences = latestReply
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && s.length < 140);
    if (sentences.length) highlight = sentences.sort((a, b) => a.length - b.length)[0];
  }

  return (
    <aside className="linda-cue-border rounded-2xl p-4 md:p-5 max-w-full md:max-w-[720px]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-gold flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            tips_and_updates
          </span>
        </div>
        <div className="space-y-2 min-w-0">
          <p className="caps-label text-gold">Ms. Linda Cue</p>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="gold-chip">{c}</span>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant italic">{highlight}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
