import type { TWalterLiethHatchGeometry } from "@/types";

export type THatchPatternsProps = {
  /** pattern ids — unique per SVG document */
  humid: string;
  arid: string;
  humidColor: string;
  aridColor: string;
  geometry: TWalterLiethHatchGeometry;
  /** x where the pattern tiles start — the plot's left edge, so lines align with months */
  originX: number;
};
