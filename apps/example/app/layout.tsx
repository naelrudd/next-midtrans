import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "next-midtrans example",
  description: "Typed Midtrans integration for Next.js App Router",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}