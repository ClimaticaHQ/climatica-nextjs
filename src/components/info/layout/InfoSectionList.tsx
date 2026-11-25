"use client";

import { SlidingIndicator } from "@/components/UI/SlidingIndicator";
import { SLIDING_INDICATOR_SELECTORS } from "@/constants";
import { ESlidingIndicatorAxis } from "@/enums";
import { useSlidingIndicator } from "@/hooks/ui/useSlidingIndicator";
import { useTranslations } from "next-intl";
import { INFO_NAV_CLASSES as C } from "../info.constant";
import type { TInfoSectionListProps } from "../info.type";

export function InfoSectionList({
  sections,
  activeId,
  onSectionClick,
  linkSizeClass,
}: TInfoSectionListProps) {
  const t = useTranslations();
  const { containerRef, indicator } = useSlidingIndicator<HTMLDivElement>({
    activeKey: activeId,
    activeSelector: SLIDING_INDICATOR_SELECTORS.SECTION,
  });
  const activeRuleClass = indicator ? C.SECTION_LINK_ACTIVE_BARRED : C.SECTION_LINK_ACTIVE_STATIC;

  return (
    <div ref={containerRef} className={C.SECTIONS_FRAME}>
      <SlidingIndicator
        indicator={indicator}
        axis={ESlidingIndicatorAxis.VERTICAL}
        className={C.SECTION_BAR}
        motionClass={C.SECTION_BAR_MOTION}
      />
      <ul className={C.SECTIONS}>
        {sections.map(({ id, labelKey }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => onSectionClick(event, id)}
                aria-current={isActive ? "location" : undefined}
                className={`${C.SECTION_LINK} ${linkSizeClass} ${isActive ? `${C.SECTION_LINK_ACTIVE} ${activeRuleClass}` : C.SECTION_LINK_IDLE}`}
              >
                {t(labelKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
