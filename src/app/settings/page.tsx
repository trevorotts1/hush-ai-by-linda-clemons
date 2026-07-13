"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [profile, setProfile] = useState<{ first_name?: string; email?: string }>({});

  useEffect(() => {
    const stored = window.localStorage.getItem("hush_autospeak");
    setAutoSpeak(stored === null ? true : stored === "1");
    try {
      const u = window.sessionStorage.getItem("hush_user");
      if (u) setProfile(JSON.parse(u));
    } catch {
      /* ignore */
    }
  }, []);

  function toggleAutoSpeak() {
    setAutoSpeak((prev) => {
      const next = !prev;
      window.localStorage.setItem("hush_autospeak", next ? "1" : "0");
      return next;
    });
  }

  function clearLocalData() {
    window.localStorage.removeItem("hush_history");
    window.sessionStorage.clear();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background text-on-surface md:ml-64 pb-28 md:pb-16">
      <Sidebar />
      <main className="max-w-2xl mx-auto px-6 pt-12">
        <p className="caps-label text-gold mb-2">Your Space</p>
        <h1 className="font-serif text-[30px] md:text-[34px] font-semibold mb-6">Settings</h1>

        <section className="hush-card p-6 mb-4 flex items-center justify-between">
          <div>
            <p className="font-label-bold text-on-surface">Auto-speak Ms. Linda</p>
            <p className="font-body-md text-[14px] text-on-surface-variant mt-0.5">
              Play her voice automatically when she replies.
            </p>
          </div>
          <button
            onClick={toggleAutoSpeak}
            aria-pressed={autoSpeak}
            className={`w-14 h-8 rounded-full relative transition-colors shrink-0 ${autoSpeak ? "bg-gold" : "bg-surface-container-high"}`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-surface-container-lowest transition-transform ${autoSpeak ? "translate-x-7" : "translate-x-1"}`}
            />
          </button>
        </section>

        <section className="hush-card p-6 mb-4">
          <p className="caps-label text-on-surface-variant mb-3">Your profile</p>
          <div className="flex flex-col gap-2">
            <p className="font-body-md text-body-md">
              <span className="text-on-surface-variant">Name: </span>
              {profile.first_name || "Not set"}
            </p>
            <p className="font-body-md text-body-md">
              <span className="text-on-surface-variant">Email: </span>
              {profile.email || "Not set"}
            </p>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-4 leading-relaxed">
            Your name and email are used only to personalize your session and send your recap.
            Your conversation stays private and is never sold.
          </p>
        </section>

        <button onClick={clearLocalData} className="btn-ghost text-error border-error/40">
          <span className="material-symbols-outlined">delete</span>
          Clear my data on this device
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
