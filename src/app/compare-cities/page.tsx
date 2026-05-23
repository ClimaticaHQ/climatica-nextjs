import { Suspense } from "react";
import { CompareCities } from "./_components/CompareCities";

export default function CompareCitiesPage() {
  return (
    <Suspense>
      <CompareCities />
    </Suspense>
  );
}
