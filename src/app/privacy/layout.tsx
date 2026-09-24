import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "EdWorld Co. privacy policy, student data safety, and DPDP compliance commitments.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
