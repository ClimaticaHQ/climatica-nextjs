import { GuidePage as GuidePageContent, InfoFooter } from "@/components/info";
import { ROUTES } from "@/constants";
import { createInfoPageMetadata } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createInfoPageMetadata("guide", ROUTES.ABOUT_GUIDE);

export default function GuidePage() {
  return (
    <Suspense>
      <GuidePageContent />
      <InfoFooter />
    </Suspense>
  );
}
