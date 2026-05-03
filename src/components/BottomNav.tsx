"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Check", icon: "center_focus_strong", href: "/mode-select" },
  { label: "Coach", icon: "forum", href: "/chat" },
  { label: "Library", icon: "menu_book", href: "/library" },
  { label: "Settings", icon: "person", href: "/settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 pb-safe px-4 bg-white border-t border-neutral-100 shadow-[0_-4px_20px_0px_rgba(139,44,245,0.08)] z-50 rounded-t-3xl text-[11px] font-medium font-[family-name:var(--font-headline)]">
      {navItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center hover:text-primary transition-all active:scale-90 duration-150 gap-1 w-16 ${
              active ? "text-primary font-bold" : "text-neutral-400"
            }`}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
