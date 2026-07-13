"use client";

import { errorMessage } from "@/lib/errors";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Toast from "@/components/Toast";

const TEASER_LINE =
  "(warm) Hey baby, I'm Ms. Linda. (soft tone) The body whispers first. Come on in, let's read the room together.";

export default function WelcomePage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teaserLoading, setTeaserLoading] = useState(false);
  const [teaserOn, setTeaserOn] = useState(false);
  const teaserRef = useRef<HTMLAudioElement>(null);

  async function playTeaser() {
    if (teaserRef.current && teaserRef.current.src && !teaserRef.current.paused) {
      teaserRef.current.pause();
      setTeaserOn(false);
      return;
    }
    setTeaserLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: TEASER_LINE }),
      });
      const data: { audio_url?: string; error?: string } = await res.json();
      if (!res.ok || !data.audio_url) throw new Error(data.error || "Voice preview is unavailable right now.");
      if (teaserRef.current) {
        teaserRef.current.src = data.audio_url;
        await teaserRef.current.play();
        setTeaserOn(true);
      }
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setTeaserLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem("hush_user", JSON.stringify(data.user));
      router.push("/mode-select");
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <audio ref={teaserRef} onEnded={() => setTeaserOn(false)} onPause={() => setTeaserOn(false)} />
      {error && <Toast message={error} onClose={() => setError("")} />}

      <div className="w-full max-w-[28rem] mx-auto flex flex-col min-h-screen">
        {/* Full-bleed portrait */}
        <div className="relative w-full h-[46vh] min-h-[320px] shrink-0">
          <Image src="/images/hush-hero.jpg" alt="Ms. Linda Clemons" fill priority sizes="480px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-background/40 to-background" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="caps-label text-gold mb-2">Hush &middot; by Linda Clemons</p>
            <h1 className="font-serif text-[34px] leading-[1.1] font-semibold text-on-surface">
              The body whispers first.
            </h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 pt-5 pb-8 gap-5">
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Your voice-first coach for reading any room, commanding presence, and saying everything without a single word.
          </p>

          {/* Voice teaser before any form */}
          <button
            type="button"
            onClick={playTeaser}
            disabled={teaserLoading}
            className="btn-ghost self-start border-gold/50 text-gold"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {teaserLoading ? "graphic_eq" : teaserOn ? "pause" : "volume_up"}
            </span>
            {teaserLoading ? "Waking Ms. Linda..." : teaserOn ? "Pause" : "Listen to Ms. Linda"}
          </button>

          <form onSubmit={handleSubmit} className="hush-card p-5 flex flex-col gap-4 mt-1">
            <div className="flex flex-col gap-1.5">
              <label className="caps-label text-on-surface-variant" htmlFor="name">First name</label>
              <input
                id="name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field w-full py-3.5 px-4 font-body-md text-body-md"
                placeholder="What should Ms. Linda call you?"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="caps-label text-on-surface-variant" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full py-3.5 px-4 font-body-md text-body-md"
                placeholder="name@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="caps-label text-on-surface-variant" htmlFor="phone">
                Phone <span className="normal-case tracking-normal text-outline font-normal">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full py-3.5 px-4 font-body-md text-body-md"
                placeholder="Leave blank if you'd rather not"
              />
            </div>

            <p className="text-[13px] leading-relaxed text-outline">
              We use your name and email only to personalize your session and send your recap.
              Your conversation stays private and is never sold.
            </p>

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? "Opening the room..." : "Begin"}
              {!loading && (
                <span className="material-symbols-outlined">arrow_forward</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
