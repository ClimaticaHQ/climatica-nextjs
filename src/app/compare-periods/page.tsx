import { ComparePeriods } from "@/app/compare-periods/_components/ComparePeriods";
import { ROUTES } from "@/constants";
import { createPageMetadata, resolveComparePeriodsMeta } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createPageMetadata(
  resolveComparePeriodsMeta,
  ROUTES.COMPARE_PERIODS,
);

export default function ComparePeriodsPage() {
  return (
    <Suspense>
      <ComparePeriods />
    </Suspense>
  );
}
