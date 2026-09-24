import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Grievance",
  description: "Get in touch with the EdWorld Co. support and grievance redressal team.",
};

export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
