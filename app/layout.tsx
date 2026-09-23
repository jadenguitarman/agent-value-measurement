import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SignalDockPageView } from "../components/SignalDockPageView";

export const metadata: Metadata = {
  title: "Agent value, measured",
  description: "A synthetic, reproducible guide to connecting agent exposure with business value.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Suspense fallback={null}><SignalDockPageView /></Suspense>{children}</body>
    </html>
  );
}
