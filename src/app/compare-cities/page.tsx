import { CompareCities } from "@/app/compare-cities/_components/CompareCities";
import { ROUTES } from "@/constants";
import { createPageMetadata, resolveCompareCitiesMeta } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createPageMetadata(resolveCompareCitiesMeta, ROUTES.COMPARE_CITIES);

export default function CompareCitiesPage() {
  return (
    <Suspense>
      <CompareCities />
    </Suspense>
  );
}
