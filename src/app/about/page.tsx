import { AboutPage as AboutPageContent, InfoFooter } from "@/components/info";
import { ROUTES } from "@/constants";
import { createInfoPageMetadata } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createInfoPageMetadata("about", ROUTES.ABOUT);

export default function AboutPage() {
  return (
    <Suspense>
      <AboutPageContent />
      <InfoFooter />
    </Suspense>
  );
}
