import { Suspense } from "react";
import { ClimateStatistics } from "../_components/ClimateStatistics";

export default function ClimateStatisticsSearchPage() {
  return (
    <Suspense>
      <ClimateStatistics />
    </Suspense>
  );
}
