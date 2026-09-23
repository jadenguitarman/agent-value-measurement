import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent value, measured",
  description: "A synthetic, reproducible guide to connecting agent exposure with business value.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
