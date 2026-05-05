const CUES = [
  "Read the room before you try to own the room. Stillness gives you the first truth.",
  "Watch for three signals before you decide what a body is saying. One signal is a clue, three signals are a pattern.",
  "Confidence is quiet before it is loud. Shoulders down, breath steady, eyes soft.",
];

export default function LindaCue({ index = 0 }: { index?: number }) {
  const cue = CUES[index % CUES.length];

  return (
    <aside className="linda-cue-border rounded-2xl p-sm md:p-md shadow-card text-on-surface max-w-[92%] md:max-w-[720px]">
      <div className="flex items-start gap-sm">
        <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            tips_and_updates
          </span>
        </div>
        <div className="space-y-xs">
          <p className="font-label-bold text-label-bold uppercase text-tertiary">Ms. Linda Cue</p>
          <p className="font-body-md text-body-md text-on-surface-variant">{cue}</p>
        </div>
      </div>
    </aside>
  );
}
