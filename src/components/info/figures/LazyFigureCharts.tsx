"use client";

import dynamic from "next/dynamic";
import { IndicatorsFigureSkeleton, WalterLiethFigureSkeleton } from "./FigureFrames";

// * client-side only: Recharts measures the page
export const LazyWalterLiethFigureChart = dynamic(
  () => import("./FigureCharts").then(({ WalterLiethFigureChart }) => WalterLiethFigureChart),
  { ssr: false, loading: () => <WalterLiethFigureSkeleton /> },
);

export const LazyIndicatorsFigureChart = dynamic(
  () => import("./FigureCharts").then(({ IndicatorsFigureChart }) => IndicatorsFigureChart),
  { ssr: false, loading: () => <IndicatorsFigureSkeleton /> },
);
