"use client";

import { SlidingIndicator } from "@/components/UI/SlidingIndicator";
import { INDICATOR_ACTIVE_ATTRIBUTE, SLIDING_INDICATOR_SELECTORS } from "@/constants";
import { ESlidingIndicatorAxis } from "@/enums";
import { useSlidingIndicator } from "@/hooks/ui/useSlidingIndicator";
import Link from "next/link";
import { TOPBAR_LINK_CLASSES as L } from "./Topbar.constant";
import type { TTopbarLinksProps } from "./Topbar.type";

export function TopbarLinks({ links, navRef, isCollapsed }: TTopbarLinksProps) {
  const { containerRef, indicator } = useSlidingIndicator<HTMLDivElement>({
    activeKey: links.find(({ isHighlighted }) => isHighlighted)?.key ?? null,
    activeSelector: SLIDING_INDICATOR_SELECTORS.MARKED,
  });

  return (
    <nav
      ref={navRef}
      inert={isCollapsed}
      className={`${L.DESKTOP_ROW} ${isCollapsed ? L.DESKTOP_ROW_COLLAPSED : ""}`}
    >
      <div ref={containerRef} className={L.DESKTOP_LIST}>
        <SlidingIndicator
          indicator={indicator}
          axis={ESlidingIndicatorAxis.BOTH}
          className={L.DESKTOP_PILL}
          motionClass={L.DESKTOP_PILL_MOTION}
        />
        {links.map(({ key, href, label, isActive, isHighlighted, onNavigate }) => (
          <Link
            key={key}
            href={href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            aria-current={isActive ? "page" : undefined}
            {...{ [INDICATOR_ACTIVE_ATTRIBUTE]: isHighlighted }}
            className={`${L.DESKTOP} ${isHighlighted ? `${L.DESKTOP_ACTIVE} ${indicator ? "" : L.DESKTOP_ACTIVE_STATIC}` : L.IDLE}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
