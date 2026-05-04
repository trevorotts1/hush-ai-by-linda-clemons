"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

interface Message {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("hush_session");
    if (!stored) {
      router.push("/mode-select");
      return;
    }
    const session = JSON.parse(stored);
    setSessionId(session.id);

    // Show proactive greeting
    if (session.greeting) {
      setMessages([{ role: "assistant", content: session.greeting }]);
    }
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Idle timer
  useEffect(() => {
    if (sessionEnded || !sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/session/status?session_id=${sessionId}`);
        const data = await res.json();
        setExchangeCount(data.exchange_count || 0);
        if (data.status === "completed" || data.idle_minutes >= 3) {
          setSessionEnded(true);
          clearInterval(interval);
          endSession();
        }
      } catch {}
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, sessionEnded]);

  async function endSession() {
    try {
      await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch {}
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || sessionEnded) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/session/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      });
      const data = await res.json();
      
      if (data.session_ended) {
        setSessionEnded(true);
        setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
        return;
      }

      // Generate TTS
      let audioUrl: string | undefined;
      if (data.tagged_text) {
        try {
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: data.tagged_text }),
          });
          const ttsData = await ttsRes.json();
          audioUrl = ttsData.audio_url;
        } catch {}
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.text, audioUrl }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function playAudio(url: string) {
    if (!audioRef.current) return;
    
    // If same audio is playing, pause it
    if (playingAudio === url) {
      audioRef.current.pause();
      setPlayingAudio(null);
      return;
    }
    
    // If same audio is paused, resume it
    if (audioRef.current.src.includes(url.split(',')[1]?.slice(0, 50) || '')) {
      audioRef.current.play();
      setPlayingAudio(url);
      return;
    }
    
    // New audio — load and play
    audioRef.current.src = url;
    audioRef.current.play();
    setPlayingAudio(url);
  }

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-xl">
          <h1 className="font-headline-xl text-headline-xl gradient-text mb-md">Session Complete</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
            Thank you for this conversation. Check your email for your session notes and something special.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
            className="btn-primary"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Sidebar />
      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} />

      {/* MOBILE */}
      <div className="md:hidden min-h-screen flex flex-col">
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-container-highest flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-on-primary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary font-black tracking-tighter">
              Hush
            </h1>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {exchangeCount}/100
          </span>
        </header>

        <main className="flex-grow pt-[88px] pb-[100px] px-container-margin w-full flex flex-col gap-lg">
          <div className="flex flex-col gap-md">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex flex-col gap-sm"}>
                {msg.role === "user" ? (
                  <div className="bg-primary rounded-2xl rounded-tr-sm p-sm max-w-[85%] shadow-card">
                    <p className="font-body-md text-body-md text-on-primary">{msg.content}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end gap-base">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                        <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          psychology
                        </span>
                      </div>
                      <div className="bg-surface-container rounded-2xl rounded-tl-sm p-sm max-w-[85%] shadow-sm">
                        <p className="font-body-md text-body-md text-on-surface">{msg.content}</p>
                      </div>
                    </div>
                    {/* Linda Cue - shows occasionally with coaching tips */}
                    {i > 0 && i % 3 === 0 && (
                      <div className="ml-10 bg-tertiary-fixed/30 border-l-[4px] border-tertiary-fixed-dim rounded-lg p-sm shadow-[0_4px_20px_0px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-xs mb-xs">
                          <span className="material-symbols-outlined text-tertiary text-[18px]">lightbulb</span>
                          <h3 className="font-label-bold text-label-bold text-tertiary">Pro Tip</h3>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
                          Your body speaks louder than your words. Stillness reveals the truth.
                        </p>
                        <div className="flex gap-xs">
                          <span className="px-2 py-1 bg-primary-fixed text-primary font-label-sm text-label-sm rounded-full">Body Language</span>
                          <span className="px-2 py-1 bg-primary-fixed text-primary font-label-sm text-label-sm rounded-full">Presence</span>
                        </div>
                      </div>
                    )}
                    {msg.audioUrl && (
                      <div className="flex items-center gap-base ml-10">
                        <button
                          onClick={() => playAudio(msg.audioUrl!)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-fixed text-primary hover:bg-primary-fixed-dim transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {playingAudio === msg.audioUrl ? "pause" : "play_arrow"}
                          </span>
                        </button>
                        <div className="flex items-center gap-[2px] h-6 flex-grow max-w-[120px]">
                          {playingAudio === msg.audioUrl && (
                            <>
                              <div className="w-1 bg-primary rounded-full h-2 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-4 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-6 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-3 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-5 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-2 wave-bar" />
                              <div className="w-1 bg-primary rounded-full h-4 wave-bar" />
                              <div className="w-1 bg-primary/30 rounded-full h-1" />
                              <div className="w-1 bg-primary/30 rounded-full h-1" />
                              <div className="w-1 bg-primary/30 rounded-full h-1" />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-base">
                <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <div className="bg-primary-container rounded-2xl rounded-tl-sm p-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        <div className="fixed bottom-0 w-full z-40 bg-surface border-t border-surface-container-highest px-container-margin py-sm pb-safe shadow-[0_-4px_20px_0px_rgba(0,0,0,0.05)]">
          <form onSubmit={sendMessage} className="flex items-center gap-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-white border border-surface-container-highest rounded-[12px] px-sm py-xs font-body-md text-body-md text-on-surface placeholder:text-outline shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none"
              placeholder={loading ? "Ms. Linda is thinking..." : "Type your response..."}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-secondary-container shadow-[0_4px_12px_rgba(139,44,245,0.2)] hover:shadow-[0_6px_16px_rgba(139,44,245,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex md:ml-64 pt-20 pb-24 flex-col max-w-4xl mx-auto w-full relative">
        <div className="flex-1 overflow-y-auto p-container-margin md:p-md space-y-lg flex flex-col">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end mb-sm" : "flex justify-start mb-sm gap-sm items-start"}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-tr-sm p-4 shadow-sm">
                  <p className="font-body-md text-body-md">{msg.content}</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                    <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      psychology
                    </span>
                  </div>
                  <div className="max-w-[85%] bg-surface-container text-on-surface rounded-2xl rounded-tl-sm p-4 shadow-sm">
                    <p className="font-body-md text-body-md mb-3">{msg.content}</p>
                    {msg.audioUrl && (
                      <div className="flex items-center gap-3 bg-surface text-primary p-3 rounded-xl border border-outline-variant">
                        <button
                          onClick={() => playAudio(msg.audioUrl!)}
                          className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {playingAudio === msg.audioUrl ? "pause" : "play_arrow"}
                          </span>
                        </button>
                        <div className="flex items-end gap-1 h-6 flex-1">
                          {playingAudio === msg.audioUrl && (
                            <>
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                              <div className="w-1.5 bg-primary rounded-full wave-bar" />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Linda Cue - desktop */}
                  {i > 0 && i % 3 === 0 && (
                    <div className="bg-tertiary-fixed/30 border-l-[4px] border-tertiary-fixed-dim rounded-lg p-sm shadow-[0_4px_20px_0px_rgba(0,0,0,0.02)] max-w-[85%] ml-12">
                      <div className="flex items-center gap-xs mb-xs">
                        <span className="material-symbols-outlined text-tertiary text-[18px]">lightbulb</span>
                        <h3 className="font-label-bold text-label-bold text-tertiary">Pro Tip</h3>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
                        Your body speaks louder than your words. Stillness reveals the truth.
                      </p>
                      <div className="flex gap-xs">
                        <span className="px-2 py-1 bg-primary-fixed text-primary font-label-sm text-label-sm rounded-full">Body Language</span>
                        <span className="px-2 py-1 bg-primary-fixed text-primary font-label-sm text-label-sm rounded-full">Presence</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-sm gap-sm items-start">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <div className="bg-surface-container rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="fixed bottom-0 w-full z-40 bg-surface/90 backdrop-blur-sm border-t border-surface-container-highest justify-center pb-sm pt-sm left-0 flex">
          <form onSubmit={sendMessage} className="w-full max-w-[1140px] px-container-margin flex items-center gap-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-white border border-surface-container-highest rounded-[12px] px-sm py-sm font-body-md text-body-md text-on-surface placeholder:text-outline shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] outline-none"
              placeholder={loading ? "Ms. Linda is thinking..." : "Type your response..."}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[12px] bg-gradient-to-br from-primary-container to-secondary-container shadow-[0_4px_12px_rgba(139,44,245,0.2)] hover:shadow-[0_6px_16px_rgba(139,44,245,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
