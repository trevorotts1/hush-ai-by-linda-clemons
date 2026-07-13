"use client";

import { useEffect } from "react";

export type ToastKind = "error" | "info" | "success";

export default function Toast({
  message,
  kind = "error",
  onClose,
  duration = 5000,
}: {
  message: string;
  kind?: ToastKind;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const accent =
    kind === "error" ? "border-error text-error" :
    kind === "success" ? "border-gold text-gold" :
    "border-outline-variant text-on-surface";
  const icon = kind === "error" ? "error" : kind === "success" ? "check_circle" : "info";

  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom)+96px)] z-[100] w-[min(92vw,420px)]"
    >
      <div className={`hush-card ${accent} border bg-surface-container-high px-4 py-3 flex items-center gap-3 shadow-floating`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <p className="font-body-md text-[15px] text-on-surface flex-1">{message}</p>
        <button onClick={onClose} aria-label="Dismiss" className="text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
}
