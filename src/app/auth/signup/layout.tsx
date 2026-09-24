import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join EdWorld",
  description: "Create your free EdWorld Co. account and accelerate your career readiness.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
