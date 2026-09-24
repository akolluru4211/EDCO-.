import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ed Projects",
  description: "Showcase real engineering projects with verified GitHub repositories and live deployments.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
