"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./navItems";
import LindaAvatar from "./LindaAvatar";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant z-40">
      <div className="p-6 flex flex-col items-center border-b border-outline-variant">
        <LindaAvatar size="lg" />
        <h1 className="mt-4 text-2xl font-serif font-semibold text-on-surface">Hush</h1>
        <p className="text-sm text-on-surface-variant mt-1">Presence with Personality</p>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3.5 min-h-[44px] transition-all duration-200 font-medium ${
                    active
                      ? "text-gold border-r-[3px] border-gold bg-tertiary-fixed/20"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span
                    className="material-symbols-outlined mr-4"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-6 border-t border-outline-variant">
        <p className="caps-label text-outline">Ms. Linda Clemons</p>
      </div>
    </nav>
  );
}
