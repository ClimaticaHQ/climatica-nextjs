import { HeatMap } from "@/app/heat-map/_components/HeatMap";
import { ROUTES } from "@/constants";
import { createPageMetadata, resolveHeatMapMeta } from "@/utils";
import { Suspense } from "react";

export const generateMetadata = createPageMetadata(resolveHeatMapMeta, ROUTES.HEAT_MAP);

export default function HeatMapPage() {
  return (
    <Suspense>
      <HeatMap />
    </Suspense>
  );
}
