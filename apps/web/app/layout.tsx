import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who Am I — ฉันคือใคร?",
  description: "เกมทายตัวตนออนไลน์ เล่นกับเพื่อนแบบเรียลไทม์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
