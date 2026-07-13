// Single source of truth for navigation. BottomNav (mobile) and Sidebar (desktop)
// both consume this so destinations AND labels stay identical (spec S5).
export interface NavItem {
  label: string;
  icon: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Focus", icon: "center_focus_strong", href: "/mode-select" },
  { label: "Coach", icon: "forum", href: "/chat" },
  { label: "Library", icon: "menu_book", href: "/library" },
  { label: "Progress", icon: "insights", href: "/progress" },
  { label: "Settings", icon: "settings", href: "/settings" },
];
