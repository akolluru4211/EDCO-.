import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Experiences",
  description: "Real interview rounds, question archives, and company hiring insights shared by students.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
