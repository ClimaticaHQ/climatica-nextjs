import { DataPage as DataPageContent, InfoFooter } from "@/components/info";
import { Suspense } from "react";
import { ROUTES } from "@/constants";
import { createInfoPageMetadata } from "@/utils";

export const generateMetadata = createInfoPageMetadata("data", ROUTES.ABOUT_DATA);

export default function DataMethodsPage() {
  return (
    <Suspense>
      <DataPageContent />
      <InfoFooter />
    </Suspense>
  );
}
