import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network & Community",
  description: "Connect with students, alumni mentors, and student engineers across colleges nationwide.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
