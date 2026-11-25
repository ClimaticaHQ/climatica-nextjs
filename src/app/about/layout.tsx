import { InfoLayout } from "@/components/info";
import { Suspense } from "react";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <InfoLayout>{children}</InfoLayout>
    </Suspense>
  );
}
