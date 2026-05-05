import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Seen",
  description: "An archive of images I liked.",
};

export default function SeenLayout({ children }: { children: ReactNode }) {
  return children;
}
