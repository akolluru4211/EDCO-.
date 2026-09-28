import type { Metadata } from "next";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Ed Mock Interview",
  description: "Practice multimodal behavioral and technical coding interviews with instant speech cadence and STAR analysis.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary moduleName="Mock Interview Suite">
      {children}
    </ErrorBoundary>
  );
}

