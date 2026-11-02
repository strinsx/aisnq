import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const plusJakartaSans = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  weight: "200 800",
  variable: "--font-plus-jakarta",
  display: "swap",
});

const sourceSerif = localFont({
  src: "./fonts/source-serif-4-latin.woff2",
  weight: "200 900",
  variable: "--font-source-serif",
  display: "swap",
});

const robotoMono = localFont({
  src: "./fonts/roboto-mono-latin.woff2",
  weight: "100 700",
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AISNQ",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${sourceSerif.variable} ${robotoMono.variable}`}
    >
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
