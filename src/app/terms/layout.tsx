import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using EdWorld Co. learning, career, and networking services.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
