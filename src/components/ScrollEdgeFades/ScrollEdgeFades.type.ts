import type { TScrollEdges } from "@/types";

export type TScrollEdgeFadesProps = TScrollEdges & {
  /** where the start fade begins — past a pinned column; the scroller's edge when omitted */
  startInset?: string;
};
