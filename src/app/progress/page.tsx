"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { getProgressSummary } from "@/lib/history";

export default function ProgressPage() {
  const [summary, setSummary] = useState<{ sessions: number; tracks: string[]; themes: string[] }>({
    sessions: 0,
    tracks: [],
    themes: [],
  });

  useEffect(() => {
    setSummary(getProgressSummary());
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface md:ml-64 pb-28 md:pb-16">
      <Sidebar />
      <main className="max-w-2xl mx-auto px-6 pt-12">
        <p className="caps-label text-gold mb-2">Presence Receipts</p>
        <h1 className="font-serif text-[30px] md:text-[34px] font-semibold mb-6">Progress</h1>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="hush-card p-6">
            <p className="font-serif text-[40px] font-semibold text-gold leading-none">{summary.sessions}</p>
            <p className="caps-label text-on-surface-variant mt-2">Sessions completed</p>
          </div>
          <div className="hush-card p-6">
            <p className="font-serif text-[40px] font-semibold text-gold leading-none">{summary.tracks.length}</p>
            <p className="caps-label text-on-surface-variant mt-2">Tracks explored</p>
          </div>
        </div>

        {summary.tracks.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-[22px] font-semibold mb-3">Tracks you have worked</h2>
            <div className="flex flex-wrap gap-2">
              {summary.tracks.map((t) => (
                <span key={t} className="gold-chip">{t}</span>
              ))}
            </div>
          </section>
        )}

        {summary.themes.length > 0 ? (
          <section>
            <h2 className="font-serif text-[22px] font-semibold mb-3">Skills you are practicing</h2>
            <div className="flex flex-wrap gap-2">
              {summary.themes.map((t) => (
                <span key={t} className="gold-chip">{t}</span>
              ))}
            </div>
          </section>
        ) : (
          summary.sessions === 0 && (
            <p className="font-body-md text-on-surface-variant">
              Your first session with Ms. Linda will start filling this page with the nonverbal skills you are building.
            </p>
          )
        )}
      </main>
      <BottomNav />
    </div>
  );
}
