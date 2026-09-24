import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ed Profile",
  description: "Manage your professional identity, contact details, and account security settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
