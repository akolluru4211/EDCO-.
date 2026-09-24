import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Affordable access tiers for students, job seekers, and working professionals.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
