import { ClimateStatistics } from "@/app/climate-statistics/_components/ClimateStatistics";
import { ROUTES } from "@/constants";
import { createPageMetadata, resolveClimateStatisticsMeta } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createPageMetadata(
  resolveClimateStatisticsMeta,
  ROUTES.CLIMATE_STATISTICS,
);

export default function ClimateStatisticsPage() {
  return (
    <Suspense>
      <ClimateStatistics />
    </Suspense>
  );
}
