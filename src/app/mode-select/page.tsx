"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const TRACKS = [
  {
    id: "Read Anyone Instantly",
    title: "Read Anyone Instantly",
    subtitle: "Decode body language, spot deception, and understand what people are really saying without a single word.",
    icon: "visibility",
    gradient: "from-primary-container/10 to-transparent",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    hoverColor: "group-hover:text-primary",
    image: "/images/hush-read-anyone.jpg",
  },
  {
    id: "Command Any Room",
    title: "Command Any Room",
    subtitle: "Own your presence with CIA Energy. Walk into every room like you belong there.",
    icon: "handshake",
    gradient: "from-secondary-container/10 to-transparent",
    iconBg: "bg-secondary-container/20",
    iconColor: "text-secondary",
    hoverColor: "group-hover:text-secondary",
    image: "/images/hush-command-room.jpg",
  },
  {
    id: "Master Your Own Signals",
    title: "Master Your Own Signals",
    subtitle: "Control your nonverbal communication. Stop self-sabotage and start showing up powerfully.",
    icon: "favorite",
    gradient: "from-tertiary/10 to-transparent",
    iconBg: "bg-tertiary-container/20",
    iconColor: "text-tertiary",
    hoverColor: "group-hover:text-tertiary",
    image: "/images/hush-master-signals.jpg",
  },
  {
    id: "Transform Your Relationships",
    title: "Transform Your Relationships",
    subtitle: "Use the Quiet Hold, barely-there flirtation, and mirroring to transform every relationship.",
    icon: "mic",
    gradient: "from-primary/60 to-secondary/60",
    iconBg: "bg-white/20",
    image: "/images/hush-relationships.jpg",
    iconColor: "text-white",
    hoverColor: "group-hover:text-white",
    featured: true,
  },
  {
    id: "Something Else",
    title: "Something Else",
    subtitle: "Tell me what's on your mind and we'll work from there.",
    icon: "help",
    gradient: "from-surface-variant/10 to-transparent",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface-variant",
    hoverColor: "group-hover:text-on-surface",
    image: null,
  },
];

export default function ModeSelectPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("hush_user");
    if (!stored) {
      router.push("/");
      return;
    }
    const user = JSON.parse(stored);
    setUserName(user.first_name || "");
  }, [router]);

  async function selectTrack(track: string) {
    setLoading(true);
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
      router.push("/chat");
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      
      {/* MOBILE */}
      <main className="md:hidden min-h-screen pt-[72px] pb-[80px]">
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex justify-between items-center px-6 py-4">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-bold text-label-bold shadow-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-primary font-headline-md font-black tracking-tighter">
            Hush
          </div>
          <div className="w-8 h-8" />
        </header>

        <div className="flex-1 flex flex-col px-container-margin pt-md gap-lg">
          <section className="flex flex-col gap-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Presence Check</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Hey {userName}, I'm Ms. Linda. What can I help you master today?
            </p>
          </section>

          <section className="grid grid-cols-1 gap-md">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                disabled={loading}
                onClick={() => selectTrack(track.id)}
                className="group relative overflow-hidden rounded-[24px] bg-surface-container-lowest border border-[#E5E5E5] p-md text-left transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] flex flex-col gap-md disabled:opacity-50"
              >
                {/* Abstract decorative shapes matching each card theme */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                  {track.id === "Read Anyone Instantly" && <div className="w-full h-full rounded-full bg-primary" />}
                  {track.id === "Command Any Room" && <div className="w-full h-full rounded-bl-full bg-secondary" />}
                  {track.id === "Master Your Own Signals" && <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-tertiary" />}
                  {track.id === "Transform Your Relationships" && <div className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-full bg-white/30" />}
                  {track.id === "Something Else" && <div className="absolute top-4 right-4 w-16 h-16 rounded-2xl bg-outline-variant" />}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center justify-between z-10">
                  <div className={`w-12 h-12 rounded-xl ${track.iconBg} ${track.iconColor} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {track.icon}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </div>
                </div>
                <div className="z-10 flex flex-col gap-xs">
                  <h3 className={`font-headline-md text-headline-md text-on-surface ${track.hoverColor} transition-colors`}>
                    {track.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{track.subtitle}</p>
                </div>
              </button>
            ))}
          </section>
        </div>
        <BottomNav />
      </main>

      {/* DESKTOP */}
      <main className="hidden md:block md:ml-64 p-container-margin md:p-lg pb-32 max-w-[1140px] mx-auto w-full">
        <header className="mb-lg">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-xs">Presence Check</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Hey {userName}, I'm Ms. Linda. Reading the room with you. Choose your communication context for tailored coaching.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {TRACKS.map((track) => (
            <button
              key={track.id}
              disabled={loading}
              onClick={() => selectTrack(track.id)}
              className={`group relative overflow-hidden rounded-2xl shadow-sm border transition-all duration-300 text-left h-full min-h-[280px] md:min-h-[320px] disabled:opacity-50 ${
                track.featured
                  ? "bg-primary text-on-primary border-primary shadow-md hover:shadow-lg"
                  : "bg-white border-surface-variant hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              }`}
            >
              {/* Card background image */}
              {track.image && (
                <div className="absolute top-0 right-0 w-3/5 h-full overflow-hidden rounded-r-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 mix-blend-multiply">
                  <img src={track.image} alt="" className="object-cover w-full h-full" />
                </div>
              )}
              {/* Abstract decorative shapes */}
              <div className="absolute top-0 right-0 w-full h-full opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                {track.id === "Read Anyone Instantly" && <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-primary" />}
                {track.id === "Command Any Room" && <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-secondary" />}
                {track.id === "Master Your Own Signals" && <>
                  <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-tertiary" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-tertiary" />
                </>}
                {track.id === "Transform Your Relationships" && <div className="absolute -right-4 -top-4 w-full h-full rounded-2xl bg-white/20" />}
                {track.id === "Something Else" && <div className="absolute top-8 right-8 w-20 h-20 rotate-45 bg-outline-variant" />}
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${track.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10 p-md flex flex-col h-full justify-between">
                <div className={`w-12 h-12 rounded-full ${track.iconBg} flex items-center justify-center mb-sm`}>
                  <span className={`material-symbols-outlined ${track.iconColor} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {track.icon}
                  </span>
                </div>
                <div>
                  <h2 className={`font-headline-md text-headline-md mb-xs ${track.hoverColor} transition-colors ${track.featured ? "text-on-primary" : "text-on-surface"}`}>
                    {track.title}
                  </h2>
                  <p className={`font-body-md text-body-md ${track.featured ? "text-on-primary/70" : "text-on-surface-variant"}`}>{track.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
