import { Suspense } from "react";
import { ComparePeriods } from "./_components/ComparePeriods";

export default function ComparePeriodsPage() {
  return (
    <Suspense>
      <ComparePeriods />
    </Suspense>
  );
}
