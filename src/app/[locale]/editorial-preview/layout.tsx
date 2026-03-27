import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Internal design preview — not for search indexing. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EditorialPreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
