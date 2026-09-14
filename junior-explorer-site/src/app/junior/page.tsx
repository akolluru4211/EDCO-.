import React from "react";
import JuniorExplorerLanding from "../../components/JuniorExplorerLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Junior School Track (Ages 13–15) | EdWorld Co.",
  description: "AI literacy, stream & subject guidance, curiosity quests, and private growth journal in a 100% safe workspace.",
};

export default function JuniorSubdomainPage() {
  return <JuniorExplorerLanding initialSector="junior" />;
}
