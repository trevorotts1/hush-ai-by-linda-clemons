"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import LindaAvatar from "@/components/LindaAvatar";
import LindaCue from "@/components/LindaCue";
import AudioPlayer from "@/components/AudioPlayer";
import Toast, { type ToastKind } from "@/components/Toast";
import { errorMessage } from "@/lib/errors";
import { saveCompletedSession } from "@/lib/history";

interface Message {
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  autoplay?: boolean;
}

type StoredSession = { id: string; greeting?: string };

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;
type BrowserWindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const IDLE_WARN_MS = 14 * 60 * 1000; // warn at 14 min
const IDLE_END_MS = 15 * 60 * 1000; // auto-end at 15 min (>= 15 min threshold)

const THINKING_STAGES = [
  "Ms. Linda is listening",
  "reading the room",
  "thinking",
  "finding the words",
];

const THEME_MAP: { label: string; re: RegExp }[] = [
  { label: "The Quiet Hold", re: /quiet hold/i },
  { label: "CIA Energy", re: /\bcia\b|command.*influence/i },
  { label: "Stillness", re: /stillness/i },
  { label: "Mirroring", re: /mirror/i },
  { label: "Self-Soothing", re: /self.?sooth|neck dimple/i },
  { label: "Micro-Expressions", re: /micro.?expression/i },
  { label: "Congruence", re: /congruen|incongruen/i },
  { label: "Power Zones", re: /power zone|heart zone/i },
  { label: "Positioning", re: /position|spatial/i },
  { label: "Baseline", re: /baseline/i },
  { label: "Presence", re: /\bpresence\b/i },
  { label: "Eye Contact", re: /eye contact/i },
  { label: "Confidence", re: /confidence/i },
];

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractThemes(messages: Message[]): string[] {
  const all = messages.map((m) => m.content).join(" ");
  return THEME_MAP.filter((t) => t.re.test(all)).map((t) => t.label).slice(0, 8);
}

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem("hush_session");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredSession;
  } catch {
    return null;
  }
}

