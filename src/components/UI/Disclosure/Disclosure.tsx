"use client";

import { ChevronDownIcon } from "@/components/svg";
import { EDisclosureSize } from "@/enums";
import { useDisclosureMotion } from "@/hooks/ui/useDisclosureMotion";
import { DISCLOSURE_CLASSES as C } from "./Disclosure.constant";
import type { TDisclosureProps } from "./Disclosure.type";

export function Disclosure({ summary, id, size = EDisclosureSize.MD, children }: TDisclosureProps) {
  const { detailsRef, contentRef, isExpanded, handleSummaryClick, handleToggle } =
    useDisclosureMotion();

  return (
    <details
      ref={detailsRef}
      id={id}
      className={C.ROOT}
      data-expanded={isExpanded}
      onToggle={handleToggle}
    >
      <summary
        className={`${C.SUMMARY} ${C.SIZE[size].SUMMARY}`}
        data-disclosure-size={size}
        onClick={handleSummaryClick}
      >
        {summary}
        <span className={`${C.CHEVRON} ${C.SIZE[size].CHEVRON}`}>
          <ChevronDownIcon open={false} />
        </span>
      </summary>
      <div ref={contentRef}>
        <div className={C.CONTENT}>{children}</div>
      </div>
    </details>
  );
}
