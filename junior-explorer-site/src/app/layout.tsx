import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EdWorld Junior & Explorer | Discovery & High School Learning",
  description: "AI literacy, subject exploration, and real project development for middle and high school students (Ages 13–18).",
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