export default function ChatPage() {
  const router = useRouter();
  const [sessionId] = useState(() => readStoredSession()?.id || "");
  const [track] = useState(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("hush_track") || "" : ""
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [rehydrating, setRehydrating] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micSupported, setMicSupported] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [idleWarn, setIdleWarn] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [ending, setEnding] = useState(false);
  const [recap, setRecap] = useState<{ affirmation: string | null } | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lastActivityRef = useRef(Date.now());
  const abortRef = useRef<AbortController | null>(null);
  const savedRef = useRef(false);
  const greetingTtsRef = useRef(false);

  const showToast = useCallback((msg: string, kind: ToastKind = "error") => setToast({ msg, kind }), []);
  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleWarn(false);
  }, []);

  // Redirect if no session.
  useEffect(() => {
    if (!sessionId) router.push("/mode-select");
  }, [router, sessionId]);

  // Auto-speak preference (default ON), persisted.
  useEffect(() => {
    const stored = window.localStorage.getItem("hush_autospeak");
    setAutoSpeak(stored === null ? true : stored === "1");
  }, []);
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => {
      const next = !prev;
      window.localStorage.setItem("hush_autospeak", next ? "1" : "0");
      return next;
    });
  }, []);

  // Mic feature-detection (P0-9).
  useEffect(() => {
    const w = window as BrowserWindowWithSpeech;
    setMicSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // Elapsed session timer (P0-4 replacement for the 0/100 counter).
  useEffect(() => {
    if (sessionEnded) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [sessionEnded]);

  // Cycle thinking microcopy while awaiting a reply (P0-10).
  useEffect(() => {
    if (!loading) return;
    setThinkingIdx(0);
    const iv = setInterval(() => setThinkingIdx((i) => (i + 1) % THINKING_STAGES.length), 1400);
    return () => clearInterval(iv);
  }, [loading]);

  // Restore conversation on refresh (P0-8): rehydrate from the DB transcript.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/session/status?session_id=${sessionId}`);
        const data: { transcript?: { role: string; content: string }[]; status?: string } = await res.json();
        if (cancelled) return;
        const t = (data.transcript || []).filter((m) => m && m.content);
        if (t.length > 0) {
          setMessages(t.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })));
        } else {
          const g = readStoredSession()?.greeting;
          if (g) setMessages([{ role: "assistant", content: g }]);
        }
      } catch {
        const g = readStoredSession()?.greeting;
        if (g) setMessages([{ role: "assistant", content: g }]);
      } finally {
        if (!cancelled) setRehydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Greeting voice (P0-2): fetch TTS for the greeting and attach it, autoplaying
  // when auto-speak is on.
  useEffect(() => {
    if (rehydrating || greetingTtsRef.current) return;
    const first = messages[0];
    if (!first || first.role !== "assistant" || first.audioUrl) return;
    greetingTtsRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: first.content }),
        });
        const data: { audio_url?: string } = await res.json();
        if (data.audio_url) {
          setMessages((prev) => {
            if (!prev.length) return prev;
            const next = [...prev];
            next[0] = { ...next[0], audioUrl: data.audio_url, autoplay: true };
            return next;
          });
        }
      } catch {
        // Text greeting still works if voice fails.
      }
    })();
  }, [rehydrating, messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, idleWarn]);

  // Abort any in-flight request on unmount (P2-6).
  useEffect(() => () => abortRef.current?.abort(), []);

  const endAndRecap = useCallback(
    async () => {
      if (!sessionId) return;
      setEnding(true);
      try {
        const res = await fetch("/api/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data: {
          affirmation?: string | null;
          email_sent?: boolean;
          email_error?: string | null;
          email_skipped?: boolean;
        } = await res.json();

        setRecap({ affirmation: data.affirmation ?? null });
        setSessionEnded(true);

        if (!savedRef.current) {
          savedRef.current = true;
          saveCompletedSession({
            track: track || "Hush session",
            affirmation: data.affirmation ?? undefined,
            date: new Date().toISOString(),
            themes: extractThemes(messages),
          });
        }

        if (data.email_sent) showToast("Your recap is on its way to your inbox.", "success");
        else if (data.email_skipped) showToast("Session saved. Email delivery is not configured yet.", "info");
        else if (data.email_error) showToast(`Recap saved, but the email did not send: ${data.email_error}`, "error");
      } catch (err) {
        showToast(errorMessage(err), "error");
      } finally {
        setEnding(false);
      }
    },
    [sessionId, track, messages, showToast]
  );

  // Idle guard (P0-5): warn at 14 min, auto-end at 15 min.
  useEffect(() => {
    if (sessionEnded || rehydrating) return;
    const iv = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_END_MS) void endAndRecap();
      else if (idle >= IDLE_WARN_MS) setIdleWarn(true);
    }, 5000);
    return () => clearInterval(iv);
  }, [sessionEnded, rehydrating, endAndRecap]);

  const sendCurrentMessage = useCallback(
    async (textArg?: string) => {
      const userMsg = (textArg ?? input).trim();
      if (!userMsg || loading || sessionEnded) return;
      setInput("");
      setInterim("");
      bumpActivity();
      setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/session/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, message: userMsg }),
          signal: controller.signal,
        });
        const data: { session_ended?: boolean; text?: string; tagged_text?: string; error?: string } =
          await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong.");

        if (data.session_ended) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.text || "Session complete." }]);
          setLoading(false);
          await endAndRecap();
          return;
        }

        let audioUrl: string | undefined;
        if (data.tagged_text) {
          try {
            const ttsRes = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: data.tagged_text }),
              signal: controller.signal,
            });
            const ttsData: { audio_url?: string } = await ttsRes.json();
            audioUrl = ttsData.audio_url;
          } catch {
            // text still works
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.text || "", audioUrl, autoplay: autoSpeak },
        ]);
        bumpActivity();
      } catch (err) {
        if ((err as Error).name !== "AbortError") showToast(errorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, sessionEnded, sessionId, autoSpeak, bumpActivity, endAndRecap, showToast]
  );

  function startListening() {
    if (!micSupported || loading) return;
    const w = window as BrowserWindowWithSpeech;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalText = "";
    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText);
    };
    recognition.onerror = () => {
      setListening(false);
      setInterim("");
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
      const text = finalText.trim();
      if (text) void sendCurrentMessage(text);
    };
    recognitionRef.current = recognition;
    setListening(true);
    bumpActivity();
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function resetAndLeave() {
    sessionStorage.removeItem("hush_session");
    sessionStorage.removeItem("hush_track");
    router.push("/mode-select");
  }

  const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";

  // ---------- RECAP (S4) ----------
  if (sessionEnded && recap) {
    const themes = extractThemes(messages);
    const affirmation =
      recap.affirmation ||
      "My presence speaks before my words ever do. I walk into every room knowing my body is my power.";
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <Sidebar />
        {toast && <Toast message={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />}
        <main className="md:ml-64 min-h-screen px-6 pt-12 pb-28 md:pb-16">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div>
              <p className="caps-label text-gold mb-2">Session Recap</p>
              <h1 className="font-serif text-[30px] md:text-[34px] font-semibold leading-tight">
                Here is what your body has been saying.
              </h1>
            </div>

            {/* Affirmation on a gold serif card */}
            <div className="rounded-3xl p-7 shadow-gold" style={{ background: "linear-gradient(135deg,#f3be56,#d9a23f)" }}>
              <p className="caps-label text-on-gold/80 mb-3">Your Affirmation</p>
              <p className="font-serif italic text-[22px] leading-[1.5] text-on-gold">{affirmation}</p>
            </div>

            {themes.length > 0 && (
              <div className="hush-card p-6">
                <p className="caps-label text-on-surface-variant mb-3">Themes we covered</p>
                <div className="flex flex-wrap gap-2">
                  {themes.map((t) => (
                    <span key={t} className="gold-chip">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <details className="hush-card p-6">
              <summary className="cursor-pointer font-label-bold text-on-surface select-none">
                Full transcript
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                {messages.map((m, i) => (
                  <div key={i}>
                    <p className="caps-label text-gold mb-1">{m.role === "assistant" ? "Ms. Linda" : "You"}</p>
                    <p className="font-body-md text-[15px] text-on-surface-variant whitespace-pre-line">{m.content}</p>
                  </div>
                ))}
              </div>
            </details>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => void endAndRecap()} disabled={ending} className="btn-ghost flex-1">
                <span className="material-symbols-outlined">mail</span>
                {ending ? "Sending..." : "Email me this"}
              </button>
              <button onClick={resetAndLeave} className="btn-primary flex-1">
                Start a new session
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ---------- SESSION (S3) ----------
  const showTextField = textOpen || !micSupported;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      {toast && <Toast message={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />}

      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Header: timer + auto-speak toggle + end button. No 0/100 counter. */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <LindaAvatar size="sm" speaking={loading} />
              <div className="min-w-0">
                <p className="font-serif font-semibold text-[17px] leading-none">Ms. Linda</p>
                <p className="text-[12px] text-on-surface-variant tabular-nums mt-0.5">{formatClock(elapsed)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleAutoSpeak}
                aria-pressed={autoSpeak}
                title={autoSpeak ? "Auto-speak on" : "Auto-speak off"}
                className={`h-10 px-3 rounded-full flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                  autoSpeak ? "bg-tertiary-fixed text-gold" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: autoSpeak ? "'FILL' 1" : "'FILL' 0" }}>
                  {autoSpeak ? "volume_up" : "volume_off"}
                </span>
                <span className="hidden sm:inline">Voice</span>
              </button>
              <button
                onClick={() => void endAndRecap()}
                disabled={ending}
                className="h-10 px-3 rounded-full bg-surface-container text-on-surface flex items-center gap-1.5 text-[13px] font-medium hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">done_all</span>
                <span className="hidden sm:inline">{ending ? "Ending..." : "End & email recap"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 pt-[76px] pb-[150px]">
          <div className="max-w-3xl mx-auto px-4 flex flex-col gap-5">
            {!rehydrating && latestAssistant && <LindaCue latestReply={latestAssistant} />}

            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] bg-primary-container text-on-primary rounded-3xl rounded-tr-md px-4 py-3 shadow-card">
                    <p className="font-body-md text-body-md whitespace-pre-line">{msg.content}</p>
                  </div>
                ) : (
                  <div className="flex gap-2.5 items-start">
                    <LindaAvatar size="sm" />
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      {/* Voice-first: player on top when available */}
                      {msg.audioUrl && (
                        <AudioPlayer
                          src={msg.audioUrl}
                          autoPlay={!!msg.autoplay && autoSpeak}
                          onAutoplayBlocked={() => showToast("Tap play to hear Ms. Linda.", "info")}
                        />
                      )}
                      {/* Text as an expandable transcript below, in short paragraphs */}
                      <details open className="bg-surface-container rounded-3xl rounded-tl-md px-4 py-3 border border-outline-variant">
                        <summary className="caps-label text-on-surface-variant/70 cursor-pointer select-none mb-1 list-none">
                          Transcript
                        </summary>
                        <div className="flex flex-col gap-2 pt-1">
                          {toParagraphs(msg.content).map((p, pi) => (
                            <p key={pi} className="font-body-md text-body-md text-on-surface whitespace-pre-line">{p}</p>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Staged status microcopy (P0-10), not static dots */}
            {loading && (
              <div className="flex gap-2.5 items-center">
                <LindaAvatar size="sm" speaking />
                <div className="bg-surface-container rounded-3xl rounded-tl-md px-4 py-3 border border-outline-variant flex items-center gap-2">
                  <div className="flex items-end gap-[3px] h-4" aria-hidden="true">
                    <span className="w-1 rounded-full bg-gold wave-bar h-2" />
                    <span className="w-1 rounded-full bg-gold wave-bar h-4" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1 rounded-full bg-gold wave-bar h-3" style={{ animationDelay: "0.3s" }} />
                  </div>
                  <span className="font-body-md text-[15px] text-on-surface-variant">
                    {THINKING_STAGES[thinkingIdx]}...
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Idle warning (P0-5) */}
        {idleWarn && !sessionEnded && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-[150px] z-50 w-[min(92vw,440px)]">
            <div className="hush-card bg-surface-container-high border border-gold/40 p-4 flex items-center gap-3 shadow-floating">
              <span className="material-symbols-outlined text-gold" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <p className="flex-1 font-body-md text-[15px]">Still there? This session will pause soon.</p>
              <button onClick={bumpActivity} className="btn-ghost h-10 px-4 text-[14px]">Keep going</button>
            </div>
          </div>
        )}

        {/* Bottom input bar: push-to-talk mic primary, text field secondary */}
        <div className="fixed bottom-0 right-0 left-0 md:left-64 z-40 bg-surface/90 backdrop-blur-md border-t border-outline-variant pb-safe">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {listening && (
              <div className="mb-2 px-4 py-2 rounded-2xl bg-tertiary-fixed/40 border border-gold/30 text-[15px] text-on-surface min-h-[40px] flex items-center">
                <span className="material-symbols-outlined text-gold mr-2 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                <span className="text-on-surface-variant">{interim || "Listening..."}</span>
              </div>
            )}

            {showTextField ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendCurrentMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus={textOpen}
                  className="input-field flex-1 py-3.5 px-4 font-body-md text-body-md min-h-[48px]"
                  placeholder={loading ? "Ms. Linda is thinking..." : "Type your response..."}
                  disabled={loading || rehydrating}
                />
                {micSupported && (
                  <button
                    type="button"
                    onClick={() => setTextOpen(false)}
                    aria-label="Switch to voice"
                    className="w-12 h-12 shrink-0 rounded-full bg-surface-container text-on-surface flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">graphic_eq</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || rehydrating || !input.trim()}
                  aria-label="Send"
                  className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setTextOpen(true)}
                  aria-label="Type instead"
                  className="w-12 h-12 shrink-0 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center active:scale-95"
                >
                  <span className="material-symbols-outlined">keyboard</span>
                </button>

                {/* Primary push-to-talk mic, >= 56px */}
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  disabled={loading || rehydrating}
                  aria-label={listening ? "Stop" : "Hold to talk"}
                  className={`w-[68px] h-[68px] shrink-0 rounded-full flex items-center justify-center shadow-floating transition-all active:scale-95 disabled:opacity-40 ${
                    listening
                      ? "bg-error text-on-error speaking-ring"
                      : "bg-gradient-to-br from-primary via-primary-container to-secondary-container text-on-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {listening ? "stop" : "mic"}
                  </span>
                </button>

                <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                  <span className="text-[12px] text-outline text-center leading-tight">tap to<br />speak</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
