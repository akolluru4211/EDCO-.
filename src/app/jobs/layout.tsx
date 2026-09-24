import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs & Opportunities",
  description: "Discover verified student internships, campus placements, and full-time technical opportunities.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
