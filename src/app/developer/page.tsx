import type { Metadata } from "next";
import DeveloperStudio from "@/components/dev/DeveloperStudio";

export const metadata: Metadata = {
  title: "Developer Studio",
  description: "منطقة المطوّر",
  robots: { index: false, follow: false },
};

export default function DeveloperPage() {
  return <DeveloperStudio />;
}
