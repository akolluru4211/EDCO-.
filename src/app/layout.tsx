import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import AppShell from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.edworld.co.in"),
  title: {
    default: "EdWorld Co. — Career & Skills Platform",
    template: "%s — EdWorld Co.",
  },
  description:
    "EdWorld Co. is a student-focused education, networking, career readiness and opportunities platform for learners from 9th grade to B.Tech/M.Tech, researchers, and professionals.",
  keywords: [
    "EdWorld Co",
    "EdWorld",
    "Career Readiness",
    "ATS Resume Maker",
    "AI Mock Interviews",
    "Student Network",
    "Job Board",
    "Skill Calibration",
    "Interview Practice",
    "Project Studio",
  ],
  authors: [{ name: "EdWorld Co. Team", url: "https://www.edworld.co.in" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.edworld.co.in",
    siteName: "EdWorld Co.",
    title: "EdWorld Co. — Career & Skills Platform",
    description:
      "Student-focused education, networking, ATS Resume Maker, and Adaptive Mock Interviews.",
    images: [
      {
        url: "/images/edworld-logo.png",
        width: 800,
        height: 800,
        alt: "EdWorld Co. Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EdWorld Co. — Career & Skills Platform",
    description: "Adaptive AI mock interviews, ATS resume optimization, and curated opportunities for students.",
    images: ["/images/edworld-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} scroll-smooth font-sans`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased selection:bg-forest selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
