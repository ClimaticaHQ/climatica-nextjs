"use client";

import { ScrollEdgeFades } from "@/components/ScrollEdgeFades";
import { useScrollEdges } from "@/hooks/ui/useScrollEdges";
import { useRef } from "react";
import { CHIP_SCROLLER_CLASSES as C } from "./ChipScroller.constant";
import type { TChipScrollerProps } from "./ChipScroller.type";

export function ChipScroller({ contentKey, children }: TChipScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scrollerRef, contentKey);

  return (
    <div className={C.FRAME}>
      <div ref={scrollerRef} className={C.SCROLLER}>
        {children}
      </div>
      <ScrollEdgeFades {...edges} />
    </div>
  );
}
