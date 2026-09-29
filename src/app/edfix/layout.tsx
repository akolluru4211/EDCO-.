import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EdFix — Curated Real-World Problem Solution Board | EdWorld",
  description: "Browse verified engineering, AI, systems, and product challenges. Build production solutions, submit proofs, and earn placement reputation.",
};

export default function EdFixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
