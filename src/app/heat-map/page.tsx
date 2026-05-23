import { Suspense } from "react";
import { HeatMap } from "./_components/HeatMap";

export default function HeatMapPage() {
  return (
    <Suspense>
      <HeatMap />
    </Suspense>
  );
}
