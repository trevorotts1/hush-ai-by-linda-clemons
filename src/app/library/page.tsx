"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { getSavedAffirmations } from "@/lib/history";

// Curated book cues from Linda Clemons' "Hush" power statements.
const BOOK_CUES: string[] = [
  "Allure doesn't scream. It whispers.",
  "Confidence doesn't need a microphone.",
  "You don't chase power. You align with it.",
  "Stillness is not silence. Stillness is strength.",
  "One signal is a clue. Three signals are a pattern.",
  "Baby, you're not broken; you're just blocked.",
  "Vulnerability happens when someone feels seen, not analyzed.",
  "Mirroring isn't mimicry. It's a slow dance, not a flash mob.",
  "When your presence says 'I belong here,' people believe it. And you start to believe it too.",
  "Pause for the cause.",
  "You don't need permission to be in the room. You are the value.",
  "True power doesn't need to shout. It stands tall. It breathes deep. It radiates.",
];

export default function LibraryPage() {
  const [affirmations, setAffirmations] = useState<{ text: string; track: string; date: string }[]>([]);

  useEffect(() => {
    setAffirmations(getSavedAffirmations());
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface md:ml-64 pb-28 md:pb-16">
      <Sidebar />
      <main className="max-w-2xl mx-auto px-6 pt-12">
        <p className="caps-label text-gold mb-2">Your Quiet Room</p>
        <h1 className="font-serif text-[30px] md:text-[34px] font-semibold mb-6">Library</h1>

        <section className="mb-10">
          <h2 className="font-serif text-[22px] font-semibold mb-3">Saved affirmations</h2>
          {affirmations.length === 0 ? (
            <p className="font-body-md text-on-surface-variant">
              Finish a session with Ms. Linda and your affirmations will be collected here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {affirmations.map((a, i) => (
                <div key={i} className="rounded-3xl p-6 shadow-gold" style={{ background: "linear-gradient(135deg,#f3be56,#d9a23f)" }}>
                  <p className="font-serif italic text-[19px] leading-[1.5] text-on-gold">{a.text}</p>
                  <p className="caps-label text-on-gold/70 mt-3">{a.track}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-serif text-[22px] font-semibold mb-3">Book cues from Hush</h2>
          <div className="flex flex-col gap-2.5">
            {BOOK_CUES.map((c, i) => (
              <div key={i} className="linda-cue-border rounded-2xl px-4 py-3">
                <p className="font-body-md text-body-md text-on-surface italic">{c}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
