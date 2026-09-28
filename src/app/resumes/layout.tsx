import type { Metadata } from "next";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Ed Resume",
  description: "Single-column ATS resume builder calibrated to pass corporate screening filters with real-time scoring.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary moduleName="Resume Studio">
      {children}
    </ErrorBoundary>
  );
}

