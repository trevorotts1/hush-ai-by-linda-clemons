"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./navItems";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-stretch pb-safe px-2 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant z-50 text-[11px] font-medium">
      {navItems.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 min-h-[56px] pt-2 transition-all active:scale-90 duration-150 ${
              active ? "text-gold" : "text-outline"
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
