import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";

// Plus Jakarta Sans — UI labels and body. Self-hosted by next/font at build time.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Fraunces — display serif for Linda's headlines, affirmations, and pull-quotes.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hush - AI Coaching by Linda Clemons",
  description:
    "Presence with Personality. Your voice-first AI coach for nonverbal communication mastery, guided by Ms. Linda Clemons.",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Material Symbols icon font (icon glyphs only). Loaded non-blocking. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} bg-background text-on-surface font-body-md min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
