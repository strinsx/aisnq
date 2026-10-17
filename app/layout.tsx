import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = localFont({
  src: "./fonts/playfair-display-latin.woff2",
  weight: "400 900",
  variable: "--font-playfair",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AISNQ",
  description: "A study space for turning learning material into useful notes and practice.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${jetBrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
