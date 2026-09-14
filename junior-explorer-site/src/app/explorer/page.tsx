import React from "react";
import JuniorExplorerLanding from "../../components/JuniorExplorerLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorer Track (Ages 16–18) | EdWorld Co.",
  description: "Low-pressure communication training, scholarship and exam finder, honest college comparisons, and guided micro-projects.",
};

export default function ExplorerSubdomainPage() {
  return <JuniorExplorerLanding initialSector="explorer" />;
}
