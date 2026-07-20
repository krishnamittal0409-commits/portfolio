import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krishna Mittal — Full-Stack Developer / AI Prompt Engineer",
  description:
    "Portfolio of Krishna Mittal, a full-stack developer and AI prompt engineer building responsive web apps with React, Next.js, and WordPress.",
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
