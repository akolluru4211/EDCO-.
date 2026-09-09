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
  metadataBase: new URL("https://edworld.co"),
  title: "Edworld Co — Personalized Career-Readiness & Skills Growth Platform",
  description:
    "From Class 9 school students building early foundations to adult job-seekers landing senior roles — Edworld Co adapts ATS resumes and mock interviews to your proven effective level.",
  keywords: [
    "Career Readiness",
    "ATS Resume Maker",
    "AI Mock Interviews",
    "Job Board",
    "Skill Calibration",
    "Student Safety",
    "Interview Practice",
  ],
  authors: [{ name: "Edworld Co Team", url: "https://edworld.co" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/images/edworld-logo.png",
    shortcut: "/images/edworld-logo.png",
    apple: "/images/edworld-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edworld.co",
    siteName: "Edworld Co",
    title: "Edworld Co — Real Adaptivity for Every Career Stage",
    description:
      "Personalized career readiness, ATS Resume Maker, and Adaptive Mock Interviews tailored to individual skill levels and age-band safety.",
    images: [
      {
        url: "/images/edworld-logo.png",
        width: 800,
        height: 800,
        alt: "Edworld Co Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edworld Co — Adaptive Career Readiness Platform",
    description: "Adaptive AI mock interviews, ATS resume optimization, and curated job board for every career stage.",
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
