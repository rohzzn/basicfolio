import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Frames",
  description: "An archive of images I liked.",
};

export default function FramesLayout({ children }: { children: ReactNode }) {
  return children;
}
