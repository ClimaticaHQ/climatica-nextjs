"use client";

import { Collapsible } from "@/components/UI/Collapsible";
import { SlidingIndicator } from "@/components/UI/SlidingIndicator";
import { INDICATOR_ACTIVE_ATTRIBUTE, SLIDING_INDICATOR_SELECTORS } from "@/constants";
import { ESlidingIndicatorAxis } from "@/enums";
import { useSlidingIndicator } from "@/hooks/ui/useSlidingIndicator";
import { getFoldedRect } from "@/utils/slidingIndicator.util";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { INFO_NAV_CLASSES as C } from "../info.constant";
import type { TInfoNavTreeProps } from "../info.type";
import { InfoSectionList } from "./InfoSectionList";

export function InfoNavTree({
  pages,
  currentRoute,
  openRoute,
  activeId,
  getPageHref,
  onSectionClick,
  onPageClick,
  hasLargeTargets,
}: TInfoNavTreeProps) {
  const t = useTranslations();
  const size = hasLargeTargets ? C.LARGE : C.REGULAR;
  const { containerRef, indicator } = useSlidingIndicator<HTMLDivElement>({
    activeKey: openRoute,
    activeSelector: SLIDING_INDICATOR_SELECTORS.MARKED,
    toTargetRect: getFoldedRect,
  });

  return (
    <div ref={containerRef} className={C.PAGES_FRAME}>
      <SlidingIndicator
        indicator={indicator}
        axis={ESlidingIndicatorAxis.BOTH}
        className={C.PAGE_PILL}
        motionClass={C.PAGE_PILL_MOTION}
      />
      <ul className={C.PAGES}>
        {pages.map(({ route, labelKey, sections }) => {
          const isOpen = route === openRoute;
          const isCurrent = route === currentRoute;
          const shown = sections.filter(({ isShown }) => isShown);
          const listActiveId = isCurrent ? activeId : isOpen ? (shown[0]?.id ?? null) : null;
          const activeClass = `${C.PAGE_LINK_ACTIVE} ${indicator ? "" : C.PAGE_LINK_ACTIVE_STATIC}`;
          return (
            <li key={route}>
              <Link
                href={getPageHref(route)}
                onClick={(event) => onPageClick(event, route)}
                aria-current={isCurrent ? "page" : undefined}
                {...{ [INDICATOR_ACTIVE_ATTRIBUTE]: isOpen }}
                className={`${C.PAGE_LINK} ${size.PAGE_LINK} ${isOpen ? activeClass : C.PAGE_LINK_IDLE}`}
              >
                {t(labelKey)}
              </Link>
              {shown.length > 0 && (
                <Collapsible isOpen={isOpen}>
                  <InfoSectionList
                    sections={shown}
                    activeId={listActiveId}
                    onSectionClick={onSectionClick}
                    linkSizeClass={size.SECTION_LINK}
                  />
                </Collapsible>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
