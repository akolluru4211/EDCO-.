import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission, adaptivity engine, and child safety standards behind EdWorld Co.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
