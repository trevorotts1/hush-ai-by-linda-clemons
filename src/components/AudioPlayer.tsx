"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function fmt(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const BAR_COUNT = 24;

/**
 * Real audio player (spec 3.1): play/pause, progress scrubber, elapsed/total
 * time, and an amplitude-reactive waveform driven by a WebAudio analyser.
 * Falls back to a static bar when prefers-reduced-motion is set or WebAudio is
 * unavailable. Attempts autoplay when `autoPlay` is set; if the browser blocks
 * it, the visible play control remains the "tap to hear" affordance.
 */
export default function AudioPlayer({
  src,
  autoPlay = false,
  label = "Ms. Linda",
  onAutoplayBlocked,
}: {
  src: string;
  autoPlay?: boolean;
  label?: string;
  onAutoplayBlocked?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const triedAutoplay = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => new Array(BAR_COUNT).fill(0.35));
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const setupAnalyser = useCallback(() => {
    if (reduced || ctxRef.current || !audioRef.current) return;
    try {
      const Ctor = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const source = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // WebAudio unavailable -> waveform falls back to CSS animation.
    }
  }, [reduced]);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    setupAnalyser();
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
    try {
      await el.play();
    } catch {
      onAutoplayBlocked?.();
    }
  }, [setupAnalyser, onAutoplayBlocked]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) void play();
    else el.pause();
  }, [play]);

  // Attempt autoplay once when src is ready.
  useEffect(() => {
    if (autoPlay && !triedAutoplay.current && src) {
      triedAutoplay.current = true;
      void play();
    }
  }, [autoPlay, src, play]);

  // Drive the reactive waveform only while playing.
  useEffect(() => {
    if (!playing || reduced) return;
    const loop = () => {
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const next: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const v = data[i % data.length] / 255;
          next.push(0.2 + v * 0.8);
        }
        setLevels(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, reduced]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    const t = Number(e.target.value);
    el.currentTime = t;
    setCurrent(t);
  }

  return (
    <div className="hush-card p-3 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : `Play ${label}`}
        className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          {playing ? "pause" : "play_arrow"}
        </span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-[3px] h-7 mb-1" aria-hidden="true">
          {levels.map((lv, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full ${playing && !reduced ? "" : playing ? "wave-bar" : ""}`}
              style={{
                height: `${Math.max(12, lv * 100)}%`,
                background: "linear-gradient(to top, var(--color-gold-dim), var(--color-gold))",
                opacity: playing ? 1 : 0.45,
                transition: reduced ? undefined : "height 90ms linear",
                animationDelay: `${(i % 6) * 0.08}s`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(current, duration || 0)}
            onChange={onSeek}
            aria-label="Seek"
            className="flex-1 h-1 accent-[var(--color-gold)] cursor-pointer"
          />
          <span className="text-[11px] tabular-nums text-on-surface-variant shrink-0">
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
