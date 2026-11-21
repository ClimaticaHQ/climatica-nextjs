import { InfoLayout } from "@/components/info";
import { Suspense } from "react";

/** The Info pages' frame: their navigation beside the content, or a Contents bar on phones. */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <InfoLayout>{children}</InfoLayout>
    </Suspense>
  );
}
