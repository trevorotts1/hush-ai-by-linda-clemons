"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Coach", icon: "forum", href: "/chat" },
  { label: "Library", icon: "auto_stories", href: "/library" },
  { label: "Progress", icon: "insights", href: "/progress" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 shadow-xl z-40">
      <div className="p-6 flex flex-col items-center border-b border-slate-100">
        <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4 overflow-hidden">
          <span className="material-symbols-outlined text-3xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            psychology
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-primary font-[family-name:var(--font-headline)]">
          Hush Coach
        </h1>
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
                  className={`flex items-center px-6 py-4 transition-all duration-300 font-medium font-[family-name:var(--font-headline)] ${
                    active
                      ? "text-primary border-r-4 border-primary bg-primary-fixed/10"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
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
    </nav>
  );
}
