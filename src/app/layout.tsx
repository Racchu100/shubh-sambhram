import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shubh Sambhram Events — Live Event Gaming Platform",
  description: "Experience Indian weddings, corporate get-togethers, and family events like never before with live, real-time multiplayer party games including Tambola, Boat Race, Treasure Hunt, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
