import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Who Am I",
  description: "Online guessing game — play with friends in real time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
