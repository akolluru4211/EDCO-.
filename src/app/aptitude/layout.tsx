import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aptitude & Logic Drills",
  description: "Daily quantitative aptitude, logical reasoning, and computer science problem-solving drills.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
