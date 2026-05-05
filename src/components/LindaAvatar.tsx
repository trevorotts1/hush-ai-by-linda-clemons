export default function LindaAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-[11px]" : size === "lg" ? "w-16 h-16 text-lg" : "w-10 h-10 text-sm";

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-container via-primary to-secondary text-on-primary flex items-center justify-center shrink-0 overflow-hidden shadow-card ring-2 ring-white font-headline-md font-black tracking-tight`}
      aria-label="Ms. Linda avatar"
    >
      LC
    </div>
  );
}
