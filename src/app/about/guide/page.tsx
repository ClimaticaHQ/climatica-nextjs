import { GuidePage as GuidePageContent } from "@/components/info";
import { ROUTES } from "@/constants";
import { createInfoPageMetadata } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createInfoPageMetadata("guide", ROUTES.ABOUT_GUIDE);

export default function GuidePage() {
  return (
    <Suspense>
      <GuidePageContent />
    </Suspense>
  );
}
