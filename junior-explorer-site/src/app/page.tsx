import React from "react";
import JuniorExplorerLanding from "../components/JuniorExplorerLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EdWorld Junior & Explorer | Discovery & High School Learning",
  description: "AI literacy, subject exploration, and real project development for middle and high school students (Ages 13–18).",
};

export default function StandaloneHomePage() {
  return <JuniorExplorerLanding initialSector="junior" />;
}
