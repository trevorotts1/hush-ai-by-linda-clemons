"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import { errorMessage } from "@/lib/errors";

interface Track {
  id: string;
  title: string;
  promise: string;
  icon: string;
  image: string | null;
}

const TRACKS: Track[] = [
  {
    id: "Read Anyone Instantly",
    title: "Read Anyone Instantly",
    promise: "Decode body language and hear what people never say out loud.",
    icon: "visibility",
    image: "/images/hush-read-anyone.jpg",
  },
  {
    id: "Command Any Room",
    title: "Command Any Room",
    promise: "Walk in with CIA energy and own the space before you speak.",
    icon: "workspace_premium",
    image: "/images/hush-command-room.jpg",
  },
  {
    id: "Master Your Own Signals",
    title: "Master Your Own Signals",
    promise: "Stop self-sabotage. Make your body say what you mean.",
    icon: "self_improvement",
    image: "/images/hush-master-signals.jpg",
  },
  {
    id: "Transform Your Relationships",
    title: "Transform Your Relationships",
    promise: "The Quiet Hold, barely-there flirtation, and mirroring that lands.",
    icon: "favorite",
    image: "/images/hush-relationships.jpg",
  },
  {
    id: "Something Else",
    title: "Something Else",
    promise: "Tell Ms. Linda what's on your mind and we'll work from there.",
    icon: "chat_bubble",
    image: null,
  },
];

function readStoredUser(): { id: string; first_name?: string } | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem("hush_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as { id: string; first_name?: string };
  } catch {
    return null;
  }
}

export default function ModeSelectPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const u = readStoredUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUserName(u.first_name || "");
  }, [router]);

  async function selectTrack(track: string) {
    setLoading(track);
    setError("");
    try {
      const stored = sessionStorage.getItem("hush_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, track }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem("hush_session", JSON.stringify({ id: data.session_id, greeting: data.greeting }));
      sessionStorage.setItem("hush_track", track);
      router.push("/chat");
    } catch (err: unknown) {
      setError(errorMessage(err));
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      {error && <Toast message={error} onClose={() => setError("")} />}

      <main className="md:ml-64 pb-28 md:pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 pt-10 md:pt-14">
          <header className="mb-8">
            <p className="caps-label text-gold mb-2">Ms. Linda is listening</p>
            <h1 className="font-serif text-[30px] md:text-[34px] leading-tight font-semibold text-on-surface mb-2">
              Choose your focus
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              {userName ? `Hey ${userName}. ` : ""}Where should we point the lens today?
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRACKS.map((track) => {
              const isLoading = loading === track.id;
              return (
                <button
                  key={track.id}
                  disabled={loading !== null}
                  onClick={() => selectTrack(track.id)}
                  className="group relative overflow-hidden rounded-3xl border border-outline-variant min-h-[168px] text-left transition-transform active:scale-[0.98] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {/* Duotone photo + scrim (reads intentionally, not as a watermark) */}
                  {track.image ? (
                    <Image
                      src={track.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 360px, 100vw"
                      className="object-cover duotone"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/40 to-secondary-container/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />

                  <div className="relative z-10 h-full flex flex-col justify-between p-5 min-h-[168px]">
                    <div className="flex items-start justify-between">
                      {/* Filled gold chip with dark glyph -> always visible, AA contrast at any width */}
                      <span className="w-12 h-12 rounded-2xl bg-gold text-on-gold flex items-center justify-center shadow-gold">
                        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {isLoading ? "hourglass_top" : track.icon}
                        </span>
                      </span>
                      <span className="w-9 h-9 rounded-full bg-surface-container-high/80 text-on-surface flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">
                          {isLoading ? "more_horiz" : "arrow_forward"}
                        </span>
                      </span>
                    </div>
                    <div>
                      <h2 className="font-serif text-[21px] leading-tight font-semibold text-on-surface mb-1">
                        {track.title}
                      </h2>
                      <p className="font-body-md text-[15px] text-on-surface-variant">{track.promise}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
