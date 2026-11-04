"use client";

import dynamic from "next/dynamic";

// * the figures' charts load with the figure, client-side only: Recharts measures the page, and
// * InfoFigure mounts them near the viewport. One module: both figures share its chunk
export const LazyWalterLiethFigureChart = dynamic(
  () => import("./FigureCharts").then(({ WalterLiethFigureChart }) => WalterLiethFigureChart),
  { ssr: false },
);

export const LazyIndicatorsFigureChart = dynamic(
  () => import("./FigureCharts").then(({ IndicatorsFigureChart }) => IndicatorsFigureChart),
  { ssr: false },
);
